-- =====================================================
-- AisleAura Simple List Sharing Migration
-- =====================================================

-- 1. Add is_shared column to lists (if not exists)
ALTER TABLE lists
    ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_lists_is_shared ON lists(is_shared) WHERE is_shared = true;

-- =====================================================
-- 2. Create list_members table
-- Single table for all shared access - simple and performant
-- =====================================================
CREATE TABLE IF NOT EXISTS list_members (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active')) DEFAULT 'pending',
    invitation_token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One entry per email per list
    UNIQUE(list_id, email)
    );

-- Indexes for performance
CREATE INDEX idx_list_members_list_id ON list_members(list_id);
CREATE INDEX idx_list_members_email ON list_members(email);
CREATE INDEX idx_list_members_user_id ON list_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_list_members_token ON list_members(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX idx_list_members_status ON list_members(list_id, status);

-- =====================================================
-- 3. Trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_list_members_updated_at ON list_members;
CREATE TRIGGER update_list_members_updated_at
    BEFORE UPDATE ON list_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. Function to generate invitation token
-- =====================================================
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Function to update is_shared when members change
-- =====================================================
CREATE OR REPLACE FUNCTION update_list_is_shared()
RETURNS TRIGGER AS $$
BEGIN
    -- Update is_shared based on whether list has any members
UPDATE lists
SET is_shared = EXISTS (
    SELECT 1 FROM list_members
    WHERE list_id = COALESCE(NEW.list_id, OLD.list_id)
)
WHERE id = COALESCE(NEW.list_id, OLD.list_id);

RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update is_shared
DROP TRIGGER IF EXISTS update_list_is_shared_trigger ON list_members;
CREATE TRIGGER update_list_is_shared_trigger
    AFTER INSERT OR DELETE ON list_members
    FOR EACH ROW
    EXECUTE FUNCTION update_list_is_shared();

-- =====================================================
-- 6. Function to accept invitation
-- =====================================================
CREATE OR REPLACE FUNCTION accept_invitation(
    p_invitation_token TEXT
)
RETURNS JSONB AS $$
DECLARE
v_member RECORD;
    v_user_email TEXT;
BEGIN
    -- Get current user's email
SELECT email INTO v_user_email
FROM auth.users
WHERE id = auth.uid();

-- Find and update invitation
UPDATE list_members
SET
    status = 'active',
    user_id = auth.uid(),
    updated_at = NOW()
WHERE invitation_token = p_invitation_token
  AND email = v_user_email
  AND status = 'pending'
    RETURNING * INTO v_member;

IF v_member IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or already accepted invitation'
        );
END IF;

RETURN jsonb_build_object(
        'success', true,
        'list_id', v_member.list_id
       );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. View: User's accessible lists
-- =====================================================
CREATE OR REPLACE VIEW user_accessible_lists AS
SELECT DISTINCT
    l.*,
    CASE
        WHEN l.user_id = auth.uid() THEN true
        ELSE false
        END as is_owner
FROM lists l
WHERE l.user_id = auth.uid()
   OR EXISTS (
    SELECT 1 FROM list_members lm
    WHERE lm.list_id = l.id
      AND lm.user_id = auth.uid()
      AND lm.status = 'active'
);

-- =====================================================
-- 8. RLS Policies for list_members
-- =====================================================
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

-- List owners and members can view
CREATE POLICY "Users can view list members"
    ON list_members FOR SELECT
                                   USING (
                                   user_id = auth.uid()
                                   OR invited_by_user_id = auth.uid()
                                   OR EXISTS (
                                   SELECT 1 FROM lists
                                   WHERE lists.id = list_members.list_id
                                   AND lists.user_id = auth.uid()
                                   )
                                   );

-- Only list owners can add members
CREATE POLICY "List owners can add members"
    ON list_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM lists
            WHERE lists.id = list_members.list_id
              AND lists.user_id = auth.uid()
        )
    );

-- Only list owners can remove members
CREATE POLICY "List owners can remove members"
    ON list_members FOR DELETE
USING (
        EXISTS (
            SELECT 1 FROM lists
            WHERE lists.id = list_members.list_id
              AND lists.user_id = auth.uid()
        )
    );

-- System can update for invitation acceptance
CREATE POLICY "System can update member status"
    ON list_members FOR UPDATE
                                   USING (true)
                        WITH CHECK (true);

-- =====================================================
-- 9. Update lists RLS policies
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own lists" ON lists;
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;

-- Users can view lists they own OR are members of
CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                                      USING (
                                      user_id = auth.uid()
                                      OR EXISTS (
                                      SELECT 1 FROM list_members
                                      WHERE list_members.list_id = lists.id
                                      AND list_members.user_id = auth.uid()
                                      AND list_members.status = 'active'
                                      )
                                      );

-- Users can insert their own lists
CREATE POLICY "Users can insert own lists"
    ON lists FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update lists they own OR are members of
CREATE POLICY "Users can update accessible lists"
    ON lists FOR UPDATE
                                   USING (
                                   user_id = auth.uid()
                                   OR EXISTS (
                                   SELECT 1 FROM list_members
                                   WHERE list_members.list_id = lists.id
                                   AND list_members.user_id = auth.uid()
                                   AND list_members.status = 'active'
                                   )
                                   );

-- Only owners can delete lists
CREATE POLICY "Only owners can delete lists"
    ON lists FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- 10. Update list_items RLS policies
-- =====================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own list items" ON list_items;
DROP POLICY IF EXISTS "Users can view items from accessible lists" ON list_items;

-- Users can view items from lists they have access to
CREATE POLICY "Users can view items from accessible lists"
    ON list_items FOR SELECT
                                           USING (
                                           EXISTS (
                                           SELECT 1 FROM lists
                                           WHERE lists.id = list_items.list_id
                                           AND (
                                           lists.user_id = auth.uid()
                                           OR EXISTS (
                                           SELECT 1 FROM list_members
                                           WHERE list_members.list_id = lists.id
                                           AND list_members.user_id = auth.uid()
                                           AND list_members.status = 'active'
                                           )
                                           )
                                           )
                                           );

-- Users can insert items to lists they have access to
CREATE POLICY "Users can insert items to accessible lists"
    ON list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM lists
            WHERE lists.id = list_items.list_id
              AND (
                  lists.user_id = auth.uid()
                  OR EXISTS (
                      SELECT 1 FROM list_members
                      WHERE list_members.list_id = lists.id
                        AND list_members.user_id = auth.uid()
                        AND list_members.status = 'active'
                  )
              )
        )
    );

-- Users can update items in lists they have access to
CREATE POLICY "Users can update items in accessible lists"
    ON list_items FOR UPDATE
                                        USING (
                                        EXISTS (
                                        SELECT 1 FROM lists
                                        WHERE lists.id = list_items.list_id
                                        AND (
                                        lists.user_id = auth.uid()
                                        OR EXISTS (
                                        SELECT 1 FROM list_members
                                        WHERE list_members.list_id = lists.id
                                        AND list_members.user_id = auth.uid()
                                        AND list_members.status = 'active'
                                        )
                                        )
                                        )
                                        );

-- Users can delete items from lists they have access to
CREATE POLICY "Users can delete items from accessible lists"
    ON list_items FOR DELETE
USING (
        EXISTS (
            SELECT 1 FROM lists
            WHERE lists.id = list_items.list_id
              AND (
                  lists.user_id = auth.uid()
                  OR EXISTS (
                      SELECT 1 FROM list_members
                      WHERE list_members.list_id = lists.id
                        AND list_members.user_id = auth.uid()
                        AND list_members.status = 'active'
                  )
              )
        )
    );

-- =====================================================
-- 11. Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON list_members TO authenticated;

-- =====================================================
-- Migration complete
-- =====================================================