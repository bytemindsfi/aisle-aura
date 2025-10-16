-- Seed file for sample shopping lists
-- Using test user: 0ddca888-cba3-4b40-a118-9190f207b4f7

-- Add is_shared column if needed
alter table lists add column if not exists is_shared boolean default false;

-- Insert sample lists
insert into lists (id, user_id, name, is_pinned, status, is_shared, created_at, updated_at) values
                                                                                                ('11111111-1111-1111-1111-111111111111', '0ddca888-cba3-4b40-a118-9190f207b4f7', 'Weekly Shopping', true, 'active', false, now() - interval '2 days', now() - interval '2 hours'),
                                                                                                ('22222222-2222-2222-2222-222222222222', '0ddca888-cba3-4b40-a118-9190f207b4f7', 'Costco Run', false, 'active', false, now() - interval '3 days', now() - interval '1 day'),
                                                                                                ('33333333-3333-3333-3333-333333333333', '0ddca888-cba3-4b40-a118-9190f207b4f7', 'Birthday Party', false, 'active', false, now() - interval '3 days', now() - interval '3 days'),
                                                                                                ('44444444-4444-4444-4444-444444444444', '0ddca888-cba3-4b40-a118-9190f207b4f7', 'Quick Groceries', false, 'completed', false, now() - interval '5 days', now() - interval '5 days'),
                                                                                                ('55555555-5555-5555-5555-555555555555', '0ddca888-cba3-4b40-a118-9190f207b4f7', 'Family Shopping', false, 'active', true, now() - interval '2 hours', now() - interval '1 hour');

-- Insert list items for "Weekly Shopping" (7 items, 1 completed)
insert into list_items (list_id, name, is_completed) values
                                                         ('11111111-1111-1111-1111-111111111111', 'Milk', true),
                                                         ('11111111-1111-1111-1111-111111111111', 'Bread', false),
                                                         ('11111111-1111-1111-1111-111111111111', 'Eggs', false),
                                                         ('11111111-1111-1111-1111-111111111111', 'Cheese', false),
                                                         ('11111111-1111-1111-1111-111111111111', 'Apples', false),
                                                         ('11111111-1111-1111-1111-111111111111', 'Chicken', false),
                                                         ('11111111-1111-1111-1111-111111111111', 'Rice', false);

-- Insert list items for "Costco Run" (5 items, 2 completed)
insert into list_items (list_id, name, is_completed) values
                                                         ('22222222-2222-2222-2222-222222222222', 'Paper Towels', true),
                                                         ('22222222-2222-2222-2222-222222222222', 'Toilet Paper', true),
                                                         ('22222222-2222-2222-2222-222222222222', 'Chicken Breast', false),
                                                         ('22222222-2222-2222-2222-222222222222', 'Ground Beef', false),
                                                         ('22222222-2222-2222-2222-222222222222', 'Pasta', false);

-- Insert list items for "Birthday Party" (9 items, 0 completed)
insert into list_items (list_id, name, is_completed) values
                                                         ('33333333-3333-3333-3333-333333333333', 'Cake Mix', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Candles', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Party Plates', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Cups', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Napkins', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Balloons', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Ice Cream', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Soda', false),
                                                         ('33333333-3333-3333-3333-333333333333', 'Pizza', false);

-- Insert list items for "Quick Groceries" (3 items, all completed)
insert into list_items (list_id, name, is_completed) values
                                                         ('44444444-4444-4444-4444-444444444444', 'Bananas', true),
                                                         ('44444444-4444-4444-4444-444444444444', 'Yogurt', true),
                                                         ('44444444-4444-4444-4444-444444444444', 'Orange Juice', true);

-- Insert list items for "Family Shopping" (3 items, 0 completed)
insert into list_items (list_id, name, is_completed) values
                                                         ('55555555-5555-5555-5555-555555555555', 'Cereal', false),
                                                         ('55555555-5555-5555-5555-555555555555', 'Snacks', false),
                                                         ('55555555-5555-5555-5555-555555555555', 'Fruit', false);