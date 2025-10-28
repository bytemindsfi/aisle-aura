-- Drop the old table (if you haven't added data yet)
drop table if exists users;

-- Create the correct table
create table users (
                       id uuid primary key references auth.users(id) on delete cascade,
                       first_name text not null,
                       last_name text not null,
                       email text not null unique,
                       agree_to_terms boolean not null default false,
                       created_at timestamptz default now(),
                       updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;

-- Policies
create policy "Users can view own profile"
    on users for select
                            using (auth.uid() = id);

create policy "Users can update own profile"
    on users for update
                            using (auth.uid() = id);

create policy "Users can insert own profile"
    on users for insert
    with check (auth.uid() = id);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
insert into public.users (id, email, first_name, last_name, agree_to_terms)
values (
           new.id,
           new.email,
           coalesce(new.raw_user_meta_data->>'first_name', ''),
           coalesce(new.raw_user_meta_data->>'last_name', ''),
           coalesce((new.raw_user_meta_data->>'agree_to_terms')::boolean, false)
       );
return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();