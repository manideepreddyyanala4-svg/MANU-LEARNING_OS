-- Phase 6: future purchase allocation metadata and per-day owner-scoped breakdown.
-- No new bank postings. Requires migrations 009 through 014.
begin;

alter table public.finance_planned_entries
  add column allocation_rules jsonb not null default '[]'::jsonb;
alter table public.finance_planned_entries
  add constraint finance_plan_allocation_array
  check(jsonb_typeof(allocation_rules)='array'
    and jsonb_array_length(allocation_rules)<=100);

-- Append only: existing view columns retain their exact order and types.
create or replace view public.finance_plan_details with (security_invoker=true) as
select p.id,p.user_id,p.kind,p.amount_minor::text as amount_minor,p.due_date,
       p.account_id,p.category_id,p.merchant,p.note,p.status,p.revision,
       p.posted_transaction_id,p.created_at,p.updated_at,p.allocation_rules
from public.finance_planned_entries p;
revoke all on public.finance_plan_details from public,anon;
grant select on public.finance_plan_details to authenticated;

-- Do not alter the Phase 4 plan RPC signature. This companion RPC atomically
-- stores future grocery definitions and rejects stale edits and duplicate keys.
create function public.finance_upsert_allocated_plan(
 p_operation_key uuid,p_amount_minor bigint,p_due_date date,
 p_account_id uuid,p_category_id uuid,
 p_merchant text default '',p_note text default '',
 p_plan_id uuid default null,p_expected_revision integer default null,
 p_allocations jsonb default '[]'::jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid();
 previous public.finance_planned_entries%rowtype;
 plan_id uuid;
 fingerprint jsonb;
 old_operation record;
 item jsonb;
 total numeric:=0;
 amount bigint;
 item_category uuid;
 action_name text;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_operation_key is null then raise exception 'Operation key required'; end if;
 perform 1 from public.finance_preferences where user_id=u for update;
 if not found then raise exception 'Initialize finance first'; end if;
 fingerprint:=jsonb_build_object('kind','expense','amount',p_amount_minor,
   'due',p_due_date,'account',p_account_id,'category',p_category_id,
   'merchant',p_merchant,'note',p_note,'plan',p_plan_id,
   'expected',p_expected_revision,'cancel',false,'allocations',p_allocations);
 select * into old_operation from public.finance_plan_operations
   where user_id=u and operation_key=p_operation_key;
 if found then
   if old_operation.payload is distinct from fingerprint
   then raise exception 'Operation key reused with different allocated purchase'; end if;
   return old_operation.plan_id;
 end if;
 if p_amount_minor is null or p_amount_minor not between 1 and 1000000000000
   or p_due_date is null or p_account_id is null or p_category_id is null
   or length(coalesce(p_merchant,''))>200 or length(coalesce(p_note,''))>2000
 then raise exception 'Invalid scheduled grocery purchase'; end if;
 if jsonb_typeof(p_allocations) is distinct from 'array'
   or jsonb_array_length(p_allocations)>100
 then raise exception 'Invalid scheduled allocation array'; end if;
 if not exists(select 1 from public.finance_accounts a
   where a.user_id=u and a.id=p_account_id and a.is_active and a.currency='TWD')
 then raise exception 'Account is unavailable'; end if;
 if not exists(select 1 from public.finance_categories c
   where c.user_id=u and c.id=p_category_id and not c.is_archived)
 then raise exception 'Category is unavailable'; end if;
 for item in select value from jsonb_array_elements(p_allocations) loop
   if jsonb_typeof(item) <> 'object'
   then raise exception 'Invalid grocery allocation'; end if;
   if (item->>'amountMinor') is null
     or (item->>'amountMinor') !~ '^[1-9][0-9]*$'
     or (item->>'startDate') is null
     or (item->>'durationDays') is null
     or (item->>'durationDays') !~ '^[1-9][0-9]*$'
   then raise exception 'Invalid allocated amount, date or duration'; end if;
   amount:=(item->>'amountMinor')::bigint;
   if amount not between 1 and 1000000000000
      or (item->>'durationDays')::integer not between 1 and 3650
      or length(coalesce(item->>'itemName',''))>200
   then raise exception 'Allocation item outside allowed limits'; end if;
   perform (item->>'startDate')::date;
   item_category:=nullif(item->>'categoryId','')::uuid;
   if item_category is not null and not exists(
     select 1 from public.finance_categories c where c.user_id=u and c.id=item_category
   ) then raise exception 'Allocation category not owned'; end if;
   total:=total+amount;
 end loop;
 if jsonb_array_length(p_allocations)>0 and total<>p_amount_minor
 then raise exception 'Allocation items must equal the purchase amount'; end if;
 if p_plan_id is null then
   if p_expected_revision is not null
   then raise exception 'Revision must be empty for new purchase'; end if;
   insert into public.finance_planned_entries(
      user_id,kind,amount_minor,due_date,account_id,category_id,merchant,note,allocation_rules
   ) values(u,'expense',p_amount_minor,p_due_date,p_account_id,p_category_id,
     coalesce(p_merchant,''),coalesce(p_note,''),p_allocations)
   returning id into plan_id;
   action_name:='plan-create';
 else
   select * into previous from public.finance_planned_entries
   where user_id=u and id=p_plan_id for update;
   if not found then raise exception 'Scheduled purchase not found'; end if;
   if previous.status<>'planned' or previous.kind<>'expense'
   then raise exception 'Only pending grocery purchases may be edited'; end if;
   if p_expected_revision is distinct from previous.revision
   then raise exception 'Scheduled purchase revision conflict'; end if;
   update public.finance_planned_entries set
      amount_minor=p_amount_minor,due_date=p_due_date,account_id=p_account_id,
      category_id=p_category_id,merchant=coalesce(p_merchant,''),
      note=coalesce(p_note,''),allocation_rules=p_allocations,
      revision=revision+1,updated_at=now()
   where user_id=u and id=p_plan_id returning id into plan_id;
   action_name:='plan-update';
 end if;
 insert into public.finance_plan_operations(user_id,operation_key,plan_id,payload)
 values(u,p_operation_key,plan_id,fingerprint);
 insert into public.finance_audit_events(
   user_id,entity_type,entity_id,action,before_state,after_state
 ) values(u,'plan',plan_id,action_name,
   case when p_plan_id is null then null else to_jsonb(previous) end,
   (select to_jsonb(p) from public.finance_planned_entries p
    where p.id=plan_id and p.user_id=u));
 return plan_id;
end $$;

-- Preserve existing Phase 4 posting behavior, but pass through the validated
-- original allocation definitions with the single atomic ledger transaction.
create or replace function public.finance_post_plan(
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
   p_operation_key=>p_operation_key,p_kind=>plan.kind,p_amount_minor=>plan.amount_minor,
   p_txn_date=>plan.due_date,
   p_source_account_id=>case when plan.kind='expense' then plan.account_id else null end,
   p_destination_account_id=>case when plan.kind='income' then plan.account_id else null end,
   p_category_id=>plan.category_id,p_merchant=>plan.merchant,p_note=>plan.note,
   p_allocations=>plan.allocation_rules
 );
 update public.finance_planned_entries set status='posted',posted_transaction_id=posted,
   revision=revision+1,updated_at=now() where user_id=u and id=p_plan_id;
 insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
 values(u,'plan',p_plan_id,'plan-post',to_jsonb(plan),
   (select to_jsonb(p) from public.finance_planned_entries p where p.id=p_plan_id and p.user_id=u));
 return posted;
end $$;

-- One-day, owner-only, page-bounded breakdown; never an additional posting.
create function public.finance_day_cost_breakdown(
 p_day date,p_limit integer default 50,p_offset integer default 0
) returns table(
 transaction_id uuid,merchant text,txn_date date,category_id uuid,
 item_name text,amount_minor text,attribution_type text
) language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_day is null or p_limit is null or p_limit not between 1 and 100
    or p_offset is null or p_offset<0
 then raise exception 'Invalid daily breakdown request'; end if;
 return query
 with ordinary as (
   select t.id as transaction_id,t.merchant,t.txn_date,t.category_id,
     ''::text as item_name,t.amount_minor::numeric as amount_minor,
     'single'::text as attribution_type
   from public.finance_transactions t
   where t.user_id=u and t.kind='expense' and t.voided_at is null
     and t.txn_date=p_day
     and not exists(select 1 from public.finance_allocation_rules r
       where r.user_id=u and r.transaction_id=t.id)
 ), spread as (
   select t.id as transaction_id,t.merchant,t.txn_date,
     coalesce(r.category_id,t.category_id) as category_id,
     r.item_name,
     (pg_catalog.trunc(r.amount_minor::numeric/r.duration_days,0)+
       case when (p_day-r.start_date) <
         pg_catalog.mod(r.amount_minor::numeric,r.duration_days::numeric)
       then 1 else 0 end) as amount_minor,
     'allocated'::text as attribution_type
   from public.finance_allocation_rules r
   join public.finance_transactions t on t.user_id=r.user_id
     and t.id=r.transaction_id and t.kind='expense' and t.voided_at is null
   where r.user_id=u and r.start_date<=p_day
     and (r.start_date+r.duration_days)>p_day
 ), details as (
   select * from ordinary union all select * from spread
 )
 select d.transaction_id,d.merchant,d.txn_date,d.category_id,
    d.item_name,d.amount_minor::text,d.attribution_type
 from details d order by d.merchant,d.transaction_id,d.item_name
 limit p_limit offset p_offset;
end $$;

create index finance_rules_owner_transaction_idx
 on public.finance_allocation_rules(user_id,transaction_id);
revoke all on function public.finance_upsert_allocated_plan(
 uuid,bigint,date,uuid,uuid,text,text,uuid,integer,jsonb
) from public,anon;
revoke all on function public.finance_day_cost_breakdown(date,integer,integer)
 from public,anon;
grant execute on function public.finance_upsert_allocated_plan(
 uuid,bigint,date,uuid,uuid,text,text,uuid,integer,jsonb
) to authenticated;
grant execute on function public.finance_day_cost_breakdown(date,integer,integer)
 to authenticated;
commit;
