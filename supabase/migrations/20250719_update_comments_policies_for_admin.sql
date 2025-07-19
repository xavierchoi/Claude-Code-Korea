-- Drop existing update policies
DROP POLICY IF EXISTS "Authors can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

-- Create new update policy that allows admins to update any comment
CREATE POLICY "Users can update their own comments or admins can update any" ON comments
  FOR UPDATE
  USING (
    auth.uid() = author_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );