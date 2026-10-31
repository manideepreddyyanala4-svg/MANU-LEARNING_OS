-- Isolated disposable PG only, fake owners and cents. Do not run on production.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000007'::uuid),
 ('00000000-0000-4000-8000-000000000008'::uuid);
set role authenticated;
do $$
declare
 owner uuid:='00000000-0000-4000-8000-000000000007';
 other_owner uuid:='00000000-0000-4000-8000-000000000008';
 post_account uuid;ctbc_account uuid;cash_account uuid;groceries uuid;food uuid;
 purchase uuid; drink uuid; basket uuid; plan uuid; due_plan uuid; actual_id uuid;
 event_key uuid:=gen_random_uuid();
 plan_key uuid:=gen_random_uuid();
 v numeric; v2 numeric; n integer;
begin
 perform set_config('request.jwt.claim.sub',owner::text,true);
 perform public.finance_bootstrap();
 select id into post_account from public.finance_accounts where user_id=owner and code='post';
 select id into ctbc_account from public.finance_accounts where user_id=owner and code='ctbc';
 select id into cash_account from public.finance_accounts where user_id=owner and code='cash';
 select id into groceries from public.finance_categories where user_id=owner and code='groceries';
 select id into food from public.finance_categories where user_id=owner and code='outside-food';
 perform public.finance_initialize_openings(jsonb_build_array(
   jsonb_build_object('accountId',post_account,'amountMinor','300000','effectiveDate','2026-10-29','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',ctbc_account,'amountMinor','300000','effectiveDate','2026-10-29','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',cash_account,'amountMinor','50000','effectiveDate','2026-10-29','operationKey',gen_random_uuid())
 ));
 -- October 30: one NT$450 purchase but three NT$150 cost allocations.
 purchase:=public.finance_put_transaction(
   p_operation_key=>event_key,p_kind=>'expense',p_amount_minor=>45000,
   p_txn_date=>'2026-10-30',p_source_account_id=>ctbc_account,
   p_category_id=>groceries,p_merchant=>'PX Mart',
   p_allocations=>'[{"amountMinor":"45000","startDate":"2026-10-30","durationDays":3}]'::jsonb
 );
 if public.finance_put_transaction(
   p_operation_key=>event_key,p_kind=>'expense',p_amount_minor=>45000,
   p_txn_date=>'2026-10-30',p_source_account_id=>ctbc_account,
   p_category_id=>groceries,p_merchant=>'PX Mart',
   p_allocations=>'[{"amountMinor":"45000","startDate":"2026-10-30","durationDays":3}]'::jsonb
 )<>purchase then raise exception 'Idempotent save replay failed'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc_account;
 if v<>255000 then raise exception 'NT$450 purchase was not deducted exactly once'; end if;
 select sum(balance_minor::numeric) into v from public.finance_account_balances where user_id=owner;
 if v<>605000 then raise exception 'Allocated days incorrectly changed bank totals'; end if;
 select actual_expense_minor::numeric,allocated_consumption_minor::numeric into v,v2
 from public.finance_monthly_summary('2026-10-01');
 if v<>45000 or v2<>30000 then raise exception 'October paid vs allocated totals disagree'; end if;
 select actual_expense_minor::numeric,allocated_consumption_minor::numeric into v,v2
 from public.finance_monthly_summary('2026-11-01');
 if v<>0 or v2<>15000 then raise exception 'November allocated share was charged again'; end if;
 select actual_expense_minor::numeric,allocated_cost_minor::numeric into v,v2
 from public.finance_daily_budget('2026-10-01') where day_date='2026-10-30';
 if v<>45000 or v2<>15000 then raise exception 'October 30 daily paid and allocation mismatch'; end if;
 select sum(amount_minor::numeric) into v from public.finance_day_cost_breakdown('2026-11-01');
 if v<>15000 then raise exception 'Day item breakdown missing cross-month allocation'; end if;

 -- Ordinary outside food plus grocery allocation on same day.
 drink:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>4000,
   p_txn_date=>'2026-10-30',p_source_account_id=>cash_account,
   p_category_id=>food,p_merchant=>'Coffee'
 );
 select sum(amount_minor::numeric) into v
 from public.finance_day_cost_breakdown('2026-10-30');
 if v<>19000 then raise exception 'Ordinary expense was not added to grocery consumption'; end if;

 -- Edit 450/3 -> 500/5: reverse original account effect by 450, apply 500.
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>50000,
   p_txn_date=>'2026-10-30',p_source_account_id=>ctbc_account,
   p_category_id=>groceries,p_merchant=>'PX Mart corrected',
   p_transaction_id=>purchase,p_expected_revision=>1,
   p_allocations=>'[{"amountMinor":"50000","startDate":"2026-10-30","durationDays":5}]'::jsonb
 );
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc_account;
 if v<>250000 then raise exception 'Purchase edit did not restore 450 and deduct 500 once'; end if;
 select count(*) into n from public.finance_allocation_rules where user_id=owner and transaction_id=purchase;
 if n<>1 then raise exception 'Stale allocation rules were not replaced'; end if;
 select sum(amount_minor::numeric) into v from public.finance_day_cost_breakdown('2026-11-03');
 if v<>10000 then raise exception 'New fifth allocation day missing'; end if;
 begin
   perform public.finance_put_transaction(
     p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>50000,
     p_txn_date=>'2026-10-30',p_source_account_id=>ctbc_account,
     p_category_id=>groceries,p_merchant=>'Stale edit',
     p_transaction_id=>purchase,p_expected_revision=>1,p_allocations=>'[]'::jsonb
   );
   raise exception 'Stale revision was accepted';
 exception when others then
   if sqlerrm='Stale revision was accepted' then raise; end if;
 end;

 -- Switch payment account from CTBC to Post while preserving one purchase.
 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>50000,
   p_txn_date=>'2026-10-30',p_source_account_id=>post_account,
   p_category_id=>groceries,p_merchant=>'PX Mart corrected',
   p_transaction_id=>purchase,p_expected_revision=>2,
   p_allocations=>'[{"amountMinor":"50000","startDate":"2026-10-30","durationDays":5}]'::jsonb
 );
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc_account;
 if v<>300000 then raise exception 'Payment-account correction did not restore CTBC'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=post_account;
 if v<>250000 then raise exception 'Payment-account correction did not debit Post once'; end if;

 -- Void removes every active day share and credits the single financial payment.
 perform public.finance_void_transaction(gen_random_uuid(),purchase,3);
 select balance_minor::numeric into v from public.finance_account_balances where account_id=post_account;
 if v<>300000 then raise exception 'Void did not restore original purchase'; end if;
 select count(*) into n from public.finance_allocation_rules where user_id=owner and transaction_id=purchase;
 if n<>0 then raise exception 'Voided purchase retained active allocation rules'; end if;
 select sum(amount_minor::numeric) into v from public.finance_day_cost_breakdown('2026-11-03');
 if v is not null then raise exception 'Voided purchase still contributes in November'; end if;

 -- Optional item-level grocery basket (300 + 120 + 100), one NT$520 bank payment.
 basket:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>52000,
   p_txn_date=>'2026-10-30',p_source_account_id=>ctbc_account,
   p_category_id=>groceries,p_merchant=>'Basket',
   p_allocations=>(
     jsonb_build_array(
      jsonb_build_object('itemName','Chicken','amountMinor','30000','startDate','2026-10-30','durationDays',3),
      jsonb_build_object('itemName','Vegetables','amountMinor','12000','startDate','2026-10-30','durationDays',4),
      jsonb_build_object('itemName','Eggs','amountMinor','10000','startDate','2026-10-30','durationDays',5)
     )
   )
 );
 select sum(amount_minor::numeric) into v from public.finance_day_cost_breakdown('2026-10-30')
 where transaction_id=basket;
 if v<>15000 then raise exception 'Item-level daily allocations are incorrect'; end if;
 select count(*) into n from public.finance_allocation_rules where user_id=owner and transaction_id=basket;
 if n<>3 then raise exception 'Item-level definitions were not saved atomically'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc_account;
 if v<>248000 then raise exception 'Whole basket did not debit CTBC exactly once'; end if;

 -- Future schedule saves rules but does not change bank money until explicitly posted.
 plan:=public.finance_upsert_allocated_plan(
   p_operation_key=>plan_key,p_amount_minor=>9000,p_due_date=>'2099-01-01',
   p_account_id=>ctbc_account,p_category_id=>groceries,p_merchant=>'Future rice',
   p_allocations=>'[{"itemName":"Rice","amountMinor":"9000","startDate":"2099-01-01","durationDays":3}]'::jsonb
 );
 if plan<>public.finance_upsert_allocated_plan(
   p_operation_key=>plan_key,p_amount_minor=>9000,p_due_date=>'2099-01-01',
   p_account_id=>ctbc_account,p_category_id=>groceries,p_merchant=>'Future rice',
   p_allocations=>'[{"itemName":"Rice","amountMinor":"9000","startDate":"2099-01-01","durationDays":3}]'::jsonb
 ) then raise exception 'Plan retry not idempotent'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=ctbc_account;
 if v<>248000 then raise exception 'Future plan charged bank before its date'; end if;
 if not exists(select 1 from public.finance_plan_details
   where id=plan and jsonb_array_length(allocation_rules)=1)
 then raise exception 'Future grocery allocation rule was not stored'; end if;
 begin
   perform public.finance_post_plan(gen_random_uuid(),plan,1);
   raise exception 'Future grocery schedule posted prematurely';
 exception when others then
   if sqlerrm='Future grocery schedule posted prematurely' then raise; end if;
 end;
 perform public.finance_upsert_allocated_plan(
   p_operation_key=>gen_random_uuid(),p_amount_minor=>10000,p_due_date=>'2099-01-01',
   p_account_id=>ctbc_account,p_category_id=>groceries,p_merchant=>'Future rice corrected',
   p_plan_id=>plan,p_expected_revision=>1,
   p_allocations=>'[{"itemName":"Rice","amountMinor":"10000","startDate":"2099-01-01","durationDays":5}]'::jsonb
 );
 begin
   perform public.finance_upsert_allocated_plan(
     p_operation_key=>gen_random_uuid(),p_amount_minor=>10000,p_due_date=>'2099-01-01',
     p_account_id=>ctbc_account,p_category_id=>groceries,p_merchant=>'Stale scheduled',
     p_plan_id=>plan,p_expected_revision=>1,p_allocations=>'[]'::jsonb
   );
   raise exception 'Stale scheduled edit succeeded';
 exception when others then
   if sqlerrm='Stale scheduled edit succeeded' then raise; end if;
 end;

 -- A past-due plan posts exactly one transaction and preserves its allocation rules.
 due_plan:=public.finance_upsert_allocated_plan(
   p_operation_key=>gen_random_uuid(),p_amount_minor=>12000,p_due_date=>'2026-10-29',
   p_account_id=>post_account,p_category_id=>groceries,p_merchant=>'Due groceries',
   p_allocations=>'[{"amountMinor":"12000","startDate":"2026-10-30","durationDays":3}]'::jsonb
 );
 event_key:=gen_random_uuid();
 actual_id:=public.finance_post_plan(event_key,due_plan,1);
 if actual_id<>public.finance_post_plan(event_key,due_plan,1)
 then raise exception 'Repeat post debited a second time'; end if;
 select count(*) into n from public.finance_allocation_rules
   where user_id=owner and transaction_id=actual_id;
 if n<>1 then raise exception 'Posting did not carry forward grocery allocation'; end if;
 select balance_minor::numeric into v from public.finance_account_balances where account_id=post_account;
 if v<>288000 then raise exception 'Due grocery plan did not debit once'; end if;

 -- RLS: another signed-in user sees only their own daily spend, never plans.
 perform set_config('request.jwt.claim.sub',other_owner::text,true);
 perform public.finance_bootstrap();
 select count(*) into n from public.finance_day_cost_breakdown('2026-10-30');
 if n<>0 then raise exception 'Daily purchase data leaked to another owner'; end if;
 if exists(select 1 from public.finance_plan_details where id=plan)
 then raise exception 'Scheduled grocery plan leaked'; end if;
 begin
   perform public.finance_upsert_allocated_plan(
     p_operation_key=>gen_random_uuid(),p_amount_minor=>15000,p_due_date=>'2099-01-01',
     p_account_id=>ctbc_account,p_category_id=>groceries,p_merchant=>'Stolen plan',
     p_plan_id=>plan,p_expected_revision=>2,p_allocations=>'[]'::jsonb
   );
   raise exception 'Cross-user plan update was allowed';
 exception when others then
   if sqlerrm='Cross-user plan update was allowed' then raise; end if;
 end;
end $$;
reset role;
