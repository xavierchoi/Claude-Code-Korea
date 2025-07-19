-- Enable realtime for tables that need real-time updates
-- This allows Supabase Realtime to broadcast changes to these tables

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Optional: Enable replica identity for better change tracking
-- This ensures that all columns are included in the change events
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE posts REPLICA IDENTITY FULL;
ALTER TABLE likes REPLICA IDENTITY FULL;
ALTER TABLE follows REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;