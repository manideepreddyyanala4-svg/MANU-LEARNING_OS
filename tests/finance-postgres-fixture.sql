-- Standalone TEST-ONLY PostgreSQL bootstrap. Never run on the real Supabase DB.
-- Mocks Supabase auth roles and auth.uid() sufficiently for isolated SQL testing.
create role authenticated nologin;
create role anon nologin;
create schema auth;
create table auth.users(id uuid primary key);
insert into auth.users(id) values
  ('00000000-0000-4000-8000-000000000001'::uuid),
  ('00000000-0000-4000-8000-000000000002'::uuid);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth, public to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
