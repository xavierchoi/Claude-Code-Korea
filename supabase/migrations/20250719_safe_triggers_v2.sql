-- Safe triggers implementation with comprehensive error handling and search_path
-- This migration creates bulletproof triggers that won't break authentication

-- Step 1: Create a more robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    _username text;
    _full_name text;
    _avatar_url text;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_new_user trigger executing for user: %', NEW.id;
    
    -- Safely extract metadata with null checks
    _username := COALESCE(
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'user_name',
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.email
    );
    
    _avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    
    -- Try to insert or update profile with comprehensive error handling
    BEGIN
        INSERT INTO public.profiles (
            id, 
            username, 
            full_name, 
            avatar_url,
            is_admin
        ) VALUES (
            NEW.id,
            _username,
            _full_name,
            _avatar_url,
            COALESCE((NEW.raw_user_meta_data->>'role') = 'admin', false)
        )
        ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            full_name = EXCLUDED.full_name,
            avatar_url = EXCLUDED.avatar_url,
            is_admin = COALESCE((NEW.raw_user_meta_data->>'role') = 'admin', false),
            updated_at = now();
            
        RAISE LOG 'Profile created/updated successfully for user: %', NEW.id;
        
    EXCEPTION 
        WHEN OTHERS THEN
            -- Log the specific error but don't fail the authentication
            RAISE WARNING 'Failed to create/update profile for user % (%, %): %', 
                NEW.id, NEW.email, _username, SQLERRM;
            
            -- Even if profile creation fails, we don't want to break authentication
            -- The user can still login and we can handle missing profiles in the app
    END;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Ultimate fallback - log error but never fail the trigger
        RAISE WARNING 'Critical error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 2: Create simplified admin sync function (optional, runs after profile creation)
CREATE OR REPLACE FUNCTION public.sync_user_admin_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only try to update if we're confident the profile exists
    -- This is separate from handle_new_user to avoid race conditions
    BEGIN
        UPDATE public.profiles
        SET 
            is_admin = COALESCE((NEW.raw_user_meta_data->>'role') = 'admin', false),
            updated_at = now()
        WHERE id = NEW.id;
        
        -- Only log if no rows were updated (profile might not exist yet)
        IF NOT FOUND THEN
            RAISE LOG 'No profile found to update admin status for user: %', NEW.id;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE LOG 'Failed to sync admin status for user %: %', NEW.id, SQLERRM;
            -- Don't fail the trigger even if this update fails
    END;
    
    RETURN NEW;
END;
$$;

-- Step 3: Recreate triggers with proper ordering
-- First trigger: Create/update profile (most important)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Second trigger: Sync admin status on updates (lower priority)
DROP TRIGGER IF EXISTS sync_user_admin_status_trigger ON auth.users;
CREATE TRIGGER sync_user_admin_status_trigger
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.sync_user_admin_status();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- Step 5: Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 
'Bulletproof trigger function that creates user profiles on auth.users insert. Uses comprehensive error handling to never break authentication flow.';

COMMENT ON FUNCTION public.sync_user_admin_status() IS 
'Optional trigger function that syncs admin status from user_metadata to profiles table. Runs independently of profile creation.';