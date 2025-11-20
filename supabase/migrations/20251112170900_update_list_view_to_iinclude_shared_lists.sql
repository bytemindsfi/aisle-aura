-- Drop the existing view
DROP VIEW IF EXISTS lists_with_stats;

-- Recreate view with shared lists included
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
    -- Flag to indicate if current user is the owner
    CASE
        WHEN l.user_id = auth.uid() THEN true
        ELSE false
        END as is_owner,
    -- Total items count
    COUNT(li.id) as total_items,
    -- Completed items count
    COUNT(li.id) FILTER (WHERE li.is_completed = true) as completed_items,
    -- Get first 3 item names as an array
    ARRAY(
        SELECT li2.name
        FROM list_items li2
        WHERE li2.list_id = l.id
        ORDER BY li2.created_at
        LIMIT 3
    ) as first_items
FROM lists l
         LEFT JOIN list_items li ON l.id = li.list_id
WHERE
   -- User is the owner
    l.user_id = auth.uid()
   OR
   -- User is a member with active status
    EXISTS (
        SELECT 1 FROM list_members lm
        WHERE lm.list_id = l.id
          AND lm.user_id = auth.uid()
          AND lm.status = 'active'
    )
GROUP BY l.id;

-- Grant access
GRANT SELECT ON lists_with_stats TO authenticated;