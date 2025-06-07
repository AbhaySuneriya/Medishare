
-- Create a function to count user donations
CREATE OR REPLACE FUNCTION get_user_donation_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    donation_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO donation_count
    FROM public.medicines
    WHERE user_id = $1;
    
    RETURN donation_count;
END;
$$;

-- Grant execute permission to authenticated users and anonymous users
GRANT EXECUTE ON FUNCTION get_user_donation_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_donation_count TO anon;
