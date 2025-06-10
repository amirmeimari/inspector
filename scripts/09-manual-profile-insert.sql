-- This script can be used to manually insert a profile for a specific user
-- Replace the values with the actual user data

-- First, check if the user exists
SELECT id, email, phone, raw_user_meta_data
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE'; -- Replace with the actual user ID

-- Then insert or update the profile
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  phone,
  email,
  account_type,
  created_at,
  updated_at
)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with the actual user ID
  'First Name', -- Replace with actual first name
  'Last Name', -- Replace with actual last name
  '+1234567890', -- Replace with actual phone number in E.164 format
  'email@example.com', -- Replace with actual email
  'inspector', -- Replace with actual account type
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  account_type = EXCLUDED.account_type,
  updated_at = NOW();

-- Verify the profile was created
SELECT * FROM public.profiles
WHERE id = 'YOUR_USER_ID_HERE'; -- Replace with the actual user ID
