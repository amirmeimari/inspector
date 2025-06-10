-- Manual profile creation for existing users
-- Run this if the trigger doesn't work automatically

-- First, check existing users
SELECT 
  'Existing Users' as info,
  id,
  email,
  phone,
  raw_user_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Create a function to manually sync users to profiles
CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS TABLE (
  user_id UUID,
  status TEXT
) AS $$
DECLARE
  u RECORD;
  result_status TEXT;
BEGIN
  FOR u IN SELECT * FROM auth.users
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        phone, 
        email, 
        account_type
      )
      VALUES (
        u.id,
        COALESCE(u.raw_user_meta_data->>'first_name', ''),
        COALESCE(u.raw_user_meta_data->>'last_name', ''),
        COALESCE(u.phone, u.raw_user_meta_data->>'phone', ''),
        COALESCE(u.email, u.raw_user_meta_data->>'email', ''),
        COALESCE(u.raw_user_meta_data->>'account_type', 'inspector')
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        first_name = COALESCE(u.raw_user_meta_data->>'first_name', profiles.first_name),
        last_name = COALESCE(u.raw_user_meta_data->>'last_name', profiles.last_name),
        phone = COALESCE(u.phone, u.raw_user_meta_data->>'phone', profiles.phone),
        email = COALESCE(u.email, u.raw_user_meta_data->>'email', profiles.email),
        account_type = COALESCE(u.raw_user_meta_data->>'account_type', profiles.account_type),
        updated_at = NOW();
        
      result_status := 'SUCCESS';
    EXCEPTION
      WHEN others THEN
        result_status := 'ERROR: ' || SQLERRM;
    END;
    
    user_id := u.id;
    status := result_status;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function
SELECT * FROM public.sync_existing_users();

-- Check results
SELECT 
  'Profile Count' as info,
  COUNT(*) as count
FROM public.profiles;

-- Show recent profiles
SELECT 
  'Recent Profiles' as info,
  id,
  first_name,
  last_name,
  email,
  phone,
  account_type,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
