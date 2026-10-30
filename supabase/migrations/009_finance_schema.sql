-- Finance foundation, additive only. Apply AFTER auditing live migrations 001–008.
-- Do not apply to production until reviewed against live Supabase schema.
begin;

create table if not exists public.finance_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_currency text not null default 'TWD' check (display_currency in ('TWD','INR')),
  timezone text not null default 'Asia/Taipei' check (length(timezone) between 1 and 80),
  current_fx_rate_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null check (length(code) between 1 and 100),
  name text not null check (length(trim(name)) between 1 and 100),
  kind text not null check (kind in ('bank','cash')),
  currency text not null default 'TWD' check (currency = 'TWD'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id,id),
  unique (user_id,code)
);

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null check (length(code) between 1 and 100),
  name text not null check (length(trim(name)) between 1 and 80),
  is_default boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id,id),
  unique (user_id,code)
);
create unique index if not exists finance_categories_owner_name_uniq
  on public.finance_categories(user_id, lower(name));

create table if not exists public.finance_fx_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  twd_per_inr numeric(20,8) not null check (twd_per_inr > 0),
  rate_source text not null default 'manual' check (rate_source = 'manual'),
  note text not null default '',
  recorded_at timestamptz not null default now(),
  unique (user_id,id)
);

alter table public.finance_preferences
  add constraint finance_preferences_current_fx_fk
  foreign key (user_id,current_fx_rate_id)
  references public.finance_fx_rates(user_id,id);

create table if not exists public.finance_monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null check (extract(day from month_start) = 1),
  budget_minor bigint not null check (budget_minor between 0 and 1000000000000),
  budget_currency text not null check (budget_currency in ('TWD','INR')),
  fx_rate_id uuid,
  fx_twd_per_inr numeric(20,8),
  resolved_twd_minor bigint not null check (resolved_twd_minor between 0 and 1000000000000),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id,id),
  unique (user_id,month_start),
  foreign key (user_id,fx_rate_id) references public.finance_fx_rates(user_id,id),
  check (
    (budget_currency = 'TWD' and fx_rate_id is null and fx_twd_per_inr is null and resolved_twd_minor = budget_minor)
    or
    (budget_currency = 'INR' and fx_rate_id is not null and fx_twd_per_inr > 0)
  )
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('opening','income','expense','transfer','adjustment')),
  amount_minor bigint not null check (amount_minor between -1000000000000 and 1000000000000),
  currency text not null default 'TWD' check (currency = 'TWD'),
  txn_date date not null,
  txn_time time without time zone not null default '12:00',
  source_account_id uuid,
  destination_account_id uuid,
  category_id uuid,
  merchant text not null default '' check (length(merchant) <= 200),
  note text not null default '' check (length(note) <= 2000),
  revision integer not null default 1 check (revision > 0),
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id,id),
  foreign key (user_id,source_account_id) references public.finance_accounts(user_id,id),
  foreign key (user_id,destination_account_id) references public.finance_accounts(user_id,id),
  foreign key (user_id,category_id) references public.finance_categories(user_id,id),
  check (
    (kind = 'opening' and amount_minor >= 0 and source_account_id is null and destination_account_id is not null and category_id is null)
    or (kind = 'income' and amount_minor > 0 and source_account_id is null and destination_account_id is not null and category_id is null)
    or (kind = 'expense' and amount_minor > 0 and source_account_id is not null and destination_account_id is null)
    or (kind = 'transfer' and amount_minor > 0 and source_account_id is not null and destination_account_id is not null and source_account_id <> destination_account_id and category_id is null)
    or (kind = 'adjustment' and amount_minor <> 0 and source_account_id is not null and destination_account_id is null and category_id is null and length(trim(note)) >= 1)
  )
);
-- Exactly one opening entry per account, including voided entries.
create unique index if not exists finance_one_opening_per_account
  on public.finance_transactions(user_id,destination_account_id) where kind='opening';
create index if not exists finance_transactions_user_date_idx
  on public.finance_transactions(user_id,txn_date desc,created_at desc);
create index if not exists finance_transactions_user_kind_date_idx
  on public.finance_transactions(user_id,kind,txn_date) where voided_at is null;

create table if not exists public.finance_allocation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null,
  category_id uuid,
  item_name text not null default '' check (length(item_name) <= 200),
  amount_minor bigint not null check (amount_minor between 1 and 1000000000000),
  start_date date not null,
  duration_days integer not null check (duration_days between 1 and 3650),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id,id),
  unique(transaction_id,sort_order),
  foreign key (user_id,transaction_id) references public.finance_transactions(user_id,id),
  foreign key (user_id,category_id) references public.finance_categories(user_id,id)
);
create index if not exists finance_rules_user_start_idx
  on public.finance_allocation_rules(user_id,start_date);

create table if not exists public.finance_ledger_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null,
  revision integer not null check(revision >= 1),
  action text not null check(action in ('create','replace','void')),
  operation_key uuid not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now(),
  unique(user_id,id),
  unique(user_id,operation_key),
  unique(transaction_id,revision),
  foreign key (user_id,transaction_id) references public.finance_transactions(user_id,id)
);

create table if not exists public.finance_postings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ledger_event_id uuid not null,
  account_id uuid not null,
  delta_minor bigint not null check (delta_minor <> 0 and delta_minor between -1000000000000 and 1000000000000),
  created_at timestamptz not null default now(),
  unique(user_id,id),
  foreign key (user_id,ledger_event_id) references public.finance_ledger_events(user_id,id),
  foreign key (user_id,account_id) references public.finance_accounts(user_id,id)
);
create index if not exists finance_postings_user_account_idx
  on public.finance_postings(user_id,account_id);

create table if not exists public.finance_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now(),
  unique(user_id,id)
);
create index if not exists finance_audit_user_time_idx
  on public.finance_audit_events(user_id,created_at desc);

-- All finance rows are readable only by their owner. No direct client writes.
do $$
declare t text;
begin
  foreach t in array array[
    'finance_preferences','finance_accounts','finance_categories','finance_fx_rates',
    'finance_monthly_budgets','finance_transactions','finance_allocation_rules',
    'finance_ledger_events','finance_postings','finance_audit_events'
  ] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',t || '_owner_read',t);
    execute format('revoke insert,update,delete on public.%I from public,anon,authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
end $$;

-- Balances are always derived from immutable postings. No balance cache.
create or replace view public.finance_account_balances
  with (security_invoker = true) as
select a.user_id,a.id as account_id,a.code,a.name,a.kind,a.currency,a.is_active,
       coalesce(sum(p.delta_minor),0)::bigint as balance_minor
from public.finance_accounts a
left join public.finance_postings p on p.user_id=a.user_id and p.account_id=a.id
group by a.user_id,a.id,a.code,a.name,a.kind,a.currency,a.is_active;
revoke all on public.finance_account_balances from public,anon;
grant select on public.finance_account_balances to authenticated;

commit;