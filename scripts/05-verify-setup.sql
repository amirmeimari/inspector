-- Final verification of the database setup
SELECT 'Database Setup Verification' as status;

-- Check tables exist
SELECT 
  'Tables' as category,
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT 
  'RLS Status' as category,
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
ORDER BY tablename;

-- Check policies exist
SELECT 
  'Policies' as category,
  schemaname,
  tablename,
  policyname,
  'EXISTS' as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check functions exist
SELECT 
  'Functions' as category,
  proname as function_name,
  'EXISTS' as status
FROM pg_proc 
WHERE proname IN ('handle_new_user')
ORDER BY proname;

-- Check triggers exist
SELECT 
  'Triggers' as category,
  trigger_name,
  event_object_table,
  'EXISTS' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY trigger_name;
