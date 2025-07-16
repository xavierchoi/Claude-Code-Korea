-- Categories RLS policies
-- Everyone can view active categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = true);

-- Only admins can manage categories (we'll implement admin check later)
CREATE POLICY "Only admins can insert categories" ON categories
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING (false);

CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (false);

-- Posts RLS policies
-- Everyone can view published posts
CREATE POLICY "Published posts are viewable by everyone" ON posts
  FOR SELECT USING (is_published = true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own posts (soft delete recommended)
CREATE POLICY "Authors can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Comments RLS policies
-- Everyone can view comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
CREATE POLICY "Authors can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Code snippets RLS policies
-- Everyone can view public snippets
CREATE POLICY "Public snippets are viewable by everyone" ON code_snippets
  FOR SELECT USING (is_public = true OR auth.uid() = author_id);

-- Authenticated users can create snippets
CREATE POLICY "Authenticated users can create snippets" ON code_snippets
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own snippets
CREATE POLICY "Authors can update their own snippets" ON code_snippets
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own snippets
CREATE POLICY "Authors can delete their own snippets" ON code_snippets
  FOR DELETE USING (auth.uid() = author_id);

-- Projects RLS policies
-- Everyone can view projects
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own projects
CREATE POLICY "Authors can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own projects
CREATE POLICY "Authors can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = author_id);

-- Likes RLS policies
-- Everyone can view likes
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

-- Authenticated users can create likes
CREATE POLICY "Authenticated users can create likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Follows RLS policies
-- Everyone can view follows
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

-- Authenticated users can create follows
CREATE POLICY "Authenticated users can create follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Notifications RLS policies
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);