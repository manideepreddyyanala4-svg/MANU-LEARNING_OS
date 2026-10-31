-- Phase 7: real PostgreSQL 16 isolated integration. Fake user IDs only.
-- Use historical November 2025: Phase 2 correctly rejects future-dated real payments.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000009'::uuid),
 ('00000000-0000-4000-8000-00000000000a'::uuid);
set role authenticated;
do $$
declare
 owner uuid:='00000000-0000-4000-8000-000000000009';
 outsider uuid:='00000000-0000-4000-8000-00000000000a';
 ctbc uuid;postbank uuid;cash uuid;grocery uuid;food uuid;
 purchase uuid;vegetables uuid;coffee uuid;
 paid numeric;consumed numeric;groceries numeric;
 compare_paid numeric;compare_consumed numeric; v numeric;
 entries integer;plan uuid;
begin
 perform set_config('request.jwt.claim.sub',owner::text,true);
 perform public.finance_bootstrap();
 select id into ctbc from public.finance_accounts where user_id=owner and code='ctbc';
 select id into postbank from public.finance_accounts where user_id=owner and code='post';
 select id into cash from public.finance_accounts where user_id=owner and code='cash';
 select id into grocery from public.finance_categories where user_id=owner and code='groceries';
 select id into food from public.finance_categories where user_id=owner and code='outside-food';
 perform public.finance_initialize_openings(jsonb_build_array(
   jsonb_build_object('accountId',ctbc,'amountMinor','300000','effectiveDate','2025-10-29','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',postbank,'amountMinor','300000','effectiveDate','2025-10-29','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',cash,'amountMinor','50000','effectiveDate','2025-10-29','operationKey',gen_random_uuid())
 ));
 perform public.finance_upsert_monthly_budget('2025-11-01','TWD',750000);
 -- One payment Oct 30, assigned across October and November.
 purchase:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>45000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,p_category_id=>grocery,
   p_merchant=>'PX Mart',
   p_allocations=>'[{"amountMinor":"45000","startDate":"2025-10-30","durationDays":3}]'::jsonb
 );
 coffee:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>4000,
   p_txn_date=>'2025-11-01',p_source_account_id=>cash,p_category_id=>food,
   p_merchant=>'FamilyMart coffee'
 );
 select filtered_cash_minor::numeric,filtered_consumption_minor::numeric,
   allocated_grocery_minor::numeric into paid,consumed,groceries
 from public.finance_calendar_days('2025-11-01')
 where day_date='2025-11-01';
 if paid<>4000 or consumed<>19000 or groceries<>15000 then
   raise exception 'Month calendar did not attribute Oct payment to November consumption'; end if;
 -- NT$7500/30 = NT$250; NT$150 groceries+NT$40 coffee => NT$60 left.
 if 750000/30-consumed<>6000 then raise exception 'Standard daily allowance mismatch'; end if;
 select count(*) into entries from public.finance_calendar_days('2025-11-01');
 if entries<>30 then raise exception 'November is not 30 days'; end if;
 select count(*) into entries from public.finance_calendar_days('2028-02-01');
 if entries<>29 then raise exception 'Leap February does not have 29 days'; end if;
 select sum(d.filtered_cash_minor::numeric),sum(d.filtered_consumption_minor::numeric)
 into paid,consumed from public.finance_calendar_days('2025-11-01') d;
 select sum(d.actual_expense_minor::numeric),sum(d.allocated_cost_minor::numeric)
 into compare_paid,compare_consumed from public.finance_daily_budget('2025-11-01') d;
 if paid<>compare_paid or consumed<>compare_consumed then
   raise exception 'Calendar totals differ from Phase 5/6 ledger'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc;
 if v<>255000 then raise exception 'Calendar made a second bank charge'; end if;

 select filtered_cash_minor::numeric,filtered_consumption_minor::numeric
 into paid,consumed from public.finance_calendar_days('2025-11-01',ctbc)
 where day_date='2025-11-01';
 if paid<>0 or consumed<>15000 then raise exception 'Account filter used allocation date as payment date'; end if;
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01',null,grocery)
 where day_date='2025-11-01';
 if consumed<>15000 then raise exception 'Category filter failed on cross-month allocation'; end if;
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01',null,null,'other')
 where day_date='2025-11-01';
 if consumed<>4000 then raise exception 'Non-grocery category filter failed'; end if;
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01',null,null,'groceries')
 where day_date='2025-11-01';
 if consumed<>15000 then raise exception 'Groceries filter failed'; end if;

 select count(*),coalesce(sum(amount_minor::numeric),0)
 into entries,consumed from public.finance_calendar_day_details('2025-11-01','consumption');
 if entries<>2 or consumed<>19000 then raise exception 'Selected day details double-count'; end if;
 select count(*),coalesce(sum(amount_minor::numeric),0)
 into entries,paid from public.finance_calendar_day_details('2025-11-01','cash');
 if entries<>1 or paid<>4000 then raise exception 'Cash view mixes allocated consumption'; end if;
 select count(*) into entries
 from public.finance_calendar_day_details('2025-11-01','consumption',ctbc);
 if entries<>1 then raise exception 'Account-scoped selected-day detail mismatch'; end if;
 select count(*) into entries
 from public.finance_calendar_day_details('2025-11-01','consumption',null,null,'all',1,0);
 if entries<>1 then raise exception 'Detail paging failed'; end if;
 select count(*) into entries
 from public.finance_calendar_day_details('2025-11-01','consumption',null,null,'all',1,1);
 if entries<>1 then raise exception 'Second detail page missing'; end if;

 -- Overlap contributes its own daily fraction; it never overwrites the first purchase.
 vegetables:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>12000,
   p_txn_date=>'2025-10-31',p_source_account_id=>ctbc,p_category_id=>grocery,
   p_merchant=>'Vegetables',
   p_allocations=>'[{"amountMinor":"12000","startDate":"2025-10-31","durationDays":4}]'::jsonb
 );
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01') where day_date='2025-11-01';
 if consumed<>22000 then raise exception 'Overlap did not aggregate'; end if;
 -- Edit replaces allocation and reverses exactly the original bank postings.
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>50000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,p_category_id=>grocery,
   p_merchant=>'PX Mart corrected',p_transaction_id=>purchase,p_expected_revision=>1,
   p_allocations=>'[{"amountMinor":"50000","startDate":"2025-10-30","durationDays":5}]'::jsonb
 );
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01') where day_date='2025-11-01';
 if consumed<>17000 then raise exception 'Edited allocation was not refreshed in calendar'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc;
 if v<>238000 then raise exception 'Edited purchase posted more than one bank correction'; end if;
 perform public.finance_void_transaction(gen_random_uuid(),purchase,2);
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01') where day_date='2025-11-01';
 if consumed<>7000 then raise exception 'Voided grocery remains in calendar'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc;
 if v<>288000 then raise exception 'Voided expense did not restore account'; end if;

 -- Future planned payment must not appear as an already paid grocery allocation.
 plan:=public.finance_upsert_allocated_plan(
   p_operation_key=>gen_random_uuid(),p_amount_minor=>9000,p_due_date=>'2099-01-01',
   p_account_id=>ctbc,p_category_id=>grocery,p_merchant=>'Unpaid future basket',
   p_allocations=>'[{"amountMinor":"9000","startDate":"2025-11-02","durationDays":3}]'::jsonb
 );
 select filtered_consumption_minor::numeric into consumed
 from public.finance_calendar_days('2025-11-01') where day_date='2025-11-02';
 if consumed<>3000 then raise exception 'Unpaid scheduled basket was counted as consumed'; end if;

 perform set_config('request.jwt.claim.sub',outsider::text,true);
 perform public.finance_bootstrap();
 select coalesce(sum(filtered_consumption_minor::numeric),0) into consumed
 from public.finance_calendar_days('2025-11-01');
 if consumed<>0 then raise exception 'Other owner calendar is visible'; end if;
 select count(*) into entries from public.finance_calendar_day_details('2025-11-01');
 if entries<>0 then raise exception 'Other owner timeline is visible'; end if;
 begin
   perform 1 from public.finance_calendar_days('2025-11-01',ctbc);
   raise exception 'Foreign owner account filter was accepted';
 exception when others then
   if sqlerrm='Foreign owner account filter was accepted' then raise; end if;
 end;
end $$;
reset role;
