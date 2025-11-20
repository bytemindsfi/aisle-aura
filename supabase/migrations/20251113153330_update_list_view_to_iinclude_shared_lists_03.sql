-- =====================================================
-- Check current security setting
-- =====================================================
SELECT schemaname, viewname, viewowner, definition
FROM pg_views
WHERE viewname = 'lists_with_stats';

-- =====================================================
-- Fix: Drop and recreate with proper security
-- =====================================================
DROP VIEW IF EXISTS lists_with_stats CASCADE;

CREATE VIEW lists_with_stats
            WITH (security_invoker = true)  -- This makes view respect RLS
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