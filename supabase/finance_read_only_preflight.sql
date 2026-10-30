-- READ-ONLY. Run manually against actual Supabase before approving ANY DDL.
-- Copy outputs into an audit artifact. Do not paste credentials or private data.
-- Phase 2 implementation deliberately has NOT executed migrations on production.

select current_database() as database_name, current_user as connected_role,
       current_setting('server_version') as postgres_version;

select c.table_schema,c.table_name
from information_schema.tables c
where c.table_schema='public'
  and (c.table_name like 'finance_%' or c.table_name in
    ('subjects','topics','topic_documents','files','applications','learning_sections'))
order by c.table_name;

select c.table_name,c.column_name,c.data_type,c.is_nullable
from information_schema.columns c
where c.table_schema='public' and
  (c.table_name like 'finance_%' or c.table_name='learning_sections')
order by c.table_name,c.ordinal_position;

select c.relname as table_name,c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','p') and c.relname like 'finance_%'
order by c.relname;

select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_catalog.pg_policies
where schemaname='public' and tablename like 'finance_%'
order by tablename,policyname;

select n.nspname as schema_name,p.proname as function_name,
       pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,
       p.proconfig as function_settings
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname like 'finance_%'
order by function_name;

select r.routine_name,r.security_type
from information_schema.routines r
where r.specific_schema='public' and r.routine_name like 'finance_%'
order by r.routine_name;

select table_name,grantee,privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name like 'finance_%'
  and grantee in ('anon','authenticated')
order by table_name,grantee,privilege_type;

-- Existing optional migration history, only where the Supabase CLI manages it:
select to_regclass('supabase_migrations.schema_migrations') as migration_history_table;

-- Confirm live core prerequisites rather than relying on README migration claims:
select to_regclass('public.learning_sections') as learning_sections,
       to_regclass('public.topic_documents') as topic_documents,
       to_regprocedure('public.bootstrap_owner()') as bootstrap_owner,
       to_regprocedure('public.set_updated_at()') as set_updated_at;

-- Finance tables should not exist before the 009–011 roll-out on production.
-- If any already exist, STOP and compare the actual definitions and policies.
