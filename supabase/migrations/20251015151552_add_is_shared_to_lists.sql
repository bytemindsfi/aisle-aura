-- Add is_shared column to lists table
alter table lists add column if not exists is_shared boolean default false;

-- Create index for querying shared lists
create index if not exists lists_is_shared_idx on lists(is_shared);

-- Optional: Add comment for documentation
comment on column lists.is_shared is 'Indicates if the list is shared with other users';