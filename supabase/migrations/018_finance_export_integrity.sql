-- Phase 9 security, audit and export. Additive, read-only diagnostics and
-- a consistency-preserving guard for historical transactions after reconciliation.
-- No production records altered. Apply only after 009-017 have been reviewed.
begin;

-- A reconciled bank statement is an observed balance at a historical date.
-- Creating a new transaction *after* reconciliation but dating it at or
-- before that checkpoint silently makes the checkpoint mathematically false.
-- Block that operation; keep the audit history and ask for a new reconciliation.
create function public.finance_guard_backdated_reconciliation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.kind not in ('income','expense','transfer') then return new; end if;
 if tg_op='UPDATE' and not (
   new.amount_minor is distinct from old.amount_minor or
   new.txn_date is distinct from old.txn_date or
   new.source_account_id is distinct from old.source_account_id or
   new.destination_account_id is distinct from old.destination_account_id or
   new.kind is distinct from old.kind or new.voided_at is distinct from old.voided_at
 ) then return new; end if;

 if exists (
   select 1 from public.finance_audit_events h
   join public.finance_transactions adjustment
     on adjustment.user_id=h.user_id
       and adjustment.id::text=h.after_state->>'transactionId'
       and adjustment.kind='adjustment'
   where h.user_id=new.user_id and h.entity_type='account'
     and h.action='reconcile'
     and h.entity_id in (new.source_account_id,new.destination_account_id)
     and adjustment.txn_date>=new.txn_date
     and (tg_op='INSERT' or h.created_at<new.created_at)
 ) then
   raise exception 'A bank balance was already reconciled on or after this date. Record the correction on a later date and reconcile again; do not rewrite earlier bank history.'
     using errcode='23514';
 end if;
 return new;
end $$;
create trigger finance_guard_backdated_reconciliation
  before insert or update on public.finance_transactions
  for each row execute function public.finance_guard_backdated_reconciliation();
revoke all on function public.finance_guard_backdated_reconciliation()
 from public,anon,authenticated;

-- A single PostgreSQL statement has one consistent MVCC snapshot and does not
-- rely on browser pages or PostgREST's 1000-row default response limit.
-- This is a full owner-owned archive, including ledger/audit provenance,
-- schedule operation idempotency records, revisions and manual exchange rates.
create function public.finance_full_backup()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if not exists(select 1 from public.finance_preferences p where p.user_id=u)
 then raise exception 'Initialize finance first'; end if;
 select jsonb_build_object(
  'format','manuos-finance-full-backup',
  'version',2,
  'exportedAt',now(),
  'ownerId',u,
  'source','manually-entered finance ledger; not bank-verified',
  'accounts',(select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at,a.id),'[]'::jsonb)
    from public.finance_accounts a where a.user_id=u),
  'preferences',(select to_jsonb(p) from public.finance_preferences p where p.user_id=u),
  'categories',(select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at,c.id),'[]'::jsonb)
    from public.finance_categories c where c.user_id=u),
  'fxRates',(select coalesce(jsonb_agg(to_jsonb(f) order by f.recorded_at,f.id),'[]'::jsonb)
    from public.finance_fx_rates f where f.user_id=u),
  'monthlyBudgets',(select coalesce(jsonb_agg(to_jsonb(b) order by b.month_start,b.id),'[]'::jsonb)
    from public.finance_monthly_budgets b where b.user_id=u),
  'transactions',(select coalesce(jsonb_agg(
    to_jsonb(t) || jsonb_build_object('amount_minor',t.amount_minor::text)
    order by t.created_at,t.id),'[]'::jsonb)
    from public.finance_transactions t where t.user_id=u),
  'allocations',(select coalesce(jsonb_agg(
    to_jsonb(r) || jsonb_build_object('amount_minor',r.amount_minor::text)
    order by r.transaction_id,r.sort_order,r.id),'[]'::jsonb)
    from public.finance_allocation_rules r where r.user_id=u),
  'ledgerEvents',(select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at,e.id),'[]'::jsonb)
    from public.finance_ledger_events e where e.user_id=u),
  'postings',(select coalesce(jsonb_agg(
    to_jsonb(po) || jsonb_build_object('delta_minor',po.delta_minor::text)
    order by po.created_at,po.id),'[]'::jsonb)
    from public.finance_postings po where po.user_id=u),
  'auditEvents',(select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at,a.id),'[]'::jsonb)
    from public.finance_audit_events a where a.user_id=u),
  'plannedEntries',(select coalesce(jsonb_agg(
    to_jsonb(p) || jsonb_build_object('amount_minor',p.amount_minor::text)
    order by p.created_at,p.id),'[]'::jsonb)
    from public.finance_planned_entries p where p.user_id=u),
  'planOperations',(select coalesce(jsonb_agg(to_jsonb(p) order by p.operation_key),'[]'::jsonb)
    from public.finance_plan_operations p where p.user_id=u)
 ) into result;
 if pg_catalog.pg_column_size(result)>33554432
 then raise exception 'Finance backup exceeds safe browser download size. Contact the administrator for a complete database export. No partial backup was returned.'; end if;
 return result;
end $$;
revoke all on function public.finance_full_backup() from public,anon;
grant execute on function public.finance_full_backup() to authenticated;

-- Read-only authenticated ledger invariant check; no service credentials,
-- repair side effects or privileged disclosure. Each discrepancy is a count.
create function public.finance_integrity_report()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 with tx as (
   select * from public.finance_transactions where user_id=u
 ), expected as (
   select t.id as transaction_id,t.destination_account_id account_id,
      t.amount_minor::numeric amount
   from tx t where t.voided_at is null and t.kind in ('opening','income')
   union all
   select t.id,t.source_account_id,
     case when t.kind='adjustment' then t.amount_minor::numeric
          else -t.amount_minor::numeric end
   from tx t where t.voided_at is null and t.kind in ('expense','transfer','adjustment')
   union all
   select t.id,t.destination_account_id,t.amount_minor::numeric
   from tx t where t.voided_at is null and t.kind='transfer'
 ), actual as (
   select ev.transaction_id,p.account_id,sum(p.delta_minor::numeric) amount
   from public.finance_postings p
   join public.finance_ledger_events ev on ev.id=p.ledger_event_id
     and ev.user_id=u and ev.user_id=p.user_id
   where p.user_id=u
   group by ev.transaction_id,p.account_id
 ), differences as (
   select coalesce(e.transaction_id,a.transaction_id) id,
     coalesce(e.account_id,a.account_id) account_id,
     coalesce(e.amount,0)-coalesce(a.amount,0) diff
   from expected e full join actual a on a.transaction_id=e.transaction_id
     and a.account_id=e.account_id
   where coalesce(e.amount,0)<>coalesce(a.amount,0)
 ), allocations as (
   select r.transaction_id,sum(r.amount_minor::numeric) allocated
   from public.finance_allocation_rules r where r.user_id=u
   group by r.transaction_id
 ), rules_wrong as (
   select t.id from tx t join allocations a on a.transaction_id=t.id
   where t.kind<>'expense' or a.allocated<>t.amount_minor::numeric
 ), unrelated as (
   select count(*) amount from public.finance_postings po
   left join public.finance_ledger_events ev on ev.id=po.ledger_event_id
     and ev.user_id=po.user_id
   where po.user_id=u and ev.id is null
 ), dupes as (
   select count(*) amount from (
     select operation_key from public.finance_ledger_events
     where user_id=u group by operation_key having count(*)>1
   ) x
 )
 select jsonb_build_object(
   'checkedAt',now(),'ownerId',u,
   'transactionCount',(select count(*) from tx),
   'ledgerEventCount',(select count(*) from public.finance_ledger_events where user_id=u),
   'postingCount',(select count(*) from public.finance_postings where user_id=u),
   'accountMismatchCount',(select count(*) from differences),
   'allocationMismatchCount',(select count(*) from rules_wrong),
   'orphanPostingCount',(select amount from unrelated),
   'duplicateOperationKeyCount',(select amount from dupes),
   'healthy',((select count(*) from differences)=0
     and (select count(*) from rules_wrong)=0
     and (select amount from unrelated)=0 and (select amount from dupes)=0)
 ) into result;
 return result;
end $$;
revoke all on function public.finance_integrity_report() from public,anon;
grant execute on function public.finance_integrity_report() to authenticated;
commit;
