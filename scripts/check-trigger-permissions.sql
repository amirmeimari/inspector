-- Check if we can create triggers on auth.users
-- This might fail due to permissions, which is expected

DO $$
BEGIN
  -- Try to create a test trigger
  BEGIN
    DROP TRIGGER IF EXISTS test_trigger ON auth.users;
    
    CREATE OR REPLACE FUNCTION public.test_trigger_function()
    RETURNS TRIGGER AS $trigger$
    BEGIN
      RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;
    
    CREATE TRIGGER test_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.test_trigger_function();
      
    -- If we get here, we have permissions
    RAISE NOTICE 'SUCCESS: Can create triggers on auth.users';
    
    -- Clean up
    DROP TRIGGER test_trigger ON auth.users;
    DROP FUNCTION public.test_trigger_function();
    
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'INFO: Cannot create triggers on auth.users (expected in hosted Supabase)';
    WHEN others THEN
      RAISE NOTICE 'ERROR: %', SQLERRM;
  END;
END $$;

-- Alternative: Check if trigger already exists
SELECT 
  'Existing Triggers' as info,
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY trigger_name;
