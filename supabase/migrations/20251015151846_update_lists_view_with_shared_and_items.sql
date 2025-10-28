-- Drop the existing view
drop view if exists lists_with_stats;

-- Recreate view with is_shared and first 3 items
create or replace view lists_with_stats as
select
    l.id,
    l.user_id,
    l.name,
    l.is_pinned,
    l.is_shared,
    l.status,
    l.created_at,
    l.updated_at,
    count(li.id) as total_items,
    count(li.id) filter (where li.is_completed = true) as completed_items,
    -- Get first 3 item names as an array
    array(
        select li2.name
        from list_items li2
        where li2.list_id = l.id
        order by li2.created_at
        limit 3
    ) as first_items
from lists l
         left join list_items li on l.id = li.list_id
group by l.id;