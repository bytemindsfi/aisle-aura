-- Automatically verify email addresses for email/password signups
-- This enables automatic account linking to work properly with OAuth providers

CREATE OR REPLACE FUNCTION auto_verify_email_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process email/password signups (not OAuth)
    IF NEW.email IS NOT NULL AND
       EXISTS (SELECT 1 FROM auth.identities WHERE user_id = NEW.id AND provider = 'email') AND
       NEW.email_confirmed_at IS NULL THEN

        -- Mark email as confirmed
        NEW.email_confirmed_at = NOW();

        RAISE NOTICE 'Auto-verified email for user %', NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run before new user is inserted
DROP TRIGGER IF EXISTS on_auth_user_created_verify_email ON auth.users;
CREATE TRIGGER on_auth_user_created_verify_email
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_verify_email_signup();
