-- =====================================================
-- COMPLETE FIX: Remove ALL policies and recreate safely
-- =====================================================

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON lists;
DROP POLICY IF EXISTS "Users can update accessible lists" ON lists;
DROP POLICY IF EXISTS "Only owners can delete lists" ON lists;

DROP POLICY IF EXISTS "Users can view list members" ON list_members;
DROP POLICY IF EXISTS "List owners can add members" ON list_members;
DROP POLICY IF EXISTS "List owners can remove members" ON list_members;
DROP POLICY IF EXISTS "Allow member updates" ON list_members;

-- 2. Create helper functions (SECURITY DEFINER breaks recursion)
CREATE OR REPLACE FUNCTION is_list_owner(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
RETURN EXISTS (
    SELECT 1 FROM lists
    WHERE id = p_list_id
      AND user_id = p_user_id
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

-- 3. Recreate lists policies using helper functions
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

-- 4. Recreate list_members policies using helper functions
CREATE POLICY "Users can view list members"
    ON list_members FOR SELECT
                                   USING (
                                   user_id = auth.uid()
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

CREATE POLICY "Members can update their status"
    ON list_members FOR UPDATE
                                   USING (
                                   user_id = auth.uid()
                                   OR is_list_owner(list_id, auth.uid())
                                   );

-- 5. Update list_items policies to use helper functions
DROP POLICY IF EXISTS "Users can view items from accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can insert items to accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can update items in accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can delete items from accessible lists" ON list_items;

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