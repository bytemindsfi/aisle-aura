-- Find the function
SELECT proname FROM pg_proc WHERE proname LIKE '%list%share%';

-- Drop it temporarily
DROP FUNCTION IF EXISTS create_list_share() CASCADE;
DROP FUNCTION IF EXISTS handle_new_list() CASCADE;

-- Remove the trigger if it exists
DROP TRIGGER IF EXISTS on_list_created ON lists;