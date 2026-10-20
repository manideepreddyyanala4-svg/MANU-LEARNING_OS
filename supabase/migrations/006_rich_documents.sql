-- Rich, single-document topic storage. Legacy topic_blocks/topic_notes are
-- intentionally retained and can continue to be read by older clients.
create table if not exists public.topic_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null,
  content_json jsonb not null default '[]'::jsonb,
  plain_text text not null default '',
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id),
  foreign key (user_id, topic_id) references public.topics(user_id, id) on delete cascade
);
create index if not exists topic_documents_user_id_idx on public.topic_documents(user_id);
create index if not exists topic_documents_topic_id_idx on public.topic_documents(topic_id);
create index if not exists topic_documents_plain_text_idx on public.topic_documents using gin (to_tsvector('simple', plain_text));
alter table public.topic_documents enable row level security;
create policy topic_documents_select_own on public.topic_documents for select to authenticated using (auth.uid() = user_id);
create policy topic_documents_insert_own on public.topic_documents for insert to authenticated with check (auth.uid() = user_id);
create policy topic_documents_update_own on public.topic_documents for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy topic_documents_delete_own on public.topic_documents for delete to authenticated using (auth.uid() = user_id);
create trigger topic_documents_updated_at before update on public.topic_documents
for each row execute function public.set_updated_at();

-- Idempotent compatibility backfill for legacy text blocks. Asset metadata
-- remains in topic_assets/topic_blocks and is not copied into signed URLs.
insert into public.topic_documents (user_id, topic_id, content_json, plain_text)
select b.user_id, b.topic_id,
  coalesce(jsonb_agg(jsonb_build_object(
    'id', gen_random_uuid(), 'type', 'paragraph',
    'props', jsonb_build_object('textColor','default','backgroundColor','default','textAlignment','left'),
    'content', jsonb_build_array(jsonb_build_object('type','text','text',b.text_content,'styles',jsonb_build_object())),
    'children', jsonb_build_array()
  ) order by b.order_index, b.created_at), '[]'::jsonb),
  coalesce(string_agg(b.text_content, E'\n\n' order by b.order_index, b.created_at), '')
from public.topic_blocks b
where b.block_type = 'text' and b.text_content is not null
group by b.user_id, b.topic_id
on conflict (topic_id) do nothing;

-- Append legacy assets after migrated text. Stable application URLs are stored,
-- never expiring signed URLs.
update public.topic_documents d
set content_json = d.content_json || coalesce((
  select jsonb_agg(
    case when a.mime_type like 'image/%' then
      jsonb_build_object(
        'id', gen_random_uuid(), 'type', 'image',
        'props', jsonb_build_object(
          'url', '/api/learning-assets?path=' || a.storage_path,
          'name', a.original_filename, 'caption', a.original_filename
        ),
        'children', jsonb_build_array()
      )
    else
      jsonb_build_object(
        'id', gen_random_uuid(), 'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object(
          'type', 'link', 'href', '/api/learning-assets?path=' || a.storage_path,
          'content', a.original_filename
        )),
        'children', jsonb_build_array()
      )
    end
    order by a.created_at, a.id
  )
  from public.topic_assets a
  where a.topic_id = d.topic_id
    and not exists (
      select 1 from public.topic_documents existing
      where existing.topic_id = a.topic_id
        and existing.content_json::text like ('%' || a.storage_path || '%')
    )
), '[]'::jsonb)
where exists (select 1 from public.topic_assets a where a.topic_id = d.topic_id);
