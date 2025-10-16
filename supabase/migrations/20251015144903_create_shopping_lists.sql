-- Create lists table
create table lists (
                       id uuid primary key default gen_random_uuid(),
                       user_id uuid references auth.users(id) on delete cascade not null,
                       name text not null,
                       is_pinned boolean default false,
                       status text default 'active' check (status in ('active', 'archived', 'deleted')),
                       created_at timestamptz default now(),
                       updated_at timestamptz default now()
);

-- Create list_items table
create table list_items (
                            id uuid primary key default gen_random_uuid(),
                            list_id uuid references lists(id) on delete cascade not null,
                            name text not null,
                            is_completed boolean default false,
                            created_at timestamptz default now(),
                            updated_at timestamptz default now()
);

-- Create indexes for better performance
create index lists_user_id_idx on lists(user_id);
create index lists_status_idx on lists(status);
create index list_items_list_id_idx on list_items(list_id);

-- Enable Row Level Security
alter table lists enable row level security;
alter table list_items enable row level security;

-- RLS Policies for lists
create policy "Users can view own lists"
    on lists for select
                            using (auth.uid() = user_id);

create policy "Users can create own lists"
    on lists for insert
    with check (auth.uid() = user_id);

create policy "Users can update own lists"
    on lists for update
                                   using (auth.uid() = user_id);

create policy "Users can delete own lists"
    on lists for delete
using (auth.uid() = user_id);

-- RLS Policies for list_items
create policy "Users can view items from own lists"
    on list_items for select
                                 using (
                                 exists (
                                 select 1 from lists
                                 where lists.id = list_items.list_id
                                 and lists.user_id = auth.uid()
                                 )
                                 );

create policy "Users can create items in own lists"
    on list_items for insert
    with check (
        exists (
            select 1 from lists
            where lists.id = list_items.list_id
            and lists.user_id = auth.uid()
        )
    );

create policy "Users can update items in own lists"
    on list_items for update
                                        using (
                                        exists (
                                        select 1 from lists
                                        where lists.id = list_items.list_id
                                        and lists.user_id = auth.uid()
                                        )
                                        );

create policy "Users can delete items from own lists"
    on list_items for delete
using (
        exists (
            select 1 from lists
            where lists.id = list_items.list_id
            and lists.user_id = auth.uid()
        )
    );

-- Trigger to update updated_at on lists
create trigger update_lists_updated_at
    before update on lists
    for each row
    execute function update_updated_at_column();

-- Trigger to update updated_at on list_items
create trigger update_list_items_updated_at
    before update on list_items
    for each row
    execute function update_updated_at_column();

-- Function to update parent list's updated_at when items change
create or replace function update_list_timestamp()
returns trigger as $$
begin
update lists
set updated_at = now()
where id = coalesce(new.list_id, old.list_id);
return coalesce(new, old);
end;
$$ language plpgsql;

-- Trigger to update list timestamp when items are modified
create trigger update_list_on_item_change
    after insert or update or delete on list_items
    for each row
    execute function update_list_timestamp();

-- View for lists with computed stats (total_items, completed_items)
create or replace view lists_with_stats as
select
    l.id,
    l.user_id,
    l.name,
    l.is_pinned,
    l.status,
    l.created_at,
    l.updated_at,
    count(li.id) as total_items,
    count(li.id) filter (where li.is_completed = true) as completed_items
from lists l
         left join list_items li on l.id = li.list_id
group by l.id;