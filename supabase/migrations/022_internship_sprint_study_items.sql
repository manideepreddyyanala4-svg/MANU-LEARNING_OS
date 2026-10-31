-- Owner-private, per-topic status for the accelerated 62-day curriculum.
-- User-specific curriculum rows are saved in Supabase and never checked into the public repository.
alter table public.internship_sprint_days
  add column if not exists study_items jsonb not null default '[]'::jsonb;

alter table public.internship_sprint_days
  drop constraint if exists internship_sprint_study_items_array;

alter table public.internship_sprint_days
  add constraint internship_sprint_study_items_array
  check (jsonb_typeof(study_items) = 'array' and jsonb_array_length(study_items) <= 12);

-- Existing RLS policies keep this new field private to each account owner.
