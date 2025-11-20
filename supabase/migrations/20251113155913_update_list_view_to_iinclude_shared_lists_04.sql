-- =====================================================
-- COMPLETE RESET & FIX - Run this entire script
-- =====================================================

-- =====================================================
-- 1. DROP ALL EXISTING POLICIES
-- =====================================================

-- Lists policies
DROP POLICY IF EXISTS "Users can view own lists" ON lists;
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON lists;
DROP POLICY IF EXISTS "Users can update accessible lists" ON lists;
DROP POLICY IF EXISTS "Only owners can update lists" ON lists;
DROP POLICY IF EXISTS "Only owners can delete lists" ON lists;

-- List members policies
DROP POLICY IF EXISTS "Users can view list members" ON list_members;
DROP POLICY IF EXISTS "List owners can add members" ON list_members;
DROP POLICY IF EXISTS "List owners can remove members" ON list_members;
DROP POLICY IF EXISTS "System can update member status" ON list_members;
DROP POLICY IF EXISTS "Allow member updates" ON list_members;
DROP POLICY IF EXISTS "Members can update their status" ON list_members;

-- List items policies
DROP POLICY IF EXISTS "Users can view own list items" ON list_items;
DROP POLICY IF EXISTS "Users can view items from accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can insert items to accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can update items in accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can delete items from accessible lists" ON list_items;

-- =====================================================
-- 2. RECREATE HELPER FUNCTIONS (Clean versions)
-- =====================================================

CREATE OR REPLACE FUNCTION is_list_owner(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
RETURN EXISTS (
    SELECT 1 FROM lists
    WHERE id = p_list_id AND user_id = p_user_id
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_list_member(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
RETURN EXISTS (
    SELECT 1 FROM list_members
    WHERE list_id = p_list_id
      AND user_id = p_user_id
      AND status = 'active'
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_list_access(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
RETURN is_list_owner(p_list_id, p_user_id)
    OR is_list_member(p_list_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 3. LISTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                               USING (has_list_access(id, auth.uid()));

CREATE POLICY "Users can insert own lists"
    ON lists FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update accessible lists"
    ON lists FOR UPDATE
                                   USING (has_list_access(id, auth.uid()));

CREATE POLICY "Only owners can delete lists"
    ON lists FOR DELETE
USING (is_list_owner(id, auth.uid()));

-- =====================================================
-- 4. LIST_MEMBERS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view list members"
    ON list_members FOR SELECT
                                   USING (
                                   email = auth.email()
                                   OR user_id = auth.uid()
                                   OR invited_by_user_id = auth.uid()
                                   OR is_list_owner(list_id, auth.uid())
                                   );

CREATE POLICY "List owners can add members"
    ON list_members FOR INSERT
    WITH CHECK (
        invited_by_user_id = auth.uid()
        AND is_list_owner(list_id, auth.uid())
    );

CREATE POLICY "List owners can remove members"
    ON list_members FOR DELETE
USING (is_list_owner(list_id, auth.uid()));

CREATE POLICY "Allow member status updates"
    ON list_members FOR UPDATE
                                   USING (
                                   user_id = auth.uid()
                                   OR is_list_owner(list_id, auth.uid())
                                   );

-- =====================================================
-- 5. LIST_ITEMS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view items from accessible lists"
    ON list_items FOR SELECT
                                 USING (has_list_access(list_id, auth.uid()));

CREATE POLICY "Users can insert items to accessible lists"
    ON list_items FOR INSERT
    WITH CHECK (has_list_access(list_id, auth.uid()));

CREATE POLICY "Users can update items in accessible lists"
    ON list_items FOR UPDATE
                                        USING (has_list_access(list_id, auth.uid()));

CREATE POLICY "Users can delete items from accessible lists"
    ON list_items FOR DELETE
USING (has_list_access(list_id, auth.uid()));

-- =====================================================
-- 6. RECREATE VIEW WITH security_invoker
-- =====================================================

DROP VIEW IF EXISTS lists_with_stats CASCADE;

CREATE VIEW lists_with_stats
            WITH (security_invoker = true)
AS
SELECT
    l.id,
    l.user_id,
    l.name,
    l.is_pinned,
    l.is_shared,
    l.status,
    l.created_at,
    l.updated_at,
    (l.user_id = auth.uid()) as is_owner,
    COUNT(li.id) as total_items,
    COUNT(li.id) FILTER (WHERE li.is_completed = true) as completed_items,
    ARRAY(
        SELECT li2.name
        FROM list_items li2
        WHERE li2.list_id = l.id
        ORDER BY li2.created_at
        LIMIT 3
    ) as first_items
FROM lists l
         LEFT JOIN list_items li ON l.id = li.list_id
GROUP BY l.id;

GRANT SELECT ON lists_with_stats TO authenticated;

-- =====================================================
-- VERIFICATION - Run these as each user to test
-- =====================================================

-- As User A (list owner):
-- SELECT * FROM lists_with_stats;
-- Should see: their own lists

-- As User B (sharee):
-- SELECT * FROM lists_with_stats;
-- Should see: lists shared with them

-- Check member status:
-- SELECT * FROM list_members WHERE user_id = auth.uid();