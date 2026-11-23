insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('manu-resumes', 'manu-resumes', false, 20971520, array[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]),
  ('manu-job-files', 'manu-job-files', false, 20971520, array[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'image/png', 'image/jpeg', 'image/webp'
  ])
on conflict (id) do nothing;

-- The Storage API assigns owner_id from the caller's verified JWT.
create policy career_documents_insert_own on storage.objects for insert to authenticated
with check (
  bucket_id in ('manu-resumes', 'manu-job-files')
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and not coalesce((select auth.jwt()->>'is_anonymous') = 'true', false)
);

create policy career_documents_read_own on storage.objects for select to authenticated
using (
  bucket_id in ('manu-resumes', 'manu-job-files')
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and not coalesce((select auth.jwt()->>'is_anonymous') = 'true', false)
);

create policy career_documents_delete_own on storage.objects for delete to authenticated
using (
  bucket_id in ('manu-resumes', 'manu-job-files')
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and not coalesce((select auth.jwt()->>'is_anonymous') = 'true', false)
);

do $$
declare
  relation text;
begin
  foreach relation in array array['resumes', 'job_files'] loop
    execute format($ddl$
      alter table public.%I
        add column document_sha256 text check (document_sha256 ~ '^[0-9a-f]{64}$'),
        add column size_bytes integer check (size_bytes between 1 and 20971520),
        add column source_ids text[] not null default '{}',
        add column claim_ids text[] not null default '{}',
        add column evidence_status text not null default 'unreviewed'
          check (evidence_status in ('unreviewed', 'historical', 'verified', 'conditional', 'superseded', 'restricted')),
        add check (split_part(storage_path, '/', 1) = user_id::text and position('/' in storage_path) > 0) not valid,
        add check (cardinality(source_ids) <= 50 and array_position(source_ids, null) is null
          and array_to_string(source_ids, ',') ~ '^(|[A-Z][0-9]{2}(,[A-Z][0-9]{2})*)$'),
        add check (cardinality(claim_ids) <= 50 and array_position(claim_ids, null) is null
          and array_to_string(claim_ids, ',') ~ '^(|C[0-9]{3}(,C[0-9]{3})*)$')
    $ddl$, relation);
    execute format('create unique index %I on public.%I (user_id, document_sha256) where document_sha256 is not null',
      relation || '_owner_digest', relation);
  end loop;
end $$;

-- Each owner can keep a single original across the two existing metadata tables.
-- Same-owner concurrent writes take the same transaction lock.
create function public.check_career_document_digest()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.document_sha256 is null then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended('career-document:' || new.user_id::text, 0));
  if (tg_table_name = 'resumes' and exists (
    select 1 from public.job_files f where f.user_id = new.user_id and f.document_sha256 = new.document_sha256
  )) or (tg_table_name = 'job_files' and exists (
    select 1 from public.resumes r where r.user_id = new.user_id and r.document_sha256 = new.document_sha256
  )) then
    raise unique_violation using message = 'This document is already stored in your career workspace';
  end if;
  return new;
end $$;
revoke all on function public.check_career_document_digest() from public, anon, authenticated;

create trigger resume_document_digest before insert or update of document_sha256, user_id
on public.resumes for each row execute function public.check_career_document_digest();
create trigger job_file_document_digest before insert or update of document_sha256, user_id
on public.job_files for each row execute function public.check_career_document_digest();

-- Keep the original when its associated application is removed.
alter table public.job_files drop constraint if exists job_files_application_id_fkey;
alter table public.job_files add constraint job_files_application_id_fkey
  foreign key (application_id) references public.applications(id) on delete set null;

-- Prevent links from a document to another account's application.
create policy career_job_files_own_application on public.job_files as restrictive for all to authenticated
using (true)
with check (application_id is null or exists (
  select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid())
));

create function public.set_my_current_resume(resume_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then raise insufficient_privilege; end if;
  perform pg_advisory_xact_lock(hashtextextended('current-resume:' || caller::text, 0));
  perform 1 from public.resumes where id = resume_id and user_id = caller for update;
  if not found then raise no_data_found using message = 'Resume not found'; end if;
  update public.resumes set is_current = false where user_id = caller and is_current and id <> resume_id;
  update public.resumes set is_current = true where id = resume_id and user_id = caller and not is_current;
end $$;
revoke all on function public.set_my_current_resume(uuid) from public, anon;
grant execute on function public.set_my_current_resume(uuid) to authenticated;
