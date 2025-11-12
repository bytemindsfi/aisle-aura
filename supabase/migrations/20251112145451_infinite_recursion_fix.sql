-- =====================================================
-- Fix Infinite Recursion in RLS Policies
-- =====================================================

-- 1. Drop all existing policies on lists
DROP POLICY IF EXISTS "Users can view own lists" ON lists;
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON lists;
DROP POLICY IF EXISTS "Users can update accessible lists" ON lists;
DROP POLICY IF EXISTS "Only owners can delete lists" ON lists;

-- 2. Recreate policies WITHOUT recursion

-- SELECT: Users can view lists they own OR are members of
CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                                                     USING (
                                                     user_id = auth.uid()
                                                     OR id IN (
                                                     SELECT list_id
                                                     FROM list_members
                                                     WHERE user_id = auth.uid()
                                                     AND status = 'active'
                                                     )
                                                     );

-- INSERT: Users can only insert their own lists
CREATE POLICY "Users can insert own lists"
    ON lists FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update lists they own OR are members of
CREATE POLICY "Users can update accessible lists"
    ON lists FOR UPDATE
                                   USING (
                                   user_id = auth.uid()
                                   OR id IN (
                                   SELECT list_id
                                   FROM list_members
                                   WHERE user_id = auth.uid()
                                   AND status = 'active'
                                   )
                                   );

-- DELETE: Only owners can delete
CREATE POLICY "Only owners can delete lists"
    ON lists FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- 3. Update list_members policies to avoid recursion
-- =====================================================

DROP POLICY IF EXISTS "Users can view list members" ON list_members;
DROP POLICY IF EXISTS "List owners can add members" ON list_members;
DROP POLICY IF EXISTS "List owners can remove members" ON list_members;
DROP POLICY IF EXISTS "System can update member status" ON list_members;

-- SELECT: View members of lists you have access to
CREATE POLICY "Users can view list members"
    ON list_members FOR SELECT
                                                       USING (
                                                       user_id = auth.uid()
                                                       OR invited_by_user_id = auth.uid()
                                                       OR list_id IN (
                                                       SELECT id FROM lists WHERE user_id = auth.uid()
                                                       )
                                                       );

-- INSERT: Only list owners can add members
CREATE POLICY "List owners can add members"
    ON list_members FOR INSERT
    WITH CHECK (
        invited_by_user_id = auth.uid()
        AND list_id IN (
            SELECT id FROM lists WHERE user_id = auth.uid()
        )
    );

-- DELETE: Only list owners can remove members
CREATE POLICY "List owners can remove members"
    ON list_members FOR DELETE
USING (
        list_id IN (
            SELECT id FROM lists WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Allow updates for invitation acceptance
CREATE POLICY "Allow member updates"
    ON list_members FOR UPDATE
                                   USING (
                                   -- Allow if you're the member being updated
                                   user_id = auth.uid()
                                   OR
                                   -- Or if you're the list owner
                                   list_id IN (
                                   SELECT id FROM lists WHERE user_id = auth.uid()
                                   )
                                   );