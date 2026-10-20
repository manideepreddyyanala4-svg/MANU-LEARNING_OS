-- Sequential topic study stream. Existing notes/assets remain intact.
create table if not exists public.topic_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null,
  block_type text not null check (block_type in ('text','image','file')),
  text_content text,
  storage_path text,
  original_filename text,
  mime_type text,
  caption text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (user_id, topic_id) references public.topics(user_id, id) on delete cascade,
  check (
    (block_type = 'text' and text_content is not null and storage_path is null) or
    (block_type in ('image','file') and storage_path is not null and text_content is null)
  )
);
create index if not exists topic_blocks_user_id_idx on public.topic_blocks(user_id);
create index if not exists topic_blocks_topic_order_idx on public.topic_blocks(topic_id, order_index);
alter table public.topic_blocks enable row level security;
drop policy if exists topic_blocks_select_own on public.topic_blocks;
create policy topic_blocks_select_own on public.topic_blocks for select to authenticated using (auth.uid() = user_id);
drop policy if exists topic_blocks_insert_own on public.topic_blocks;
create policy topic_blocks_insert_own on public.topic_blocks for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists topic_blocks_update_own on public.topic_blocks;
create policy topic_blocks_update_own on public.topic_blocks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists topic_blocks_delete_own on public.topic_blocks;
create policy topic_blocks_delete_own on public.topic_blocks for delete to authenticated using (auth.uid() = user_id);
drop trigger if exists topic_blocks_updated_at on public.topic_blocks;
create trigger topic_blocks_updated_at before update on public.topic_blocks
for each row execute function public.set_updated_at();

-- One-time compatibility copy. It is idempotent and does not delete old data.
insert into public.topic_blocks (user_id, topic_id, block_type, text_content, order_index, created_at, updated_at)
select n.user_id, n.topic_id, 'text', n.markdown_content, 0, n.created_at, n.updated_at
from public.topic_notes n
where length(trim(n.markdown_content)) > 0
  and not exists (
    select 1 from public.topic_blocks b
    where b.topic_id = n.topic_id and b.block_type = 'text'
  );

insert into public.topic_blocks
  (user_id, topic_id, block_type, storage_path, original_filename, mime_type, order_index, created_at, updated_at)
select a.user_id, a.topic_id,
  case when a.mime_type like 'image/%' then 'image' else 'file' end,
  a.storage_path, a.original_filename, a.mime_type,
  1000 + row_number() over (partition by a.topic_id order by a.created_at, a.id),
  a.created_at, a.created_at
from public.topic_assets a
where not exists (
  select 1 from public.topic_blocks b where b.storage_path = a.storage_path
);
