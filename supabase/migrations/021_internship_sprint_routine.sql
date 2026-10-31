-- Idempotent additive migration, aligned with production's manually applied schema.
-- Preserves all existing application counts, notes and other user data.
alter table public.internship_sprint_days
  add column if not exists movement_done boolean not null default false,
  add column if not exists meal_prep_done boolean not null default false,
  add column if not exists gita_done boolean not null default false,
  add column if not exists sleep_done boolean not null default false;
