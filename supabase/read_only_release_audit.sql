-- Read-only release verification for MANU Learning OS.
-- Run in Supabase SQL Editor. This script contains SELECT statements only.

select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'subjects', 'topics', 'topic_documents', 'topic_assets', 'topic_blocks',
    'files', 'file_folders', 'resumes', 'applications', 'companies',
    'interview_categories', 'interview_notes', 'inbox_items',
    'app_settings', 'activity_events'
  )
order by table_name;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    table_name in (
      'subjects', 'topics', 'topic_documents', 'topic_assets', 'topic_blocks',
      'files', 'file_folders', 'resumes', 'applications', 'companies',
      'interview_categories', 'interview_notes', 'inbox_items',
      'app_settings', 'activity_events'
    )
    or (table_name = 'topic_documents' and column_name in ('content_json', 'plain_text', 'user_id', 'topic_id'))
  )
order by table_name, ordinal_position;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'subjects', 'topics', 'topic_documents', 'topic_assets', 'topic_blocks',
    'files', 'file_folders', 'resumes', 'applications', 'companies',
    'interview_categories', 'interview_notes', 'inbox_items',
    'app_settings', 'activity_events'
  )
order by tablename, policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('learning-assets', 'manu-files')
order by id;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname ilike any (array['%learning%','%manu%'])
order by policyname;
