-- Curriculum lesson content: separate from the original Learning Library notes.
-- The 574 canonical topic keys live in application code; this table stores content only.
create table if not exists public.curriculum_lessons (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_key text not null check (length(topic_key) between 10 and 100),
  content text not null default '' check (length(content) <= 40000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_key)
);
alter table public.curriculum_lessons enable row level security;
drop policy if exists curriculum_lessons_owner_select on public.curriculum_lessons;
create policy curriculum_lessons_owner_select on public.curriculum_lessons
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists curriculum_lessons_owner_insert on public.curriculum_lessons;
create policy curriculum_lessons_owner_insert on public.curriculum_lessons
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists curriculum_lessons_owner_update on public.curriculum_lessons;
create policy curriculum_lessons_owner_update on public.curriculum_lessons
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists curriculum_lessons_owner_delete on public.curriculum_lessons;
create policy curriculum_lessons_owner_delete on public.curriculum_lessons
  for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.curriculum_lessons to authenticated;
