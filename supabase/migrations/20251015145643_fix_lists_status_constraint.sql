-- Drop the old check constraint
alter table lists drop constraint if exists lists_status_check;

-- Add new constraint that includes 'completed'
alter table lists add constraint lists_status_check
    check (status in ('active', 'archived', 'deleted', 'completed'));