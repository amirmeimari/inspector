-- Check if we have any users with phone numbers
SELECT 
  'Phone Users' as info,
  id,
  phone,
  email,
  raw_user_meta_data->>'phone' as meta_phone,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users
WHERE phone IS NOT NULL OR raw_user_meta_data->>'phone' IS NOT NULL
LIMIT 10;

-- Check profiles with phone numbers
SELECT 
  'Phone Profiles' as info,
  id,
  phone,
  email,
  first_name,
  last_name
FROM public.profiles
WHERE phone IS NOT NULL AND phone != ''
LIMIT 10;

-- Check if the profiles table has the correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Note: To enable phone auth in Supabase:
-- 1. Go to Authentication > Providers > Phone
-- 2. Enable the Phone provider
-- 3. Configure an SMS provider (Twilio, Messagebird, etc.)
-- 4. Make sure the phone number format is correct (E.164 format: +[country code][number])
