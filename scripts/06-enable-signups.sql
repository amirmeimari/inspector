-- Check current auth settings
SELECT 
  'Current Auth Settings' as info,
  setting_name,
  setting_value
FROM auth.config
WHERE setting_name IN ('SITE_URL', 'DISABLE_SIGNUP', 'ENABLE_SIGNUP');

-- Note: The actual signup settings are controlled in the Supabase Dashboard
-- Go to Authentication > Settings and ensure:
-- 1. "Enable email confirmations" is turned OFF for OTP to work
-- 2. "Enable phone confirmations" is turned ON
-- 3. Configure your SMS provider (Twilio, etc.) for phone OTP

-- Check if we have any existing users
SELECT 
  'Existing Users' as info,
  COUNT(*) as user_count,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as phone_users,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as email_users
FROM auth.users;

-- Check auth providers enabled
SELECT 
  'Auth Providers' as info,
  'Check Supabase Dashboard > Authentication > Providers' as note;
