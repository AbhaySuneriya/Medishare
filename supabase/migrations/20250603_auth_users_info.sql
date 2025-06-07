
-- Update the auth_users_info view to include address and phone_number
CREATE OR REPLACE VIEW public.auth_users_info AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.updated_at,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) AS display_name,
  u.raw_user_meta_data->>'phone_number' AS phone_number,
  u.raw_user_meta_data->>'address' AS address,
  u.raw_user_meta_data->>'avatar_url' AS avatar_url
FROM auth.users u;

-- Grant select permission to the view for authenticated users and anonymous users
GRANT SELECT ON auth_users_info TO authenticated;
GRANT SELECT ON auth_users_info TO anon;
