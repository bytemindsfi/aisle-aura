-- =====================================================
-- Auto-create user profile for OAuth signups (Apple, Google, etc.)
-- =====================================================

-- Function to create user profile automatically when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name_parts TEXT[];
    first_name_val TEXT;
    last_name_val TEXT;
BEGIN
    -- Extract name from metadata (for OAuth providers like Apple, Google)
    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        -- Split full name into first and last
        user_name_parts := string_to_array(NEW.raw_user_meta_data->>'full_name', ' ');
        first_name_val := user_name_parts[1];
        last_name_val := COALESCE(array_to_string(user_name_parts[2:array_length(user_name_parts, 1)], ' '), '');
    ELSIF NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
        -- Alternative name field
        user_name_parts := string_to_array(NEW.raw_user_meta_data->>'name', ' ');
        first_name_val := user_name_parts[1];
        last_name_val := COALESCE(array_to_string(user_name_parts[2:array_length(user_name_parts, 1)], ' '), '');
    ELSIF NEW.raw_user_meta_data->>'firstName' IS NOT NULL THEN
        -- Check for firstName/lastName fields (email/password signup)
        first_name_val := NEW.raw_user_meta_data->>'firstName';
        last_name_val := COALESCE(NEW.raw_user_meta_data->>'lastName', '');
    ELSE
        -- Default to email username if no name provided
        first_name_val := split_part(NEW.email, '@', 1);
        last_name_val := '';
    END IF;

    -- Insert into users table (matching the actual schema without phone column)
    INSERT INTO public.users (
        id,
        first_name,
        last_name,
        email,
        agree_to_terms,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(first_name_val, 'User'),
        COALESCE(last_name_val, ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'agreeToTerms')::boolean, true), -- OAuth users implicitly agree
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Avoid duplicate entries

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
'Automatically creates a user profile entry when a new user signs up via OAuth (Apple, Google, etc.) or email/password. Required for Apple Sign In compliance.';
