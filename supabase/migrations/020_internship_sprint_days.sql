-- Independent owner-private daily career sprint. Idempotent to accommodate
-- environments where the table was created through Supabase before code release.
create table if not exists public.internship_sprint_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  phase text not null default 'Applications' check (char_length(phase) between 1 and 80),
  focus text not null check (char_length(focus) between 1 and 1000),
  applications_target integer not null default 0 check (applications_target between 0 and 20),
  outreach_target integer not null default 0 check (outreach_target between 0 and 20),
  technical_focus text not null default '',
  conference_focus text not null default '',
  admin_focus text not null default '',
  time_plan text not null default '',
  applications_done integer not null default 0 check (applications_done between 0 and 100),
  outreach_done integer not null default 0 check (outreach_done between 0 and 100),
  interviews_booked integer not null default 0 check (interviews_booked between 0 and 20),
  technical_done boolean not null default false,
  conference_done boolean not null default false,
  admin_done boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, day)
);
create index if not exists internship_sprint_days_user_day_idx
  on public.internship_sprint_days(user_id, day);

alter table public.internship_sprint_days enable row level security;
revoke all on public.internship_sprint_days from anon;
grant select, insert, update, delete on public.internship_sprint_days to authenticated;

drop policy if exists "internship_sprint_select_own" on public.internship_sprint_days;
drop policy if exists "internship_sprint_insert_own" on public.internship_sprint_days;
drop policy if exists "internship_sprint_update_own" on public.internship_sprint_days;
drop policy if exists "internship_sprint_delete_own" on public.internship_sprint_days;

create policy "internship_sprint_select_own" on public.internship_sprint_days
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "internship_sprint_insert_own" on public.internship_sprint_days
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "internship_sprint_update_own" on public.internship_sprint_days
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "internship_sprint_delete_own" on public.internship_sprint_days
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.internship_sprint_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists internship_sprint_days_updated_at on public.internship_sprint_days;
create trigger internship_sprint_days_updated_at before update
  on public.internship_sprint_days for each row
  execute function public.internship_sprint_set_updated_at();
