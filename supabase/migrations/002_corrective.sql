-- Safe corrective migration: make updates maintain timestamps and keep ownership
-- policies idempotent for projects that already applied the initial migration.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at before update on public.app_settings
for each row execute function public.set_updated_at();
drop trigger if exists roadmap_items_updated_at on public.roadmap_items;
create trigger roadmap_items_updated_at before update on public.roadmap_items
for each row execute function public.set_updated_at();
drop trigger if exists inbox_items_updated_at on public.inbox_items;
create trigger inbox_items_updated_at before update on public.inbox_items
for each row execute function public.set_updated_at();

create index if not exists inbox_items_user_created_idx on public.inbox_items(user_id, created_at desc);
create index if not exists activity_events_user_created_idx on public.activity_events(user_id, created_at desc);
