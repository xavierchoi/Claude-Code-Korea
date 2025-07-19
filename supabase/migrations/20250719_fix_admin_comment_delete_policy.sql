-- Fix RLS policies for admin comment deletion
-- The issue: UPDATE policy needs WITH CHECK clause to allow admins to soft delete comments

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own comments or admins can update any" ON comments;

-- Create new update policy with proper WITH CHECK clause
CREATE POLICY "Users can update their own comments or admins can update any" ON comments
  FOR UPDATE
  USING (
    -- Who can select rows to update
    auth.uid() = author_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    -- What values are allowed after update
    auth.uid() = author_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Also fix the INSERT policy to not block soft-deleted comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    -- Remove the is_deleted = false constraint that was blocking updates
  );

-- Optional: Add a specific policy for soft deletes to make intent clearer
CREATE POLICY "Admins can soft delete any comment" ON comments
  FOR UPDATE
  USING (
    -- Admin check
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
    -- Only for soft delete operations
    AND is_deleted = false
  )
  WITH CHECK (
    -- Admin check
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
    -- Only allow setting is_deleted to true
    AND is_deleted = true
  );

-- Add comment explaining the policies
COMMENT ON POLICY "Users can update their own comments or admins can update any" ON comments IS 
'Allows users to update their own comments and admins to update any comment. Both USING and WITH CHECK are required for UPDATE operations.';

COMMENT ON POLICY "Admins can soft delete any comment" ON comments IS 
'Specific policy allowing admins to soft delete (set is_deleted=true) any comment.';