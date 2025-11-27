-- =====================================================
-- CLEAN RESET: Drop all lists policies
-- =====================================================
DROP POLICY IF EXISTS "Users can create own lists" ON lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON lists;
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;
DROP POLICY IF EXISTS "Users can update accessible lists" ON lists;
DROP POLICY IF EXISTS "Only owners can delete lists" ON lists;

-- =====================================================
-- Recreate clean policies
-- =====================================================

-- SELECT: View lists you own or are a member of
CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                                                     USING (has_list_access(id, auth.uid()));

-- INSERT: Create your own lists
CREATE POLICY "Users can insert own lists"
    ON lists FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Update lists you have access to
CREATE POLICY "Users can update accessible lists"
    ON lists FOR UPDATE
                                   USING (has_list_access(id, auth.uid()));

-- DELETE: Delete lists you own
CREATE POLICY "Only owners can delete lists"
    ON lists FOR DELETE
USING (is_list_owner(id, auth.uid()));