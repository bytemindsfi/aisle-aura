-- Create enum type for categories
create type item_category as enum (
    'Produce',
    'Dairy',
    'Meat',
    'Bakery',
    'Beverages',
    'Snacks',
    'Frozen',
    'Pantry',
    'Personal Care',
    'Household',
    'Other'
);

-- Drop old check constraint if exists
alter table list_items drop constraint if exists list_items_category_check;

-- Change category column to use enum (handles existing data)
alter table list_items
alter column category type item_category
    using case
        when category is null then null
        else category::item_category
end;