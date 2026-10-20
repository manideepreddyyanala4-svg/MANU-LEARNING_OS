-- 007_live_corrective.sql
--
-- Corrective, fully idempotent migration for the LIVE database.
--
-- Why this exists: live introspection showed the learning tables
-- (subjects/topics/topic_documents) are present and working, but the
-- Job Preparation / Files tables introduced in 004 were never applied to the
-- live project ("Could not find the table 'public.companies' in the schema
-- cache"), and the live `learning-assets` Storage bucket rejects non-image
-- MIME types such as text/plain even though the application allows them.
--
-- This migration ONLY creates what is missing and corrects the bucket. It does
-- not drop or rewrite any existing table, policy or data, and it is safe to run
-- more than once. Run it in the Supabase SQL editor (service role).
--
-- Verify first with supabase/read_only_release_audit.sql.

begin;

-- ---------------------------------------------------------------------------
-- Job Preparation + Files tables (mirrors 004; all guarded by `if not exists`).
-- ---------------------------------------------------------------------------
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

-- updated_at triggers (guarded: only create when the trigger is absent).
do $$ declare t text; begin
  foreach t in array array['file_folders','files','interview_notes','companies','applications'] loop
    if not exists (select 1 from pg_trigger where tgname = t || '_updated_at') then
      execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
    end if;
  end loop;
end $$;

-- Enable RLS and (re)create strict owner-scoped policies. `drop policy if exists`
-- makes this safe to run repeatedly without "already exists" errors.
do $$ declare t text; begin
  foreach t in array array['file_folders','files','resumes','interview_categories','interview_notes','companies','applications','job_files'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);
    execute format('create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)', t || '_delete_own', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: keep `learning-assets` PRIVATE, 50 MB, and allow the document MIME
-- types the app accepts. This is the fix for text/plain / pdf / md / docx being
-- rejected on upload. It never makes the bucket public.
-- ---------------------------------------------------------------------------
update storage.buckets
  set public = false,
      file_size_limit = 52428800,
      allowed_mime_types = array[
        'image/png','image/jpeg','image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain','text/markdown'
      ]
  where id = 'learning-assets';

-- Ensure the private file bucket for Files/Job Prep exists too.
insert into storage.buckets(id, name, public, file_size_limit)
  values ('manu-files','manu-files', false, 52428800)
  on conflict (id) do update set public = false, file_size_limit = 52428800;

commit;

-- After running: in the Supabase dashboard, reload the PostgREST schema cache
-- (Settings → API → "Reload schema") if Job Preparation still reports a missing
-- table, then re-run read_only_release_audit.sql to confirm.
