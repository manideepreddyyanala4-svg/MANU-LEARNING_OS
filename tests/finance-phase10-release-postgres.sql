-- Phase 10 exact release accounting scenario.
-- Isolated PostgreSQL 16 only; never run on production or real identities.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-00000000000f'::uuid),
 ('00000000-0000-4000-8000-000000000010'::uuid);
set role authenticated;
do $$
declare
 u uuid:='00000000-0000-4000-8000-00000000000f';
 intruder uuid:='00000000-0000-4000-8000-000000000010';
 post_id uuid;ctbc_id uuid;cash_id uuid;groceries uuid;food uuid;
 expense_id uuid;grocery_id uuid;overlap_id uuid;five_id uuid;
 value_minor numeric;bank_total numeric;actual numeric;consumed numeric;
 report jsonb; idempotency uuid:=gen_random_uuid();
begin
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform public.finance_bootstrap();
 select id into post_id from public.finance_accounts where user_id=u and code='post';
 select id into ctbc_id from public.finance_accounts where user_id=u and code='ctbc';
 select id into cash_id from public.finance_accounts where user_id=u and code='cash';
 select id into groceries from public.finance_categories where user_id=u and code='groceries';
 select id into food from public.finance_categories where user_id=u and code='outside-food';
 perform public.finance_initialize_openings(jsonb_build_array(
   jsonb_build_object('accountId',post_id,'amountMinor','300000','effectiveDate','2025-10-01','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',ctbc_id,'amountMinor','300000','effectiveDate','2025-10-01','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',cash_id,'amountMinor','50000','effectiveDate','2025-10-01','operationKey',gen_random_uuid())
 ));
 select sum(balance_minor::numeric) into bank_total from public.finance_account_balances where user_id=u;
 if bank_total<>650000 then raise exception 'Opening total must be NT$6500';end if;

 expense_id:=public.finance_put_transaction(
   p_operation_key=>idempotency,p_kind=>'expense',p_amount_minor=>40000,
   p_txn_date=>'2025-10-28',p_source_account_id=>ctbc_id,
   p_category_id=>food,p_merchant=>'Example expense');
 if public.finance_put_transaction(
   p_operation_key=>idempotency,p_kind=>'expense',p_amount_minor=>40000,
   p_txn_date=>'2025-10-28',p_source_account_id=>ctbc_id,
   p_category_id=>food,p_merchant=>'Retry')<>expense_id
 then raise exception 'Idempotent expense retry did not return original';end if;
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=ctbc_id;
 if value_minor<>260000 then raise exception 'Step 1 CTBC should be NT$2600';end if;
 select sum(balance_minor::numeric) into bank_total from public.finance_account_balances where user_id=u;
 if bank_total<>610000 then raise exception 'Step 1 total should be NT$6100';end if;

 perform public.finance_put_transaction(gen_random_uuid(),'transfer',20000,
   '2025-10-28',post_id,cash_id);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=post_id;
 if value_minor<>280000 then raise exception 'Step 2 post should be NT$2800';end if;
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=cash_id;
 if value_minor<>70000 then raise exception 'Step 2 cash should be NT$700';end if;
 select sum(balance_minor::numeric) into bank_total from public.finance_account_balances where user_id=u;
 if bank_total<>610000 then raise exception 'Step 2 transfer incorrectly changed total';end if;

 perform public.finance_put_transaction(gen_random_uuid(),'income',600000,
   '2025-10-28',null,post_id);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=post_id;
 if value_minor<>880000 then raise exception 'Step 3 post should be NT$8800';end if;
 select sum(balance_minor::numeric) into bank_total from public.finance_account_balances where user_id=u;
 if bank_total<>1210000 then raise exception 'Step 3 total should be NT$12100';end if;

 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>35000,
   p_txn_date=>'2025-10-28',p_source_account_id=>ctbc_id,
   p_category_id=>food,p_merchant=>'Corrected example expense',
   p_transaction_id=>expense_id,p_expected_revision=>1);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=ctbc_id;
 if value_minor<>265000 then raise exception 'Step 4 CTBC must be NT$2650';end if;
 select sum(balance_minor::numeric) into bank_total from public.finance_account_balances where user_id=u;
 if bank_total<>1215000 then raise exception 'Step 4 total must be NT$12150';end if;
 begin
   perform public.finance_put_transaction(
     p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>30000,
     p_txn_date=>'2025-10-28',p_source_account_id=>ctbc_id,
     p_category_id=>food,p_transaction_id=>expense_id,p_expected_revision=>1);
   raise exception 'Stale expense edit unexpectedly succeeded';
 exception when others then
   if sqlerrm='Stale expense edit unexpectedly succeeded' then raise;end if;
 end;

 perform public.finance_void_transaction(gen_random_uuid(),expense_id,2);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=ctbc_id;
 if value_minor<>300000 then raise exception 'Step 5 CTBC must return to NT$3000';end if;
 select sum(balance_minor::numeric) into bank_total from public.finance_account_balances where user_id=u;
 if bank_total<>1250000 then raise exception 'Step 5 total should be NT$12500';end if;
 select actual_expense_minor::numeric into actual from public.finance_monthly_summary('2025-10-01');
 if actual<>0 then raise exception 'Voided expense remains in active monthly spending';end if;
 begin
   perform public.finance_void_transaction(gen_random_uuid(),expense_id,3);
   raise exception 'Second void double-credited bank';
 exception when others then
   if sqlerrm='Second void double-credited bank' then raise;end if;
 end;

 grocery_id:=public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>45000,
  p_txn_date=>'2025-10-30',p_source_account_id=>ctbc_id,
  p_category_id=>groceries,p_merchant=>'PX Mart',
  p_allocations=>'[{"amountMinor":"45000","startDate":"2025-10-30","durationDays":3}]'::jsonb);
 overlap_id:=public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>40000,
  p_txn_date=>'2025-10-30',p_source_account_id=>ctbc_id,
  p_category_id=>groceries,p_merchant=>'Other groceries',
  p_allocations=>'[{"amountMinor":"40000","startDate":"2025-10-30","durationDays":3}]'::jsonb);
 five_id:=public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>50000,
  p_txn_date=>'2025-10-30',p_source_account_id=>ctbc_id,
  p_category_id=>groceries,p_merchant=>'Five-day groceries',
  p_allocations=>'[{"amountMinor":"50000","startDate":"2025-10-30","durationDays":5}]'::jsonb);

 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=ctbc_id;
 if value_minor<>165000 then raise exception 'Three grocery purchases must deduct NT$1350 once';end if;
 select actual_expense_minor::numeric,allocated_consumption_minor::numeric into actual,consumed
 from public.finance_monthly_summary('2025-10-01');
 if actual<>135000 or consumed<>76667 then
  raise exception 'October paid vs consumed disagreement actual=% consumed=%',actual,consumed;end if;
 select actual_expense_minor::numeric,allocated_consumption_minor::numeric into actual,consumed
 from public.finance_monthly_summary('2025-11-01');
 if actual<>0 or consumed<>58333 then
  raise exception 'November actual debit or consumption incorrect actual=% consumed=%',actual,consumed;end if;
 select actual_expense_minor::numeric,allocated_cost_minor::numeric into actual,consumed
 from public.finance_daily_budget('2025-10-01') where day_date='2025-10-30';
 if actual<>135000 or consumed<>38334 then
  raise exception 'Day 1 actual or attributed mismatch';end if;
 select actual_expense_minor::numeric,allocated_cost_minor::numeric into actual,consumed
 from public.finance_daily_budget('2025-11-01') where day_date='2025-11-01';
 if actual<>0 or consumed<>38333 then raise exception 'Cross-month allocation charged account';end if;
 select sum(amount_minor::numeric) into value_minor from public.finance_day_cost_breakdown('2025-11-03');
 if value_minor<>10000 then raise exception 'Fifth day allocation missing';end if;

 perform public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>60000,
  p_txn_date=>'2025-10-30',p_source_account_id=>ctbc_id,
  p_category_id=>groceries,p_merchant=>'PX Mart corrected',
  p_transaction_id=>grocery_id,p_expected_revision=>1,
  p_allocations=>'[{"amountMinor":"60000","startDate":"2025-10-30","durationDays":3}]'::jsonb);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=ctbc_id;
 if value_minor<>150000 then raise exception 'Grocery edit should debit only the NT$150 difference';end if;
 perform public.finance_put_transaction(
  p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>60000,
  p_txn_date=>'2025-10-30',p_source_account_id=>post_id,
  p_category_id=>groceries,p_merchant=>'PX Mart corrected',
  p_transaction_id=>grocery_id,p_expected_revision=>2,
  p_allocations=>'[{"amountMinor":"60000","startDate":"2025-10-30","durationDays":3}]'::jsonb);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=ctbc_id;
 if value_minor<>210000 then raise exception 'Changing grocery payment account did not restore CTBC';end if;
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=post_id;
 if value_minor<>820000 then raise exception 'Changed grocery payment did not charge Post';end if;
 perform public.finance_void_transaction(gen_random_uuid(),grocery_id,3);
 select balance_minor::numeric into value_minor from public.finance_account_balances where account_id=post_id;
 if value_minor<>880000 then raise exception 'Grocery void failed to restore Post once';end if;
 select actual_expense_minor::numeric into actual from public.finance_monthly_summary('2025-10-01');
 if actual<>90000 then raise exception 'Voided grocery still included in month cashflow';end if;
 select allocated_cost_minor::numeric into consumed from public.finance_daily_budget('2025-11-01')
 where day_date='2025-11-01';
 if consumed<>23333 then raise exception 'Grocery void retained daily consumption';end if;

 report:=public.finance_integrity_report();
 if not (report->>'healthy')::boolean then raise exception 'Final ledger integrity report failed %',report;end if;
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'90000' or (report->>'expenseCount')::int<>2
 then raise exception 'Analytics does not reconcile with two active grocery payments';end if;

 perform set_config('request.jwt.claim.sub',intruder::text,true);
 perform public.finance_bootstrap();
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'0' then raise exception 'Cross-user spending leaked';end if;
 if jsonb_array_length(public.finance_full_backup()->'transactions')<>0
 then raise exception 'Cross-user archive leaked';end if;
end $$;
reset role;
