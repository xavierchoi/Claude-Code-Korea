-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, position) VALUES
  ('일반', 'general', 'Claude와 관련된 일반적인 토론', '💬', '#6B7280', 1),
  ('질문 & 답변', 'qna', 'Claude 사용법과 관련된 질문과 답변', '❓', '#3B82F6', 2),
  ('팁 & 트릭', 'tips', 'Claude를 더 효과적으로 사용하는 팁', '💡', '#10B981', 3),
  ('프롬프트 공유', 'prompts', '효과적인 프롬프트 공유', '📝', '#8B5CF6', 4),
  ('버그 & 이슈', 'bugs', '버그 리포트 및 이슈 토론', '🐛', '#EF4444', 5),
  ('기능 요청', 'features', '새로운 기능 제안 및 요청', '✨', '#F59E0B', 6);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
  CASE table_name
    WHEN 'posts' THEN
      UPDATE posts SET view_count = view_count + 1 WHERE id = record_id;
    WHEN 'code_snippets' THEN
      UPDATE code_snippets SET view_count = view_count + 1 WHERE id = record_id;
    WHEN 'projects' THEN
      UPDATE projects SET view_count = view_count + 1 WHERE id = record_id;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update like counts when likes are added/removed
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    CASE NEW.likeable_type
      WHEN 'post' THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
      WHEN 'comment' THEN
        UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
      WHEN 'code_snippet' THEN
        UPDATE code_snippets SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
      WHEN 'project' THEN
        UPDATE projects SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
    END CASE;
  ELSIF TG_OP = 'DELETE' THEN
    CASE OLD.likeable_type
      WHEN 'post' THEN
        UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
      WHEN 'comment' THEN
        UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
      WHEN 'code_snippet' THEN
        UPDATE code_snippets SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
      WHEN 'project' THEN
        UPDATE projects SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_like_counts_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Function to update comment count when comments are added/removed
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_type text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_type, p_related_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  slug := lower(title);
  slug := regexp_replace(slug, '[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]', '', 'g');
  slug := regexp_replace(slug, '[\s-]+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Add random suffix to ensure uniqueness
  slug := slug || '-' || substring(gen_random_uuid()::text, 1, 8);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;