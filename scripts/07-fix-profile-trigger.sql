-- First, let's check if the profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
) as profiles_table_exists;

-- Drop the existing trigger and function to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles with proper error handling
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
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
      COALESCE(NEW.raw_user_meta_data->>'account_type', 'inspector')
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, try to update it
      UPDATE public.profiles
      SET 
        first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
        last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
        phone = COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', phone),
        email = COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', email),
        account_type = COALESCE(NEW.raw_user_meta_data->>'account_type', account_type),
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN others THEN
      -- Log any other errors but don't fail
      RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a trigger for user updates as well
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile when user is updated
  UPDATE public.profiles
  SET 
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
    phone = COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', phone),
    email = COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', email),
    account_type = COALESCE(NEW.raw_user_meta_data->>'account_type', account_type),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log any errors but don't fail
    RAISE WARNING 'Error in handle_user_update trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Verify the triggers are created
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Create a function to manually sync existing users to profiles
CREATE OR REPLACE FUNCTION public.sync_users_to_profiles()
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

-- Run the sync function to ensure all existing users have profiles
SELECT * FROM public.sync_users_to_profiles();

-- Check if we have any profiles now
SELECT COUNT(*) as profile_count FROM public.profiles;
