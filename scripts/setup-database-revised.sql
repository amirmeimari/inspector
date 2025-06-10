-- Supabase Database Setup Script
-- This script sets up the database without modifying auth.users directly

-- Create profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  account_type TEXT CHECK (account_type IN ('inspector', 'contractor', 'homeowner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create or replace function to handle new user signup
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile on user signup
-- Note: This requires Supabase to grant trigger permissions
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on inspections table
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Create policies for inspections
DROP POLICY IF EXISTS "Users can view own inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can create own inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can update own inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can delete own inspections" ON public.inspections;

CREATE POLICY "Users can view own inspections" ON public.inspections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inspections" ON public.inspections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inspections" ON public.inspections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inspections" ON public.inspections
  FOR DELETE USING (auth.uid() = user_id);

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create policies for photos
DROP POLICY IF EXISTS "Users can view own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can create own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can update own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;

CREATE POLICY "Users can view own photos" ON public.photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON public.photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.photos
  FOR DELETE USING (auth.uid() = user_id);

-- Verify setup
SELECT 'Setup completed successfully' as status;

-- Show created tables
SELECT 
  'Created Tables' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
