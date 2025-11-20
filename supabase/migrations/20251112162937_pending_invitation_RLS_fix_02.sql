-- =====================================================
-- FIX: Update all policies to not access auth.users
-- =====================================================

-- 1. Fix list_members SELECT policy
DROP POLICY IF EXISTS "Users can view list members" ON list_members;

CREATE POLICY "Users can view list members"
    ON list_members FOR SELECT
                                        USING (
                                        email = auth.email()
                                        OR user_id = auth.uid()
                                        OR invited_by_user_id = auth.uid()
                                        OR is_list_owner(list_id, auth.uid())
                                        );

-- 2. Fix lists SELECT policy to include pending invitations
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;

CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                                 USING (
                                 has_list_access(id, auth.uid())
                                 OR id IN (
                                 SELECT list_id
                                 FROM list_members
                                 WHERE email = auth.email()
                                 AND status = 'pending'
                                 )
                                 );