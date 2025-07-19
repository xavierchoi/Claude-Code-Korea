-- Simplify comment UPDATE policies to fix admin delete issue
-- Remove all existing UPDATE policies first

DROP POLICY IF EXISTS "Users can update their own comments or admins can update any" ON comments;
DROP POLICY IF EXISTS "Admins can soft delete any comment" ON comments;

-- Create a single, comprehensive UPDATE policy
CREATE POLICY "Update comments policy" ON comments
  FOR UPDATE
  USING (
    -- Users can select their own comments OR admins can select any comment
    auth.uid() = author_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    -- Allow updates if:
    -- 1. User is updating their own comment (any field)
    -- 2. Admin is updating any comment (any field)
    auth.uid() = author_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Update comments policy" ON comments IS 
'Single comprehensive policy allowing users to update their own comments and admins to update any comment. This includes soft deletes.';