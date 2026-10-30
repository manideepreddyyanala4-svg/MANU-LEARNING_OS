-- Phase 9: executable authenticated export, ledger and replay-key regressions.
-- Disposable CI database only. No production fixtures or mutations.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-00000000000d'::uuid),
 ('00000000-0000-4000-8000-00000000000e'::uuid);
set role authenticated;
do $$
declare
 u uuid:='00000000-0000-4000-8000-00000000000d';
 other_id uuid:='00000000-0000-4000-8000-00000000000e';
 postbank uuid;ctbc uuid;cash uuid;groceries uuid;
 expense_id uuid;grocery_id uuid;grocery2_id uuid; key1 uuid:=gen_random_uuid();
 expense_key uuid:=gen_random_uuid(); reconciliation_key uuid:=gen_random_uuid(); reconciliation_id uuid; snapshot jsonb; csv jsonb;
 diff numeric; total numeric; owners integer; ok boolean;
 report jsonb; day1 numeric;day2 numeric;day3 numeric;
begin
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform public.finance_bootstrap();
 select id into postbank from public.finance_accounts where user_id=u and code='post';
 select id into ctbc from public.finance_accounts where user_id=u and code='ctbc';
 select id into cash from public.finance_accounts where user_id=u and code='cash';
 select id into groceries from public.finance_categories where user_id=u and code='groceries';
 perform public.finance_initialize_openings(jsonb_build_array(
  jsonb_build_object('accountId',postbank,'amountMinor','300000','effectiveDate','2025-10-01','operationKey',gen_random_uuid()),
  jsonb_build_object('accountId',ctbc,'amountMinor','300000','effectiveDate','2025-10-01','operationKey',gen_random_uuid()),
  jsonb_build_object('accountId',cash,'amountMinor','50000','effectiveDate','2025-10-01','operationKey',gen_random_uuid())
 ));
 select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u;
 if total<>650000 then raise exception 'Opening total expected 650000, got %',total; end if;
 expense_id:=public.finance_put_transaction(
  p_operation_key=>expense_key,p_kind=>'expense',p_amount_minor=>40000,
  p_txn_date=>'2025-10-20',p_source_account_id=>ctbc,p_category_id=>groceries,
  p_merchant=>'=HYPERLINK("evil","link")'
 );
 if expense_id is distinct from public.finance_put_transaction(
  p_operation_key=>expense_key,p_kind=>'expense',p_amount_minor=>40000,
  p_txn_date=>'2025-10-20',p_source_account_id=>ctbc,p_category_id=>groceries,
  p_merchant=>'=HYPERLINK("evil","link")'
 ) then raise exception 'Same-key same-payload replay must return same id'; end if;
 begin
  perform public.finance_put_transaction(
    p_operation_key=>expense_key,p_kind=>'expense',p_amount_minor=>50000,
    p_txn_date=>'2025-10-20',p_source_account_id=>ctbc,p_category_id=>groceries,
    p_merchant=>'=HYPERLINK("evil","link")'
  );
  raise exception 'Mismatched retry was incorrectly accepted';
 exception when others then
  if sqlerrm='Mismatched retry was incorrectly accepted' then raise; end if;
  if sqlerrm not like '%Operation key reused%' then raise; end if;
 end;
 perform public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'transfer',p_amount_minor=>20000,
  p_txn_date=>'2025-10-20',p_source_account_id=>postbank,p_destination_account_id=>cash
 );
 perform public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'income',p_amount_minor=>600000,
  p_txn_date=>'2025-10-20',p_destination_account_id=>postbank,p_merchant=>'Salary'
 );
 if (select balance_minor from public.finance_account_balances where account_id=postbank)<>'880000'
 or (select balance_minor from public.finance_account_balances where account_id=ctbc)<>'260000'
 or (select balance_minor from public.finance_account_balances where account_id=cash)<>'70000'
 then raise exception 'Money flow example accounts incorrect'; end if;
 select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u;
 if total<>1210000 then raise exception 'Money flow total expected 1210000 got %',total; end if;

 grocery_id:=public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>40000,
  p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,p_category_id=>groceries,
  p_merchant=>'PX Mart',
  p_allocations=>'[{"amountMinor":"40000","startDate":"2025-10-30","durationDays":3}]'::jsonb
 );
 select coalesce(sum(amount_minor::numeric),0) into day1 from public.finance_day_cost_breakdown('2025-10-30')
  where transaction_id=grocery_id;
 select coalesce(sum(amount_minor::numeric),0) into day2 from public.finance_day_cost_breakdown('2025-10-31')
  where transaction_id=grocery_id;
 select coalesce(sum(amount_minor::numeric),0) into day3 from public.finance_day_cost_breakdown('2025-11-01')
  where transaction_id=grocery_id;
 if day1<>13334 or day2<>13333 or day3<>13333 or day1+day2+day3<>40000
 then raise exception 'Cross-month exact allocation rounding % % %',day1,day2,day3; end if;
 grocery2_id:=public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>45000,
  p_txn_date=>'2025-10-31',p_source_account_id=>ctbc,p_category_id=>groceries,
  p_merchant=>'PX-Mart',
  p_allocations=>'[{"amountMinor":"45000","startDate":"2025-10-31","durationDays":3}]'::jsonb
 );
 select coalesce(sum(amount_minor::numeric),0) into total from public.finance_day_cost_breakdown('2025-11-01')
  where transaction_id in (grocery_id,grocery2_id);
 if total<>28333 then raise exception 'Overlapping grocery daily attribution wrong: %',total; end if;
 snapshot:=public.finance_export_backup();
 if snapshot->>'ownerId'<>u::text or snapshot->>'version'<>'2'
 or (snapshot->'integrity'->'recordCounts'->>'accounts')::int<>3
 or (snapshot->'integrity'->'recordCounts'->>'transactions')::int<>8
 then raise exception 'Backup missing records or metadata %',snapshot->'integrity'; end if;
 select count(*) into owners from jsonb_array_elements(snapshot->'data'->'transactions') x
 where x->>'user_id'<>u::text;
 if owners<>0 then raise exception 'Snapshot leaked another owner'; end if;
 csv:=public.finance_export_transaction_rows('2025-10-20','2025-10-20');
 if jsonb_array_length(csv)<>3 or (csv->0->>'date')<>'2025-10-20'
 then raise exception 'CSV date range wrong: %',csv; end if;
 if (select count(*) from jsonb_array_elements(csv) x
     where x->>'merchant' like '=%')<>1 then
    raise exception 'CSV must preserve unsafe raw strings for safe client-side escaping'; end if;
 -- Revision conflict is not a new payment.
 begin
  perform public.finance_void_transaction(gen_random_uuid(),grocery_id,999);
  raise exception 'Stale revision was incorrectly accepted';
 exception when others then
  if sqlerrm='Stale revision was incorrectly accepted' then raise; end if;
  if sqlerrm not like '%revision conflict%' then raise; end if;
 end;
 perform public.finance_void_transaction(gen_random_uuid(),grocery_id,1);
 select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u;
 if total<>1210000-45000 then raise exception 'Voided expense not reversed exactly once: %',total; end if;
 if exists(select 1 from public.finance_allocation_rules where transaction_id=grocery_id)
 then raise exception 'Voided grocery retained active allocations'; end if;
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'85000' then raise exception 'Analytics after void incorrect %',report->>'expenseMinor'; end if;
 -- Account and journal correctness: active transaction algebra vs all event postings.
 select coalesce(sum(p.delta_minor),0) into total
 from public.finance_postings p where p.user_id=u;
 select coalesce(sum(case
   when kind in ('opening','income') and voided_at is null then amount_minor
   when kind='expense' and voided_at is null then -amount_minor
   when kind='adjustment' and voided_at is null then amount_minor
   else 0 end),0) into diff from public.finance_transactions where user_id=u;
 if total<>diff then raise exception 'Journal totals do not reconcile: % <> %',total,diff; end if;
 -- Reconciliation is signed delta history. Same-key retry must match the
 -- originally checked target and its account, date and exact reason.
 reconciliation_id:=public.finance_reconcile_account(
   reconciliation_key,ctbc,215100,'2025-10-31','Manually verified statement');
 if reconciliation_id<>public.finance_reconcile_account(
   reconciliation_key,ctbc,215100,'2025-10-31','Manually verified statement')
 then raise exception 'Same reconciliation key did not replay consistently'; end if;
 begin
   perform public.finance_reconcile_account(
     reconciliation_key,ctbc,216100,'2025-10-31','Manually verified statement');
   raise exception 'Changed reconciliation target was accepted';
 exception when others then
   if sqlerrm='Changed reconciliation target was accepted' then raise; end if;
   if sqlerrm not like '%Reconciliation key reused%' then raise; end if;
 end;
 begin
   perform public.finance_put_transaction(
     p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>1000,
     p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,
     p_category_id=>groceries,p_merchant=>'Late historical expense'
   );
   raise exception 'Backdated payment before reconciliation was accepted';
 exception when others then
   if sqlerrm='Backdated payment before reconciliation was accepted' then raise; end if;
   if sqlerrm not like '%predates a checked balance%' then raise; end if;
 end;
 -- Cross-user query and RPC: self must not see source user records.
 perform set_config('request.jwt.claim.sub',other_id::text,true);
 perform public.finance_bootstrap();
 snapshot:=public.finance_export_backup();
 if (snapshot->'integrity'->'recordCounts'->>'transactions')::int<>0
 then raise exception 'Cross-owner backup exposed private transactions'; end if;
 if (select count(*) from public.finance_transaction_details)>0
 then raise exception 'RLS allowed cross-owner transactions'; end if;
 if jsonb_array_length(public.finance_export_transaction_rows(null,null))<>0
 then raise exception 'CSV leaked another owner'; end if;
 raise notice 'Phase 9 PASS: balances, replay, cross-month allocations, snapshot, CSV, voids, analytics, RLS';
end $$;
reset role;
