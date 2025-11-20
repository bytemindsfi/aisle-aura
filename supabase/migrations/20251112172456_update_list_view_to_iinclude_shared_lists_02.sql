-- =====================================================
-- Drop existing view
-- =====================================================
DROP VIEW IF EXISTS lists_with_stats;

-- =====================================================
-- Recreate with explicit access check (no function)
-- =====================================================
CREATE OR REPLACE VIEW lists_with_stats AS
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
-- Only include lists where user has access via base table RLS
GROUP BY l.id;

GRANT SELECT ON lists_with_stats TO authenticated;

-- =====================================================
-- Ensure lists table has correct RLS policy
-- =====================================================
DROP POLICY IF EXISTS "Users can view accessible lists" ON lists;

CREATE POLICY "Users can view accessible lists"
    ON lists FOR SELECT
                                 USING (
                                 -- User is owner
                                 user_id = auth.uid()
                                 OR
                                 -- User is active member
                                 id IN (
                                 SELECT list_id
                                 FROM list_members
                                 WHERE user_id = auth.uid()
                                 AND status = 'active'
                                 )
                                 OR
                                 -- User has pending invitation (for acceptance flow)
                                 id IN (
                                 SELECT list_id
                                 FROM list_members
                                 WHERE email = auth.email()
                                 AND status = 'pending'
                                 )
                                 );