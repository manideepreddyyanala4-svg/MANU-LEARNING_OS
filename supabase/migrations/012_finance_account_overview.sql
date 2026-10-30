-- Phase 3: account overview derived from saved ledger/transaction state.
-- ADDITIVE. Requires finance migrations 009–011. No production execution.
begin;

-- Security-invoker views are scoped by underlying owner-only RLS.
create or replace view public.finance_account_overview
  with (security_invoker=true) as
select a.user_id,
       a.id as account_id,
       max(t.id::text) filter (where t.kind='opening' and t.voided_at is null) as opening_transaction_id,
       max(t.txn_date) filter (where t.kind='opening' and t.voided_at is null) as opening_date,
       max(t.revision) filter (where t.kind='opening' and t.voided_at is null) as opening_revision,
       coalesce(sum(t.amount_minor) filter
         (where t.kind='opening' and t.destination_account_id=a.id and t.voided_at is null),0)::text as opening_minor,
       coalesce(sum(t.amount_minor) filter
         (where t.kind='income' and t.destination_account_id=a.id and t.voided_at is null),0)::text as income_minor,
       coalesce(sum(t.amount_minor) filter
         (where t.kind='expense' and t.source_account_id=a.id and t.voided_at is null),0)::text as expense_minor,
       (
         coalesce(sum(t.amount_minor) filter
           (where t.kind='transfer' and t.destination_account_id=a.id and t.voided_at is null),0)
         -
         coalesce(sum(t.amount_minor) filter
           (where t.kind='transfer' and t.source_account_id=a.id and t.voided_at is null),0)
       )::text as net_transfer_minor,
       coalesce(sum(t.amount_minor) filter
         (where t.kind='adjustment' and t.source_account_id=a.id and t.voided_at is null),0)::text as adjustment_minor,
       max(t.updated_at) as last_activity_at,
       (
         select max(h.created_at)
         from public.finance_audit_events h
         where h.user_id=a.user_id and h.entity_type='account'
           and h.entity_id=a.id and h.action='reconcile'
       ) as last_reconciled_at
from public.finance_accounts a
left join public.finance_transactions t on t.user_id=a.user_id
  and (t.source_account_id=a.id or t.destination_account_id=a.id)
group by a.user_id,a.id;
revoke all on public.finance_account_overview from public,anon;
grant select on public.finance_account_overview to authenticated;

-- Enter missing opening balances for several accounts in a SINGLE atomic
-- database transaction. Each entry has a stable, client-generated key.
-- On a network retry those same keys return the already-created transaction IDs.
create or replace function public.finance_initialize_openings(
  p_entries jsonb
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  u uuid := auth.uid();
  item jsonb;
  account_id uuid;
  amount_minor bigint;
  operation_key uuid;
  effective_date date;
  results jsonb := '[]'::jsonb;
  seen uuid[] := array[]::uuid[];
  created_id uuid;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_entries is null or jsonb_typeof(p_entries)<>'array'
    or jsonb_array_length(p_entries)<1 or jsonb_array_length(p_entries)>20
  then raise exception 'Provide between one and twenty account openings'; end if;
  perform 1 from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  for item in select value from jsonb_array_elements(p_entries) loop
    account_id := (item->>'accountId')::uuid;
    amount_minor := (item->>'amountMinor')::bigint;
    operation_key := (item->>'operationKey')::uuid;
    effective_date := (item->>'effectiveDate')::date;
    if account_id is null or operation_key is null or effective_date is null
       or amount_minor is null or amount_minor not between 0 and 1000000000000
    then raise exception 'Invalid opening balance entry'; end if;
    if account_id = any(seen) then raise exception 'Repeated account in opening batch'; end if;
    seen := array_append(seen,account_id);
    -- An existing opening may only be replayed with its original key, not
    -- silently overwritten via first-time initialization.
    if exists(select 1 from public.finance_transactions t
      where t.user_id=u and t.kind='opening' and t.destination_account_id=account_id)
      and not exists(
        select 1 from public.finance_ledger_events e
        join public.finance_transactions t on t.user_id=e.user_id and t.id=e.transaction_id
        where e.user_id=u and e.operation_key=operation_key
          and t.kind='opening' and t.destination_account_id=account_id
      )
    then raise exception 'Opening balance already exists; use Edit Opening instead'; end if;

    created_id := public.finance_put_transaction(
      operation_key,'opening',amount_minor,effective_date,
      null,account_id,null,'Opening balance','Initial manually tracked balance'
    );
    results := results || jsonb_build_array(jsonb_build_object(
      'accountId',account_id,'transactionId',created_id
    ));
  end loop;
  return results;
end $$;

revoke all on function public.finance_initialize_openings(jsonb) from public,anon;
grant execute on function public.finance_initialize_openings(jsonb) to authenticated;

commit;