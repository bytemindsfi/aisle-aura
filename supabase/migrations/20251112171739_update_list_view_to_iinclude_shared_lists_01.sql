-- =====================================================
-- Update lists_with_stats view to include shared lists
-- =====================================================

-- Drop existing view
DROP VIEW IF EXISTS lists_with_stats;

-- Recreate view with is_owner flag
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
    CASE
        WHEN l.user_id = auth.uid() THEN true
        ELSE false
        END as is_owner,
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

-- Grant access
GRANT SELECT ON lists_with_stats TO authenticated;

-- =====================================================
-- Ensure has_list_access function is correct
-- =====================================================
CREATE OR REPLACE FUNCTION has_list_access(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
RETURN EXISTS (
    SELECT 1 FROM lists WHERE id = p_list_id AND user_id = p_user_id
) OR EXISTS (
    SELECT 1 FROM list_members
    WHERE list_id = p_list_id
      AND user_id = p_user_id
      AND status = 'active'
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;