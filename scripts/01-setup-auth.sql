-- First, let's check if the database is properly set up
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname IN ('auth', 'public')
ORDER BY schemaname, tablename;

-- Check if auth.users table exists and has data
SELECT COUNT(*) as user_count FROM auth.users;
