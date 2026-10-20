create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
create table if not exists app_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists mission_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists priority_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists roadmap_sections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  order_index integer not null default 0
);
create table if not exists roadmap_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid references roadmap_sections(id) on delete set null,
  title text not null,
  slug text not null,
  order_index integer not null,
  status text not null default 'upcoming' check (status in ('locked','upcoming','current','in_progress','completed','review')),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);
create unique index if not exists one_current_roadmap_item_per_user on roadmap_items(user_id) where is_current;
create index if not exists roadmap_items_user_id_idx on roadmap_items(user_id);
create table if not exists inbox_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'other' check (type in ('question','learn_later','reminder','idea','research','other')),
  text text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists activity_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists mission_rules_user_id_idx on mission_rules(user_id);
create index if not exists priority_items_user_id_idx on priority_items(user_id);
create index if not exists roadmap_sections_user_id_idx on roadmap_sections(user_id);
create index if not exists inbox_items_user_id_idx on inbox_items(user_id);
create index if not exists activity_events_user_id_idx on activity_events(user_id);

alter table profiles enable row level security;
alter table app_settings enable row level security;
alter table mission_rules enable row level security;
alter table priority_items enable row level security;
alter table roadmap_sections enable row level security;
alter table roadmap_items enable row level security;
alter table inbox_items enable row level security;
alter table activity_events enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array['app_settings','mission_rules','priority_items','roadmap_sections','roadmap_items','inbox_items','activity_events'] loop
    execute format('create policy "%1$s_select_own" on %1$I for select using (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_insert_own" on %1$I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_update_own" on %1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_delete_own" on %1$I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- Seed roadmap titles only after creating the owner account and replacing :owner_id.
-- Kernel + Convolution is the current position; no educational content is stored.
