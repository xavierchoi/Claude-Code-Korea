-- Create RPC function for admin comment deletion
-- This bypasses RLS for admin operations while maintaining security

CREATE OR REPLACE FUNCTION admin_delete_comment(
    comment_id UUID,
    admin_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Run with creator's privileges
SET search_path = public
AS $$
DECLARE
    is_admin_user boolean;
BEGIN
    -- First verify the user is actually an admin
    SELECT is_admin INTO is_admin_user
    FROM profiles
    WHERE id = admin_id;
    
    -- If not admin, reject
    IF NOT is_admin_user OR is_admin_user IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User is not an admin';
    END IF;
    
    -- Also verify this is the authenticated user
    IF auth.uid() != admin_id THEN
        RAISE EXCEPTION 'Unauthorized: Admin ID does not match authenticated user';
    END IF;
    
    -- Perform the soft delete
    UPDATE comments
    SET 
        is_deleted = true,
        deleted_at = NOW()
    WHERE id = comment_id
    AND is_deleted = false; -- Only delete if not already deleted
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$$;

-- Grant execute permission only to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_comment(UUID, UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION admin_delete_comment IS 
'Allows admins to soft delete any comment. Includes security checks to verify admin status and authentication.';