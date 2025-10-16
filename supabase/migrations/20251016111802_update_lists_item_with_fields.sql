-- Add quantity and category columns to list_items table
alter table list_items add column if not exists quantity integer default 1;
alter table list_items add column if not exists category text;

-- Add check constraint to ensure quantity is positive
alter table list_items add constraint quantity_positive check (quantity > 0);

-- Create index for filtering by category
create index if not exists list_items_category_idx on list_items(category);

-- Optional: Add comment for documentation
comment on column list_items.quantity is 'Number of items needed (e.g., 2 for "2 apples")';
comment on column list_items.category is 'Item category (e.g., "Produce", "Dairy", "Meat")';