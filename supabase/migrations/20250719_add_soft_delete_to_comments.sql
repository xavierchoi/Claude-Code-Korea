-- Add soft delete columns to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create index for non-deleted comments
CREATE INDEX IF NOT EXISTS idx_comments_not_deleted ON comments(is_deleted) WHERE is_deleted = false;

-- Update RLS policies to filter out deleted comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (is_deleted = false);

-- Update existing insert policy to prevent inserting as deleted
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id AND is_deleted = false);

-- Update existing update policy
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Note: We don't create a DELETE policy because we're using soft deletes via UPDATE