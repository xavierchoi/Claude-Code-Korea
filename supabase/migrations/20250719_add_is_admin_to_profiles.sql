-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create index for admin users
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Grant admin role to specific users based on user_metadata.role
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin'
);

-- Create function to sync admin status from user_metadata
CREATE OR REPLACE FUNCTION sync_user_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update is_admin based on user_metadata.role
  UPDATE profiles
  SET is_admin = (NEW.raw_user_meta_data->>'role' = 'admin')
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync admin status on user update
DROP TRIGGER IF EXISTS sync_user_admin_status_trigger ON auth.users;
CREATE TRIGGER sync_user_admin_status_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_admin_status();

-- Also update existing users' admin status
UPDATE profiles p
SET is_admin = (u.raw_user_meta_data->>'role' = 'admin')
FROM auth.users u
WHERE p.id = u.id;