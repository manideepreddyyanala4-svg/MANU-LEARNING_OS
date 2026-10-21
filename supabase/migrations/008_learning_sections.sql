-- Learning navigation hierarchy. Existing topics remain unsectioned.
begin;

create table if not exists public.learning_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 160),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade,
  unique (user_id, subject_id, id)
);

alter table public.topics add column if not exists section_id uuid;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'topics_section_owner_subject_fk') then
    alter table public.topics add constraint topics_section_owner_subject_fk
      foreign key (user_id, subject_id, section_id)
      references public.learning_sections(user_id, subject_id, id)
      on delete set null (section_id);
  end if;
end $$;

create index if not exists learning_sections_subject_order_idx on public.learning_sections(subject_id, order_index, created_at);
create index if not exists topics_section_order_idx on public.topics(section_id, order_index, created_at);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'learning_sections_updated_at') then
    create trigger learning_sections_updated_at before update on public.learning_sections
      for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.learning_sections enable row level security;
drop policy if exists learning_sections_select_own on public.learning_sections;
drop policy if exists learning_sections_insert_own on public.learning_sections;
drop policy if exists learning_sections_update_own on public.learning_sections;
drop policy if exists learning_sections_delete_own on public.learning_sections;
create policy learning_sections_select_own on public.learning_sections for select to authenticated
  using (auth.uid() = user_id);
create policy learning_sections_insert_own on public.learning_sections for insert to authenticated
  with check (auth.uid() = user_id and exists (
    select 1 from public.subjects where id = subject_id and user_id = auth.uid()
  ));
create policy learning_sections_update_own on public.learning_sections for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and exists (
    select 1 from public.subjects where id = subject_id and user_id = auth.uid()
  ));
create policy learning_sections_delete_own on public.learning_sections for delete to authenticated
  using (auth.uid() = user_id);

commit;
