-- Phase 9: DEVELOPMENT / CI ONLY. Read-only and intentionally not an RPC.
-- Run under a privileged, local staging connection AFTER finance test fixtures.
-- A nonzero discrepancy fails CI; never silently repair or alter records.
do $$
declare
 discrepancies bigint;
begin
 -- Every owner-scoped balance is exactly the active transaction algebra.
 with expected as (
   select a.user_id,a.id as account_id,
     coalesce(sum(case
       when t.kind in ('opening','income') and t.destination_account_id=a.id
         then t.amount_minor::numeric
       when t.kind='expense' and t.source_account_id=a.id
         then -t.amount_minor::numeric
       when t.kind='adjustment' and t.source_account_id=a.id
         then t.amount_minor::numeric
       when t.kind='transfer' and t.source_account_id=a.id
         then -t.amount_minor::numeric
       when t.kind='transfer' and t.destination_account_id=a.id
         then t.amount_minor::numeric
       else 0 end),0) as amount
   from public.finance_accounts a
   left join public.finance_transactions t on t.user_id=a.user_id
     and t.voided_at is null and
       (t.source_account_id=a.id or t.destination_account_id=a.id)
   group by a.user_id,a.id
 ), actual as (
   select a.user_id,a.id as account_id,
     coalesce(sum(p.delta_minor::numeric),0) as amount
   from public.finance_accounts a
   left join public.finance_postings p on p.user_id=a.user_id and p.account_id=a.id
   group by a.user_id,a.id
 )
 select count(*) into discrepancies from expected e
 join actual p using(user_id,account_id) where e.amount<>p.amount;
 if discrepancies<>0 then raise exception 'Ledger account mismatch count: %',discrepancies; end if;

 -- No active expense may carry broken or double-counted item allocations.
 select count(*) into discrepancies from (
   select r.user_id,r.transaction_id,sum(r.amount_minor::numeric) as total,
     max(t.amount_minor::numeric) as paid,
     bool_and(t.kind='expense' and t.voided_at is null) as active
   from public.finance_allocation_rules r
   left join public.finance_transactions t
     on t.user_id=r.user_id and t.id=r.transaction_id
   group by r.user_id,r.transaction_id
 ) a where a.total is distinct from a.paid or a.active is distinct from true;
 if discrepancies<>0 then raise exception 'Allocation integrity mismatch count: %',discrepancies; end if;

 select count(*) into discrepancies
 from public.finance_postings p
 left join public.finance_ledger_events e
   on e.user_id=p.user_id and e.id=p.ledger_event_id
 left join public.finance_accounts a
   on a.user_id=p.user_id and a.id=p.account_id
 where e.id is null or a.id is null;
 if discrepancies<>0 then raise exception 'Orphan ledger postings: %',discrepancies; end if;

 select count(*) into discrepancies
 from public.finance_ledger_events e
 left join public.finance_transactions t
   on t.user_id=e.user_id and t.id=e.transaction_id
 where t.id is null;
 if discrepancies<>0 then raise exception 'Orphan transaction journal: %',discrepancies; end if;

 select count(*) into discrepancies from (
   select user_id,operation_key,count(*) n
   from public.finance_ledger_events
   group by user_id,operation_key having count(*)>1
 ) d;
 if discrepancies<>0 then raise exception 'Duplicate operation keys: %',discrepancies; end if;

 select count(*) into discrepancies
 from public.finance_transactions t
 where t.currency<>'TWD' or t.amount_minor is null;
 if discrepancies<>0 then raise exception 'Unsupported ledger currencies: %',discrepancies; end if;

 raise notice 'FINANCE INTEGRITY PASS: accounts, postings, owner FKs, allocation totals, operation keys and TWD money';
end $$;
