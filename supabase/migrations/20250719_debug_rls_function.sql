-- Create a debug function to check auth context
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    result = jsonb_build_object(
        'auth_uid', auth.uid(),
        'auth_role', auth.role(),
        'auth_email', auth.email(),
        'auth_jwt', auth.jwt()
    );
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_auth_context() TO authenticated;