-- Run against disposable PostgreSQL after fixture + migrations 009–011.
-- psql -v ON_ERROR_STOP=1 -f tests/finance-postgres-assertions.sql
set role authenticated;
do $$
declare
  u1 uuid := '00000000-0000-4000-8000-000000000001'::uuid;
  u2 uuid := '00000000-0000-4000-8000-000000000002'::uuid;
  post_id uuid;
  ctbc_id uuid;
  cash_id uuid;
  expense_id uuid;
  event_key uuid := gen_random_uuid();
  rate_id uuid;
  rec_id uuid;
  bal numeric;
  budget_id uuid;
  rows_count integer;
begin
  perform set_config('request.jwt.claim.sub',u1::text,true);
  perform public.finance_bootstrap();
  perform public.finance_bootstrap();
  select count(*) into rows_count from public.finance_accounts where user_id=u1;
  if rows_count <> 3 then raise exception 'Default finance accounts not idempotent'; end if;
  select count(*) into rows_count from public.finance_categories where user_id=u1;
  if rows_count <> 8 then raise exception 'Default category count incorrect'; end if;
  select id into post_id from public.finance_accounts where user_id=u1 and code='post';
  select id into ctbc_id from public.finance_accounts where user_id=u1 and code='ctbc';
  select id into cash_id from public.finance_accounts where user_id=u1 and code='cash';
  if exists(select 1 from public.finance_transactions where user_id=u1) then
    raise exception 'Bootstrap fabricated transaction history'; end if;

  perform public.finance_put_transaction(gen_random_uuid(),'opening',100000,'2026-10-30',null,post_id);
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=post_id;
  if bal<>100000 then raise exception 'Opening balance incorrect'; end if;

  expense_id := public.finance_put_transaction(event_key,'expense',20000,'2026-10-30',post_id,null,
    null,'PX Mart','',null,null,
    '[{"amountMinor":"20000","startDate":"2026-10-30","durationDays":3}]'::jsonb);
  if expense_id <> public.finance_put_transaction(event_key,'expense',20000,'2026-10-30',post_id,null)
    then raise exception 'Idempotent retry returned different ID'; end if;
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=post_id;
  if bal<>80000 then raise exception 'Expense deducted incorrectly'; end if;

  select allocated_consumption_minor::numeric into bal
    from public.finance_monthly_summary('2026-10-01');
  if bal<>13334 then raise exception 'October grocery consumption wrongly allocated'; end if;
  select allocated_consumption_minor::numeric into bal
    from public.finance_monthly_summary('2026-11-01');
  if bal<>6666 then raise exception 'November grocery carryover wrongly allocated'; end if;
  select actual_expense_minor::numeric into bal
    from public.finance_monthly_summary('2026-11-01');
  if bal<>0 then raise exception 'Grocery carryover double-charged as November spending'; end if;

  perform public.finance_put_transaction(gen_random_uuid(),'income',600000,'2026-10-30',null,ctbc_id);
  perform public.finance_put_transaction(gen_random_uuid(),'transfer',50000,'2026-10-30',ctbc_id,post_id);
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=ctbc_id;
  if bal<>550000 then raise exception 'Transfer source incorrect'; end if;
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=post_id;
  if bal<>130000 then raise exception 'Transfer destination incorrect'; end if;
  perform public.finance_put_transaction(gen_random_uuid(),'transfer',30000,'2026-10-30',post_id,cash_id);
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=cash_id;
  if bal<>30000 then raise exception 'Transfer to cash incorrect'; end if;

  -- A note-only edit preserves the grocery schedule when allocations omitted.
  perform public.finance_put_transaction(gen_random_uuid(),'expense',20000,'2026-10-30',post_id,
    null,null,'PX Mart','Edit note',expense_id,1,null);
  select count(*) into rows_count from public.finance_allocation_rules
    where transaction_id=expense_id and user_id=u1;
  if rows_count<>1 then raise exception 'Omitted allocations unexpectedly removed'; end if;

  perform public.finance_put_transaction(gen_random_uuid(),'expense',10000,'2026-10-30',post_id,
    null,null,'PX Mart','Reduced charge',expense_id,2,
    '[{"amountMinor":"10000","startDate":"2026-10-30","durationDays":3}]'::jsonb);
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=post_id;
  if bal<>110000 then raise exception 'Edited expense amount incorrect'; end if;
  perform public.finance_put_transaction(gen_random_uuid(),'expense',10000,'2026-10-30',ctbc_id,
    null,null,'PX Mart','Changed payment bank',expense_id,3,null);
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=post_id;
  if bal<>120000 then raise exception 'Old payment account not restored'; end if;
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=ctbc_id;
  if bal<>540000 then raise exception 'New payment account not charged'; end if;
  perform public.finance_void_transaction(gen_random_uuid(),expense_id,4);
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=ctbc_id;
  if bal<>550000 then raise exception 'Expense void reversal incorrect'; end if;
  if exists(select 1 from public.finance_allocation_rules where transaction_id=expense_id)
    then raise exception 'Voided grocery allocations remain active'; end if;

  rec_id := public.finance_reconcile_account(gen_random_uuid(),post_id,77700,'2026-10-30',
    'Manual test statement correction');
  select balance_minor::numeric into bal from public.finance_account_balances where account_id=post_id;
  if bal<>77700 then raise exception 'Balance reconciliation incorrect'; end if;
  if not exists(select 1 from public.finance_audit_events
    where entity_type='account' and entity_id=post_id and action='reconcile')
    then raise exception 'Missing audit trail for reconciliation'; end if;

  rate_id:=public.finance_add_manual_fx_rate(0.50000000,'Test only, never live');
  budget_id:=public.finance_upsert_monthly_budget('2026-10-01','INR',600000,rate_id);
  select resolved_twd_minor::numeric into bal from public.finance_budget_details where id=budget_id;
  if bal<>300000 then raise exception 'INR budget snapshot rounding incorrect'; end if;
  perform public.finance_upsert_monthly_budget('2026-10-01','TWD',700000,null,1);
  select resolved_twd_minor::numeric into bal from public.finance_budget_details where id=budget_id;
  if bal<>700000 then raise exception 'TWD budget update incorrect'; end if;

  -- RLS cross-owner visibility, including the read views.
  perform set_config('request.jwt.claim.sub',u2::text,true);
  perform public.finance_bootstrap();
  if exists(select 1 from public.finance_accounts where id=post_id) then
    raise exception 'Cross-owner account disclosure'; end if;
  if exists(select 1 from public.finance_transaction_details where id=expense_id) then
    raise exception 'Cross-owner transaction disclosure'; end if;
  begin
    perform public.finance_put_transaction(gen_random_uuid(),'expense',10,'2026-10-30',post_id);
    raise exception 'Cross-owner write unexpectedly allowed';
  exception when others then
    if sqlerrm = 'Cross-owner write unexpectedly allowed' then raise; end if;
  end;
end $$;
reset role;
