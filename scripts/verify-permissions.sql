-- Check what permissions we have
SELECT 
  'Current User' as info,
  current_user as username,
  session_user as session_user;

-- Check if we can access auth schema (read-only)
SELECT 
  'Auth Schema Access' as info,
  COUNT(*) as user_count
FROM auth.users
LIMIT 1;

-- Check our public tables
SELECT 
  'Public Tables' as info,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS status
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
ORDER BY tablename;
