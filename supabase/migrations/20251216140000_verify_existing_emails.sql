-- One-time update to verify all existing email/password accounts
-- This allows automatic account linking with OAuth providers to work

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE
    email_confirmed_at IS NULL
    AND email IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM auth.identities
        WHERE user_id = auth.users.id
        AND provider = 'email'
    );
