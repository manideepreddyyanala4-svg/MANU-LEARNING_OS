-- Phase 10 release hardening, additive migration. Requires existing 009-018.
-- Database changes only in disposable CI until owner-controlled backup and restore
-- have been rehearsed. Never run on unverified production.
begin;

-- Preserves immutable event history. Legacy keys cannot be verified and will
-- not be accepted for uncertain outcome retries without an independent check.
alter table public.finance_ledger_events
  add column request_fingerprint jsonb;

create or replace function public.finance_put_transaction(
  p_operation_key uuid,
  p_kind text,
  p_amount_minor bigint,
  p_txn_date date,
  p_source_account_id uuid default null,
  p_destination_account_id uuid default null,
  p_category_id uuid default null,
  p_merchant text default '',
  p_note text default '',
  p_transaction_id uuid default null,
  p_expected_revision integer default null,
  p_allocations jsonb default null,
  p_txn_time time without time zone default null,
  p_void boolean default false
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid();
  old_t public.finance_transactions%rowtype;
  new_t public.finance_transactions%rowtype;
  had_old boolean := false;
  tx_id uuid;
  event_id uuid;
  replay_id uuid;
  replay_fingerprint jsonb;
  operation_signature jsonb;
  previous_rules jsonb := '[]'::jsonb;
  current_rules jsonb := '[]'::jsonb;
  el jsonb;
  allocations jsonb := p_allocations;
  allocation_sum numeric := 0;
  allocation_amount bigint;
  rule_category uuid;
  idx integer := 0;
  v_action text;
  owner_timezone text;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_operation_key is null then raise exception 'Operation key required'; end if;
  -- Fingerprint the complete caller request, not the resulting posting.
  -- Same key + a different amount/account/date/merchant cannot claim success.
  operation_signature := pg_catalog.jsonb_build_object(
    'kind',p_kind,'amount',p_amount_minor,'date',p_txn_date,
    'source',p_source_account_id,'destination',p_destination_account_id,
    'category',p_category_id,'merchant',p_merchant,'note',p_note,
    'transactionId',p_transaction_id,'revision',p_expected_revision,
    'allocations',p_allocations,'time',p_txn_time,'void',p_void);
  -- Finance must already be initialized; this lock serializes retries, edits,
  -- transfers, reconciliation, budgeting and archive operations for one owner.
  select timezone into owner_timezone from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;

  select transaction_id, request_fingerprint into replay_id, replay_fingerprint
    from public.finance_ledger_events
    where user_id=u and operation_key=p_operation_key;
  if found then
    -- Fail closed for pre-existing unverified keys; keep their journal history.
    if replay_fingerprint is null then
      raise exception 'Historical operation cannot be safely retried; refresh and verify saved history';
    end if;
    if replay_fingerprint is distinct from operation_signature then
      raise exception 'Operation key reused for a different transaction';
    end if;
    return replay_id;
  end if;

  if p_transaction_id is not null then
    select * into old_t from public.finance_transactions where user_id=u and id=p_transaction_id for update;
    if not found then raise exception 'Transaction not found'; end if;
    if old_t.voided_at is not null then raise exception 'Transaction already voided'; end if;
    if p_expected_revision is distinct from old_t.revision then
      raise exception 'Transaction revision conflict';
    end if;
    had_old := true;
    tx_id := old_t.id;
    if (old_t.source_account_id is not null and not exists (
      select 1 from public.finance_accounts
      where user_id=u and id=old_t.source_account_id and is_active
    )) or (old_t.destination_account_id is not null and not exists (
      select 1 from public.finance_accounts
      where user_id=u and id=old_t.destination_account_id and is_active
    )) then
      raise exception 'Reactivate the historical account before revising or voiding';
    end if;
    select coalesce(jsonb_agg(to_jsonb(r) order by r.sort_order),'[]'::jsonb) into previous_rules
      from public.finance_allocation_rules r where r.user_id=u and r.transaction_id=tx_id;
  else
    if p_void then raise exception 'Cannot void without transaction ID'; end if;
    if p_expected_revision is not null then raise exception 'Revision must be null for create'; end if;
    tx_id := gen_random_uuid();
  end if;

  -- Omitted rules mean preserve existing rules on edit; an explicit [] clears.
  if allocations is null then
    if had_old then
      select coalesce(jsonb_agg(jsonb_build_object(
        'itemName',r.item_name,'categoryId',r.category_id,
        'amountMinor',r.amount_minor::text,'startDate',r.start_date,
        'durationDays',r.duration_days
      ) order by r.sort_order),'[]'::jsonb)
      into allocations from public.finance_allocation_rules r
      where r.user_id=u and r.transaction_id=tx_id;
    else
      allocations := '[]'::jsonb;
    end if;
  end if;

  if p_void and had_old and old_t.kind='opening' then
    raise exception 'Opening balance cannot be voided; revise its amount instead';
  end if;

  if not p_void then
    if p_kind not in ('opening','income','expense','transfer','adjustment')
      or p_amount_minor is null or p_amount_minor not between -1000000000000 and 1000000000000
      or p_txn_date is null or p_txn_date > (now() at time zone owner_timezone)::date
      then raise exception 'Invalid transaction kind, amount or date'; end if;
    if length(coalesce(p_merchant,'')) > 200 or length(coalesce(p_note,'')) > 2000
      then raise exception 'Merchant or note too long'; end if;
    if not (
      (p_kind='opening' and p_amount_minor >= 0 and p_source_account_id is null and p_destination_account_id is not null and p_category_id is null)
      or (p_kind='income' and p_amount_minor > 0 and p_source_account_id is null and p_destination_account_id is not null and p_category_id is null)
      or (p_kind='expense' and p_amount_minor > 0 and p_source_account_id is not null and p_destination_account_id is null)
      or (p_kind='transfer' and p_amount_minor > 0 and p_source_account_id is not null and p_destination_account_id is not null and p_source_account_id <> p_destination_account_id and p_category_id is null)
      or (p_kind='adjustment' and p_amount_minor <> 0 and p_source_account_id is not null and p_destination_account_id is null and p_category_id is null and length(trim(coalesce(p_note,''))) >= 1)
    ) then raise exception 'Invalid transaction account structure'; end if;

    if had_old and (
      (old_t.kind='opening' and (p_kind<>'opening' or p_destination_account_id<>old_t.destination_account_id))
      or (old_t.kind<>'opening' and p_kind='opening')
    ) then raise exception 'Opening balance cannot change account or kind'; end if;

    if p_source_account_id is not null and not exists (
      select 1 from public.finance_accounts where user_id=u and id=p_source_account_id and is_active
    ) then raise exception 'Source account is not active or not owned'; end if;
    if p_destination_account_id is not null and not exists (
      select 1 from public.finance_accounts where user_id=u and id=p_destination_account_id and is_active
    ) then raise exception 'Destination account is not active or not owned'; end if;
    if p_category_id is not null and not exists (
      select 1 from public.finance_categories where user_id=u and id=p_category_id
    ) then raise exception 'Invalid category'; end if;

    if jsonb_typeof(allocations) is distinct from 'array'
      then raise exception 'Allocations must be an array'; end if;
    if jsonb_array_length(allocations) > 100 then raise exception 'Too many allocation items'; end if;
    if p_kind<>'expense' and jsonb_array_length(allocations)>0
      then raise exception 'Only expenses can have allocation rules'; end if;
    for el in select value from jsonb_array_elements(allocations) loop
      allocation_amount := (el->>'amountMinor')::bigint;
      if allocation_amount is null or allocation_amount < 1 or allocation_amount > 1000000000000
        then raise exception 'Invalid allocation amount'; end if;
      if (el->>'startDate')::date is null or
         (el->>'durationDays')::integer not between 1 and 3650 or
         length(coalesce(el->>'itemName',''))>200 then
         raise exception 'Invalid allocation date, duration or item'; end if;
      rule_category := nullif(el->>'categoryId','')::uuid;
      if rule_category is not null and not exists (
        select 1 from public.finance_categories where user_id=u and id=rule_category
      ) then raise exception 'Invalid allocation category'; end if;
      allocation_sum := allocation_sum + allocation_amount;
    end loop;
    if jsonb_array_length(allocations)>0 and allocation_sum <> p_amount_minor
      then raise exception 'Allocation total must equal expense amount'; end if;

    if had_old then
      update public.finance_transactions set
        kind=p_kind,amount_minor=p_amount_minor,txn_date=p_txn_date,
        txn_time=coalesce(p_txn_time,old_t.txn_time),
        source_account_id=p_source_account_id,destination_account_id=p_destination_account_id,
        category_id=p_category_id,merchant=coalesce(p_merchant,''),
        note=coalesce(p_note,''),revision=old_t.revision+1,updated_at=now()
      where id=tx_id and user_id=u;
      delete from public.finance_allocation_rules where user_id=u and transaction_id=tx_id;
    else
      insert into public.finance_transactions(
        id,user_id,kind,amount_minor,txn_date,txn_time,source_account_id,
        destination_account_id,category_id,merchant,note
      ) values(
        tx_id,u,p_kind,p_amount_minor,p_txn_date,
        coalesce(p_txn_time,(now() at time zone owner_timezone)::time),
        p_source_account_id,p_destination_account_id,p_category_id,
        coalesce(p_merchant,''),coalesce(p_note,'')
      );
    end if;
    idx := 0;
    for el in select value from jsonb_array_elements(allocations) loop
      insert into public.finance_allocation_rules(
        user_id,transaction_id,category_id,item_name,amount_minor,start_date,duration_days,sort_order
      ) values(
        u,tx_id,nullif(el->>'categoryId','')::uuid,coalesce(el->>'itemName',''),
        (el->>'amountMinor')::bigint,(el->>'startDate')::date,
        (el->>'durationDays')::integer,idx
      );
      idx := idx+1;
    end loop;
    v_action := case when had_old then 'replace' else 'create' end;
  else
    update public.finance_transactions
      set voided_at=now(),revision=old_t.revision+1,updated_at=now()
      where user_id=u and id=tx_id;
    delete from public.finance_allocation_rules where user_id=u and transaction_id=tx_id;
    v_action := 'void';
  end if;
  select * into new_t from public.finance_transactions where user_id=u and id=tx_id;
  select coalesce(jsonb_agg(to_jsonb(r) order by r.sort_order),'[]'::jsonb) into current_rules
    from public.finance_allocation_rules r where r.user_id=u and r.transaction_id=tx_id;

  event_id := gen_random_uuid();
  insert into public.finance_ledger_events(
    id,user_id,transaction_id,revision,action,operation_key,before_state,after_state,request_fingerprint
  ) values(
    event_id,u,tx_id,new_t.revision,v_action,p_operation_key,
    case when had_old then jsonb_build_object('transaction',to_jsonb(old_t),'allocations',previous_rules) else null end,
    jsonb_build_object('transaction',to_jsonb(new_t),'allocations',current_rules),
    operation_signature
  );

  -- Reverse the previously active state. Every change is append-only in postings.
  if had_old then
    if old_t.kind in ('opening','income') and old_t.amount_minor<>0 then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,old_t.destination_account_id,-old_t.amount_minor);
    elsif old_t.kind='expense' then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,old_t.source_account_id,old_t.amount_minor);
    elsif old_t.kind='transfer' then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,old_t.source_account_id,old_t.amount_minor),
              (u,event_id,old_t.destination_account_id,-old_t.amount_minor);
    elsif old_t.kind='adjustment' then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,old_t.source_account_id,-old_t.amount_minor);
    end if;
  end if;

  -- A void has no new impact. For ordinary edits apply the new state once.
  if not p_void then
    if new_t.kind in ('opening','income') and new_t.amount_minor<>0 then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,new_t.destination_account_id,new_t.amount_minor);
    elsif new_t.kind='expense' then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,new_t.source_account_id,-new_t.amount_minor);
    elsif new_t.kind='transfer' then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,new_t.source_account_id,-new_t.amount_minor),
              (u,event_id,new_t.destination_account_id,new_t.amount_minor);
    elsif new_t.kind='adjustment' then
      insert into public.finance_postings(user_id,ledger_event_id,account_id,delta_minor)
        values(u,event_id,new_t.source_account_id,new_t.amount_minor);
    end if;
  end if;
  return tx_id;
end $$;

-- A reconciliation with the same operation key only reports prior success
-- if it refers to the exact originally observed target and explanation.
create or replace function public.finance_reconcile_account(
  p_operation_key uuid,p_account_id uuid,p_target_balance_minor bigint,
  p_txn_date date,p_reason text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid();
  current_minor numeric;
  difference numeric;
  existing_tx uuid;
  replay_matches boolean;
  created_tx uuid;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_operation_key is null or p_target_balance_minor is null or
     abs(p_target_balance_minor::numeric)>1000000000000 or
     length(trim(coalesce(p_reason,'')))<1 then raise exception 'Invalid reconciliation'; end if;
  perform 1 from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  select transaction_id into existing_tx from public.finance_ledger_events
    where user_id=u and operation_key=p_operation_key;
  if found then
    select exists(
      select 1 from public.finance_audit_events h
      join public.finance_transactions t
        on t.id=existing_tx and t.user_id=u and t.kind='adjustment'
      where h.user_id=u and h.entity_type='account' and h.action='reconcile'
        and h.entity_id=p_account_id
        and h.after_state->>'transactionId'=existing_tx::text
        and h.after_state->>'balanceMinor'=p_target_balance_minor::text
        and h.after_state->>'reason'=p_reason
        and t.txn_date=p_txn_date
    ) into replay_matches;
    if not replay_matches then
      raise exception 'Reconciliation key reused with different target, account, date or reason';
    end if;
    return existing_tx;
  end if;
  if not exists(select 1 from public.finance_accounts
     where user_id=u and id=p_account_id and is_active) then
    raise exception 'Account not active or not owned'; end if;
  select coalesce(sum(delta_minor),0) into current_minor
    from public.finance_postings where user_id=u and account_id=p_account_id;
  difference := p_target_balance_minor::numeric-current_minor;
  if difference=0 then raise exception 'Balance already matches target'; end if;
  if abs(difference)>1000000000000 then raise exception 'Reconciliation adjustment exceeds limit'; end if;
  created_tx := public.finance_put_transaction(
    p_operation_key,'adjustment',difference::bigint,p_txn_date,
    p_account_id,null,null,'Balance reconciliation',p_reason
  );
  insert into public.finance_audit_events(
    user_id,entity_type,entity_id,action,before_state,after_state
  ) values(
    u,'account',p_account_id,'reconcile',
    jsonb_build_object('balanceMinor',current_minor::text),
    jsonb_build_object('balanceMinor',p_target_balance_minor::text,'reason',p_reason,'transactionId',created_tx)
  );
  return created_tx;
end $$;

revoke all on function public.finance_put_transaction(
 uuid,text,bigint,date,uuid,uuid,uuid,text,text,uuid,integer,jsonb,time without time zone,boolean
) from public,anon;
grant execute on function public.finance_put_transaction(
 uuid,text,bigint,date,uuid,uuid,uuid,text,text,uuid,integer,jsonb,time without time zone,boolean
) to authenticated;
revoke all on function public.finance_reconcile_account(uuid,uuid,bigint,date,text) from public,anon;
grant execute on function public.finance_reconcile_account(uuid,uuid,bigint,date,text) to authenticated;
commit;
