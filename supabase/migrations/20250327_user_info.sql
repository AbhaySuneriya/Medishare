
-- This function allows safe access to user information without needing direct access to auth.users
CREATE OR REPLACE FUNCTION get_user_info(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_data JSON;
BEGIN
    SELECT 
        json_build_object(
            'id', id,
            'email', email,
            'display_name', display_name,
            'phone_number', phone_number,
            'address', address,
            'avatar_url', avatar_url,
            'created_at', created_at,
            'updated_at', updated_at
        ) INTO user_data
    FROM public.auth_users_info
    WHERE id = user_id;
    
    RETURN user_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_info TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_info TO anon;
