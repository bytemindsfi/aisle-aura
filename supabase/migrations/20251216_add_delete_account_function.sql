-- =====================================================
-- Account Deletion Function for AisleAura
-- Handles complete user account deletion per Apple App Store requirements
-- =====================================================

-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;

    -- Delete all data associated with the user
    -- Order matters due to foreign key constraints

    -- 1. Delete list_items from lists owned by the user (cascade will handle this via lists deletion)
    -- 2. Delete list_members where user is invited_by or is a member
    DELETE FROM list_members
    WHERE user_id = v_user_id
       OR invited_by_user_id = v_user_id;

    -- 3. Delete all lists owned by the user (cascade will delete list_items)
    DELETE FROM lists
    WHERE user_id = v_user_id;

    -- 4. Delete user from users table (if exists - appears to be legacy)
    DELETE FROM users
    WHERE id::text = v_user_id::text;

    -- 5. Delete from auth.users (this is the main auth table)
    -- This will cascade delete the user's session and auth data
    DELETE FROM auth.users
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Account successfully deleted'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user_account() IS
'Permanently deletes a user account and all associated data including lists, list items, and memberships. Required for Apple App Store compliance (Guideline 5.1.1(v)).';
