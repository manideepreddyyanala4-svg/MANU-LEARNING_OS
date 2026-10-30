-- Phase 8: real PostgreSQL fixture, historical data only, two isolated owners.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-00000000000b'::uuid),
 ('00000000-0000-4000-8000-00000000000c'::uuid);
set role authenticated;
do $$
declare
 owner uuid:='00000000-0000-4000-8000-00000000000b';
 outsider uuid:='00000000-0000-4000-8000-00000000000c';
 ctbc uuid;postbank uuid;cash uuid;groceries uuid;food uuid;transport uuid;other_cat uuid;
 grocery1 uuid;grocery2 uuid;coffee uuid;
 report jsonb; category_total numeric;vendor_total numeric; v numeric; n integer;
 rate uuid; firstmonth record; lastmonth record;
begin
 perform set_config('request.jwt.claim.sub',owner::text,true);
 perform public.finance_bootstrap();
 select id into ctbc from public.finance_accounts where user_id=owner and code='ctbc';
 select id into postbank from public.finance_accounts where user_id=owner and code='post';
 select id into cash from public.finance_accounts where user_id=owner and code='cash';
 select id into groceries from public.finance_categories where user_id=owner and code='groceries';
 select id into food from public.finance_categories where user_id=owner and code='outside-food';
 select id into transport from public.finance_categories where user_id=owner and code='transportation';
 select id into other_cat from public.finance_categories where user_id=owner and code='other';
 perform public.finance_initialize_openings(jsonb_build_array(
   jsonb_build_object('accountId',ctbc,'amountMinor','500000','effectiveDate','2025-09-29','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',postbank,'amountMinor','500000','effectiveDate','2025-09-29','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',cash,'amountMinor','200000','effectiveDate','2025-09-29','operationKey',gen_random_uuid())
 ));
 perform public.finance_upsert_monthly_budget('2025-10-01','TWD',600000);
 rate:=public.finance_add_manual_fx_rate(4.25000000,'fixture historical manual rate');
 perform public.finance_upsert_monthly_budget('2025-11-01','INR',100000,rate);
 -- October: two PX Mart grocery purchases total 2000 TWD, 500 outside food,
 -- 300 transport, 200 other = 3000 TWD real spending.
 grocery1:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>125000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,
   p_category_id=>groceries,p_merchant=>'PXMart',
   p_allocations=>'[{"amountMinor":"125000","startDate":"2025-10-30","durationDays":3}]'::jsonb
 );
 grocery2:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>75000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,
   p_category_id=>groceries,p_merchant=>'PX-Mart'
 );
 coffee:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>50000,
   p_txn_date=>'2025-10-30',p_source_account_id=>cash,
   p_category_id=>food,p_merchant=>'FamilyMart'
 );
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>30000,
   p_txn_date=>'2025-10-30',p_source_account_id=>postbank,
   p_category_id=>transport,p_merchant=>'Bus'
 );
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>20000,
   p_txn_date=>'2025-10-30',p_source_account_id=>cash,
   p_category_id=>other_cat,p_merchant=>'Local shop'
 );
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'income',p_amount_minor=>100000,
   p_txn_date=>'2025-10-30',p_destination_account_id=>ctbc,
   p_merchant=>'RA income'
 );
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'transfer',p_amount_minor=>25000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,
   p_destination_account_id=>cash,p_merchant=>'CTBC cash withdrawal'
 );
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'300000' or report->>'incomeMinor'<>'100000'
   or report->>'largestMinor'<>'125000' or (report->>'expenseCount')::int<>5
 then raise exception 'Analytics totals/include transfers incorrectly %',report; end if;
 select sum((c->>'amountMinor')::numeric) into v
 from jsonb_array_elements(report->'categories') c;
 if v<>300000 then raise exception 'Categories do not reconcile'; end if;
 select sum((c->>'amountMinor')::numeric) into v
 from jsonb_array_elements(report->'merchants') c;
 if v<>300000 then raise exception 'Merchants do not reconcile'; end if;
 select sum((c->>'amountMinor')::numeric) into v
 from jsonb_array_elements(report->'accounts') c;
 if v<>300000 then raise exception 'Accounts do not reconcile'; end if;
 select (c->>'amountMinor')::numeric into category_total
 from jsonb_array_elements(report->'categories') c where c->>'code'='groceries';
 if category_total<>200000 then raise exception 'Groceries should be 66.67 percent'; end if;
 select (c->>'amountMinor')::numeric into vendor_total
 from jsonb_array_elements(report->'merchants') c where c->>'name'='PX Mart';
 if vendor_total<>200000 then raise exception 'PX Mart aliases did not group safely'; end if;
 if public.finance_analytics_merchant('Unrelated PXMart Shop')<>'Unrelated PXMart Shop'
 then raise exception 'Unrelated merchant falsely normalized'; end if;
 if public.finance_analytics_merchant('') is not null
 then raise exception 'Missing merchant fabricated'; end if;
 if public.finance_analytics_merchant('PX Mart')<>'PX Mart'
 then raise exception 'Explicit alias incorrect'; end if;

 report:=public.finance_analytics_overview('2025-10-01','2025-10-31',ctbc);
 if report->>'expenseMinor'<>'200000' or report->>'incomeMinor'<>'100000'
 then raise exception 'Account filter must handle payment vs income account'; end if;
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31',null,groceries);
 if report->>'expenseMinor'<>'200000' or report->>'incomeMinor' is not null
 then raise exception 'Category filtered income must be null, not 0'; end if;
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31',null,null,'PX Mart');
 if report->>'expenseMinor'<>'200000' or (report->>'expenseCount')::int<>2
 then raise exception 'Merchant filter failed'; end if;
 select count(*) into n from public.finance_analytics_expenses('2025-10-01','2025-10-31',null,null,'PX Mart');
 if n<>2 then raise exception 'Merchant history incomplete'; end if;
 select count(*) into n from public.finance_analytics_expenses('2025-10-01','2025-10-31',null,null,'PX Mart',1,1);
 if n<>1 then raise exception 'Pagination failed'; end if;
 select count(*) into n from public.finance_analytics_expenses('2025-10-01','2025-10-31',null,groceries);
 if n<>2 then raise exception 'Category drilldown failed'; end if;

 select * into firstmonth from public.finance_analytics_months('2025-09-01',3)
 where month_start='2025-09-01';
 if firstmonth.coverage<>'partial-start' then raise exception 'First tracking month was not flagged partial'; end if;
 select * into lastmonth from public.finance_analytics_months('2025-09-01',3)
 where month_start='2025-11-01';
 if lastmonth.budget_minor<>'425000' or lastmonth.budget_currency<>'INR'
   or lastmonth.original_budget_minor<>'100000' then
   raise exception 'Saved INR budget FX snapshot was not retained'; end if;
 select count(*) into n from public.finance_analytics_months('2025-01-01',6)
 where coverage='unknown';
 if n<>6 then raise exception 'Pre-tracking period was reported as known zero'; end if;

 select actual_minor::numeric,consumption_minor::numeric into v,category_total
 from public.finance_analytics_daily('2025-10-01') where day_date='2025-10-30';
 if v<>300000 then raise exception 'Cash day should contain full 3000 TWD'; end if;
 -- Oct 30 attributed 1250/3 (416.67) + regular payments 1750 = 2166.67
 if category_total<>216667 then raise exception 'Daily allocation incorrectly added full purchase'; end if;
 select actual_minor::numeric,consumption_minor::numeric into v,category_total
 from public.finance_analytics_daily('2025-11-01') where day_date='2025-11-01';
 if v<>0 or category_total<>41666 then
   raise exception 'Cross-month grocery share must not be new November bank payment'; end if;
 select actual_minor::numeric into v from public.finance_analytics_daily(
   '2025-10-01',null,null,'PX Mart') where day_date='2025-10-30';
 if v<>200000 then raise exception 'Daily merchant filtering failed'; end if;
 select sum(actual_minor::numeric) into v from public.finance_analytics_daily('2025-10-01');
 if v<>300000 then raise exception 'Month daily cashflow mismatch'; end if;

 -- Voided expenses and refunds follow current finance policy.
 perform public.finance_void_transaction(gen_random_uuid(),coffee,1);
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'250000' then raise exception 'Voided payment included'; end if;
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'income',p_amount_minor=>5000,
   p_txn_date=>'2025-10-31',p_destination_account_id=>cash,p_merchant=>'Refund'
 );
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'incomeMinor'<>'105000' or report->>'expenseMinor'<>'250000'
 then raise exception 'Refund was incorrectly netted into gross expense'; end if;
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>130000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,
   p_category_id=>groceries,p_merchant=>'PX Mart',
   p_transaction_id=>grocery1,p_expected_revision=>1,
   p_allocations=>'[{"amountMinor":"130000","startDate":"2025-10-30","durationDays":3}]'::jsonb
 );
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'255000' then raise exception 'Edited purchase not refreshed'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc;
 if v<>370000 then raise exception 'Analytics mutated bank ledger or edit incorrect'; end if;

 perform set_config('request.jwt.claim.sub',outsider::text,true);
 perform public.finance_bootstrap();
 report:=public.finance_analytics_overview('2025-10-01','2025-10-31');
 if report->>'expenseMinor'<>'0' or report->>'incomeMinor'<>'0'
 then raise exception 'Other user saw private totals'; end if;
 select count(*) into n from public.finance_analytics_expenses('2025-10-01','2025-10-31');
 if n<>0 then raise exception 'Other user saw expense history'; end if;
 begin
   perform public.finance_analytics_overview('2025-10-01','2025-10-31',ctbc);
   raise exception 'Foreign account filter accepted';
 exception when others then if sqlerrm='Foreign account filter accepted' then raise; end if;
 end;
end $$;
reset role;
