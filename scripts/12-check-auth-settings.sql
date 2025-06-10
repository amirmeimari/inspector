-- Check if we have any users in the system
SELECT 
  'Total Users' as info,
  COUNT(*) as count
FROM auth.users;

-- Check recent users
SELECT 
  'Recent Users' as info,
  id,
  email,
  phone,
  email_confirmed_at,
  phone_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check if profiles table exists and has data
SELECT 
  'Profiles Count' as info,
  COUNT(*) as count
FROM public.profiles;

-- Check recent profiles
SELECT 
  'Recent Profiles' as info,
  id,
  first_name,
  last_name,
  email,
  phone,
  account_type
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
