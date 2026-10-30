-- Phase 4: scheduled entries are proposals, NOT ledger postings.
-- Additive migration; staging validation required before any live execution.
begin;

create table public.finance_planned_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  amount_minor bigint not null check (amount_minor between 1 and 1000000000000),
  due_date date not null,
  account_id uuid not null,
  category_id uuid,
  merchant text not null default '' check (length(merchant)<=200),
  note text not null default '' check (length(note)<=2000),
  status text not null default 'planned' check (status in ('planned','cancelled','posted')),
  revision integer not null default 1 check (revision>0),
  posted_transaction_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,id),
  foreign key (user_id,account_id) references public.finance_accounts(user_id,id),
  foreign key (user_id,category_id) references public.finance_categories(user_id,id),
  foreign key (user_id,posted_transaction_id) references public.finance_transactions(user_id,id),
  check ((kind='expense' and category_id is not null) or (kind='income' and category_id is null)),
  check ((status='posted')=(posted_transaction_id is not null))
);
create index finance_plans_owner_date on public.finance_planned_entries(user_id,due_date,status);
alter table public.finance_planned_entries enable row level security;
create policy finance_plans_owner_read on public.finance_planned_entries
  for select to authenticated using(auth.uid()=user_id);
revoke insert,update,delete on public.finance_planned_entries from public,anon,authenticated;
grant select on public.finance_planned_entries to authenticated;

create table public.finance_plan_operations (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_key uuid not null,
  plan_id uuid not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key(user_id,operation_key),
  foreign key(user_id,plan_id) references public.finance_planned_entries(user_id,id)
);
alter table public.finance_plan_operations enable row level security;
create policy finance_plan_operations_owner on public.finance_plan_operations
  for select to authenticated using(auth.uid()=user_id);
revoke insert,update,delete on public.finance_plan_operations from public,anon,authenticated;
grant select on public.finance_plan_operations to authenticated;

create view public.finance_plan_details with (security_invoker=true) as
select p.id,p.user_id,p.kind,p.amount_minor::text as amount_minor,p.due_date,
       p.account_id,p.category_id,p.merchant,p.note,p.status,p.revision,
       p.posted_transaction_id,p.created_at,p.updated_at
from public.finance_planned_entries p;
revoke all on public.finance_plan_details from public,anon;
grant select on public.finance_plan_details to authenticated;

-- Every edit or cancellation is owner-scoped, version-checked and audited.
create function public.finance_upsert_plan(
 p_operation_key uuid,p_kind text,p_amount_minor bigint,p_due_date date,
 p_account_id uuid,p_category_id uuid default null,p_merchant text default '',
 p_note text default '',p_plan_id uuid default null,
 p_expected_revision integer default null,p_cancel boolean default false
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid();
 prev public.finance_planned_entries%rowtype;
 plan_id uuid;
 fingerprint jsonb;
 existing record;
 action_name text;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_operation_key is null then raise exception 'Operation key required'; end if;
 perform 1 from public.finance_preferences where user_id=u for update;
 if not found then raise exception 'Initialize finance first'; end if;
 fingerprint:=jsonb_build_object('kind',p_kind,'amount',p_amount_minor,'due',p_due_date,
    'account',p_account_id,'category',p_category_id,'merchant',p_merchant,'note',p_note,
    'plan',p_plan_id,'expected',p_expected_revision,'cancel',p_cancel);
 select * into existing from public.finance_plan_operations
   where user_id=u and operation_key=p_operation_key;
 if found then
   if existing.payload is distinct from fingerprint then
     raise exception 'Operation key reused with different scheduled entry'; end if;
   return existing.plan_id;
 end if;
 if p_plan_id is null then
   if p_expected_revision is not null or p_cancel then
     raise exception 'Invalid new scheduled entry operation'; end if;
 else
   select * into prev from public.finance_planned_entries
    where user_id=u and id=p_plan_id for update;
   if not found then raise exception 'Scheduled entry not found'; end if;
   if prev.status<>'planned' then raise exception 'Scheduled entry is no longer editable'; end if;
   if p_expected_revision is distinct from prev.revision then
     raise exception 'Scheduled entry revision conflict'; end if;
 end if;
 if p_cancel then
   update public.finance_planned_entries
     set status='cancelled',revision=revision+1,updated_at=now()
     where user_id=u and id=p_plan_id returning id into plan_id;
   action_name:='plan-cancel';
 else
   if p_kind not in ('income','expense') or p_amount_minor is null or
      p_amount_minor not between 1 and 1000000000000 or p_due_date is null
      or length(coalesce(p_merchant,''))>200 or length(coalesce(p_note,''))>2000
      or p_account_id is null
      or (p_kind='expense' and p_category_id is null)
      or (p_kind='income' and p_category_id is not null)
   then raise exception 'Invalid scheduled transaction'; end if;
   if not exists(select 1 from public.finance_accounts a where a.user_id=u
       and a.id=p_account_id and a.is_active and a.currency='TWD')
   then raise exception 'Account is not active or not owned'; end if;
   if p_category_id is not null and not exists(
       select 1 from public.finance_categories c
       where c.id=p_category_id and c.user_id=u and not c.is_archived)
   then raise exception 'Category not available'; end if;
   if p_plan_id is null then
     insert into public.finance_planned_entries(
       user_id,kind,amount_minor,due_date,account_id,category_id,merchant,note
     ) values(u,p_kind,p_amount_minor,p_due_date,p_account_id,p_category_id,
       coalesce(p_merchant,''),coalesce(p_note,''))
     returning id into plan_id;
     action_name:='plan-create';
   else
     update public.finance_planned_entries set
       kind=p_kind,amount_minor=p_amount_minor,due_date=p_due_date,
       account_id=p_account_id,category_id=p_category_id,merchant=coalesce(p_merchant,''),
       note=coalesce(p_note,''),revision=revision+1,updated_at=now()
       where id=p_plan_id and user_id=u returning id into plan_id;
     action_name:='plan-update';
   end if;
 end if;
 insert into public.finance_plan_operations(user_id,operation_key,plan_id,payload)
 values(u,p_operation_key,plan_id,fingerprint);
 insert into public.finance_audit_events(
   user_id,entity_type,entity_id,action,before_state,after_state)
 values(u,'plan',plan_id,action_name,
   case when p_plan_id is null then null else to_jsonb(prev) end,
   (select to_jsonb(p) from public.finance_planned_entries p where p.id=plan_id and p.user_id=u));
 return plan_id;
end $$;

-- A future schedule becomes real money ONLY after this explicit action and its due date.
-- Repeated confirmation cannot post twice, even with a different key.
create function public.finance_post_plan(
 p_operation_key uuid,p_plan_id uuid,p_expected_revision integer
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid();
 plan public.finance_planned_entries%rowtype;
 already uuid;
 posted uuid;
 owner_timezone text;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_operation_key is null or p_plan_id is null then raise exception 'Invalid planned posting'; end if;
 select timezone into owner_timezone from public.finance_preferences where user_id=u for update;
 if not found then raise exception 'Initialize finance first'; end if;
 select * into plan from public.finance_planned_entries where user_id=u and id=p_plan_id for update;
 if not found then raise exception 'Scheduled entry not found'; end if;
 if plan.status='posted' then
   select transaction_id into already from public.finance_ledger_events
    where user_id=u and operation_key=p_operation_key;
   if found and already=plan.posted_transaction_id then return already; end if;
   raise exception 'This scheduled entry was already posted'; end if;
 if plan.status<>'planned' then raise exception 'Cancelled planned entry cannot be posted'; end if;
 if p_expected_revision is distinct from plan.revision then raise exception 'Scheduled entry revision conflict'; end if;
 if plan.due_date > (now() at time zone owner_timezone)::date
 then raise exception 'Future scheduled entries must not affect current balances'; end if;
 posted:=public.finance_put_transaction(
    p_operation_key,plan.kind,plan.amount_minor,plan.due_date,
    case when plan.kind='expense' then plan.account_id else null end,
    case when plan.kind='income' then plan.account_id else null end,
    plan.category_id,plan.merchant,plan.note);
 update public.finance_planned_entries set status='posted',posted_transaction_id=posted,
    revision=revision+1,updated_at=now() where user_id=u and id=p_plan_id;
 insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
 values(u,'plan',p_plan_id,'plan-post',to_jsonb(plan),
   (select to_jsonb(p) from public.finance_planned_entries p where p.id=p_plan_id and p.user_id=u));
 return posted;
end $$;

-- A previous manually observed balance must not be silently reinterpreted
-- by editing/voiding cash flow that it already reconciled.
create function public.finance_guard_reconciled_edit()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.kind in ('income','expense','transfer') and
   (
     new.kind is distinct from old.kind or
     new.amount_minor is distinct from old.amount_minor or
     new.source_account_id is distinct from old.source_account_id or
     new.destination_account_id is distinct from old.destination_account_id or
     new.txn_date is distinct from old.txn_date or
     new.voided_at is distinct from old.voided_at
   ) and exists (
     select 1 from public.finance_audit_events h
     where h.user_id=old.user_id and h.entity_type='account' and h.action='reconcile'
       and h.created_at >= old.created_at and
       h.entity_id in (old.source_account_id,old.destination_account_id)
   ) then
   raise exception 'This transaction predates a balance reconciliation. Recheck the bank and reconcile explicitly before changing its effect.';
 end if;
 return new;
end $$;
create trigger finance_reconciled_edit_guard
  before update on public.finance_transactions
  for each row execute function public.finance_guard_reconciled_edit();

revoke all on function public.finance_upsert_plan(
 uuid,text,bigint,date,uuid,uuid,text,text,uuid,integer,boolean
) from public,anon;
revoke all on function public.finance_post_plan(uuid,uuid,integer) from public,anon;
revoke all on function public.finance_guard_reconciled_edit() from public,anon,authenticated;
grant execute on function public.finance_upsert_plan(
 uuid,text,bigint,date,uuid,uuid,text,text,uuid,integer,boolean
) to authenticated;
grant execute on function public.finance_post_plan(uuid,uuid,integer) to authenticated;
commit;
