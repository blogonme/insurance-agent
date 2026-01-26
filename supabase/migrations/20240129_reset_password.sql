-- Create or update a test user with all necessary fields to avoid 500 errors
DO $$
DECLARE
  user_id uuid := 'cffcd0ca-97bc-40fa-beed-1bb8aefbd22b';
BEGIN
  INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email,
    phone, 
    encrypted_password, 
    email_confirmed_at,
    phone_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'agent@test.com',
    '13800138000',
    crypt('123456', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"phone","providers":["phone"]}',
    '{"full_name":"彭艳"}',
    now(),
    now(),
    false,
    '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = now(),
    phone_confirmed_at = now(),
    updated_at = now();
END $$;
