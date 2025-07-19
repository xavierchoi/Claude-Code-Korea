-- Fix the sync_user_admin_status function to handle missing profiles gracefully
CREATE OR REPLACE FUNCTION sync_user_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if profile exists (wait for handle_new_user to create it first)
  UPDATE profiles
  SET is_admin = (NEW.raw_user_meta_data->>'role' = 'admin')
  WHERE id = NEW.id;
  
  -- Don't throw error if no rows updated (profile might not exist yet)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to ensure it fires AFTER handle_new_user
DROP TRIGGER IF EXISTS sync_user_admin_status_trigger ON auth.users;

-- Create trigger with AFTER to ensure it runs after handle_new_user
CREATE TRIGGER sync_user_admin_status_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_admin_status();