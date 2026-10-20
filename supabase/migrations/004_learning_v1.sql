-- Learning Library V1. Apply after 001–003. All content is owner scoped.
create table if not exists public.subjects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (length(trim(title)) between 1 and 160),
 slug text not null check (length(slug) between 1 and 180),
 description text,
 order_index integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,slug), unique(user_id,id)
);
create table if not exists public.topics (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 subject_id uuid not null,
 title text not null check (length(trim(title)) between 1 and 160),
 slug text not null check (length(slug) between 1 and 180),
 status text not null default 'not_started' check (status in ('not_started','learning','understood','review','mastered')),
 order_index integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(user_id,subject_id) references public.subjects(user_id,id) on delete cascade,
 unique(subject_id,slug), unique(user_id,id)
);
create table if not exists public.topic_notes (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 topic_id uuid not null unique,
 markdown_content text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(user_id,topic_id) references public.topics(user_id,id) on delete cascade
);
create table if not exists public.topic_assets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 topic_id uuid not null,
 storage_path text not null unique,
 original_filename text not null,
 mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
 created_at timestamptz not null default now(),
 foreign key(user_id,topic_id) references public.topics(user_id,id) on delete cascade
);
alter table public.topic_assets drop constraint if exists topic_assets_mime_type_check;
do $$ begin
 if not exists (select 1 from pg_constraint where conname='topic_assets_mime_type_check') then
  alter table public.topic_assets add constraint topic_assets_mime_type_check check (mime_type in ('image/png','image/jpeg','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown'));
 end if;
end $$;
alter table public.topic_assets add column if not exists updated_at timestamptz not null default now();

create table if not exists public.file_folders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid references public.file_folders(id) on delete cascade, name text not null check(length(trim(name)) between 1 and 160),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.files (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 folder_id uuid references public.file_folders(id) on delete set null, storage_path text not null unique,
 original_filename text not null, mime_type text not null, size_bytes bigint not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.resumes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 storage_path text not null unique, original_filename text not null, version_label text not null default 'Draft',
 is_current boolean not null default false, created_at timestamptz not null default now()
);
create unique index if not exists one_current_resume_per_user on public.resumes(user_id) where is_current;
create table if not exists public.interview_categories (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, created_at timestamptz not null default now()
);
create table if not exists public.interview_notes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 category_id uuid references public.interview_categories(id) on delete set null, title text not null, content text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.companies (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, website text, notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.applications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 company_id uuid references public.companies(id) on delete set null, role text not null, status text not null default 'saved',
 location text not null default '', url text not null default '', notes text not null default '', applied_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.job_files (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 application_id uuid references public.applications(id) on delete cascade, storage_path text not null unique,
 original_filename text not null, mime_type text not null, created_at timestamptz not null default now()
);

create or replace function public.touch_topic_after_note() returns trigger language plpgsql set search_path = public as $$
begin
 update public.topics set updated_at=now() where id=new.topic_id and user_id=new.user_id;
 return new;
end $$;
create trigger topic_note_touches_topic after insert or update on public.topic_notes
for each row execute function public.touch_topic_after_note();
create index subjects_user_order_idx on public.subjects(user_id,order_index);
create index topics_subject_order_idx on public.topics(subject_id,order_index);
create index topics_user_updated_idx on public.topics(user_id,updated_at desc);
create index topic_notes_user_topic_idx on public.topic_notes(user_id,topic_id);
create index topic_assets_user_topic_idx on public.topic_assets(user_id,topic_id);
create trigger subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger topics_updated_at before update on public.topics for each row execute function public.set_updated_at();
create trigger topic_notes_updated_at before update on public.topic_notes for each row execute function public.set_updated_at();
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.topic_notes enable row level security;
alter table public.topic_assets enable row level security;
alter table public.file_folders enable row level security;
alter table public.files enable row level security;
alter table public.resumes enable row level security;
alter table public.interview_categories enable row level security;
alter table public.interview_notes enable row level security;
alter table public.companies enable row level security;
alter table public.applications enable row level security;
alter table public.job_files enable row level security;
do $$ declare t text; begin
 foreach t in array array['subjects','topics','topic_notes','topic_assets'] loop
  execute format('create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',t||'_select_own',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)',t||'_insert_own',t);
  execute format('create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',t||'_update_own',t);
  execute format('create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)',t||'_delete_own',t);
 end loop;
end $$;
do $$ declare t text; begin
 foreach t in array array['file_folders','files','resumes','interview_categories','interview_notes','companies','applications','job_files'] loop
  execute format('create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',t||'_select_own',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)',t||'_insert_own',t);
  execute format('create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',t||'_update_own',t);
  execute format('create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)',t||'_delete_own',t);
 end loop;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('learning-assets','learning-assets',false,52428800,array['image/png','image/jpeg','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
insert into storage.buckets(id,name,public,file_size_limit)
values('manu-files','manu-files',false,52428800) on conflict(id) do update set public=false,file_size_limit=52428800;
create policy learning_assets_select_own on storage.objects for select to authenticated
 using(bucket_id='learning-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy learning_assets_insert_own on storage.objects for insert to authenticated
 with check(bucket_id='learning-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy learning_assets_delete_own on storage.objects for delete to authenticated
 using(bucket_id='learning-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manu_files_select_own on storage.objects for select to authenticated using(bucket_id='manu-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manu_files_insert_own on storage.objects for insert to authenticated with check(bucket_id='manu-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manu_files_update_own on storage.objects for update to authenticated using(bucket_id='manu-files' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='manu-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manu_files_delete_own on storage.objects for delete to authenticated using(bucket_id='manu-files' and (storage.foldername(name))[1]=auth.uid()::text);
