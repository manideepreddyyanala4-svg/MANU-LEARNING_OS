-- Disposable PG-only functional checks for Phase 4. NEVER execute on a production database.
-- Use dedicated fixture owners so earlier phases cannot contaminate expected balances.
insert into auth.users(id) values
  ('00000000-0000-4000-8000-000000000003'::uuid),
  ('00000000-0000-4000-8000-000000000004'::uuid);
set role authenticated;
do $$
declare
 u uuid := '00000000-0000-4000-8000-000000000003';
 u2 uuid := '00000000-0000-4000-8000-000000000004';
 post_id uuid; ctbc_id uuid; cash_id uuid; grocery_id uuid; other_id uuid;
 expense_id uuid; income_id uuid; plan_id uuid; posted_id uuid;
 original_key uuid := gen_random_uuid();
 schedule_key uuid := gen_random_uuid();
 n numeric; total numeric; count_rows integer;
begin
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform public.finance_bootstrap();
 select id into post_id from public.finance_accounts where user_id=u and code='post';
 select id into ctbc_id from public.finance_accounts where user_id=u and code='ctbc';
 select id into cash_id from public.finance_accounts where user_id=u and code='cash';
 select id into grocery_id from public.finance_categories where user_id=u and code='groceries';
 select id into other_id from public.finance_categories where user_id=u and code='outside-food';

 perform public.finance_initialize_openings(jsonb_build_array(
 jsonb_build_object('accountId',post_id,'amountMinor','300000','effectiveDate','2026-10-29','operationKey',gen_random_uuid()),
 jsonb_build_object('accountId',ctbc_id,'amountMinor','300000','effectiveDate','2026-10-29','operationKey',gen_random_uuid()),
 jsonb_build_object('accountId',cash_id,'amountMinor','50000','effectiveDate','2026-10-29','operationKey',gen_random_uuid())));

 expense_id:=public.finance_put_transaction(original_key,'expense',35000,'2026-10-29',
   ctbc_id,null,grocery_id,'PX Mart','');
 if expense_id<>public.finance_put_transaction(original_key,'expense',35000,'2026-10-29',ctbc_id,null,grocery_id,'PX Mart','')
 then raise exception 'Expense idempotency key failed'; end if;
 select balance_minor::numeric into n from public.finance_account_balances where account_id=ctbc_id;
 if n<>265000 then raise exception 'Expense failed to debit CTBC'; end if;

 perform public.finance_put_transaction(gen_random_uuid(),'expense',10000,'2026-10-29',cash_id,null,other_id,'FamilyMart');
 income_id:=public.finance_put_transaction(gen_random_uuid(),'income',600000,'2026-10-29',null,post_id,null,'Research Assistant stipend');
 select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u;
 if total<>1205000 then raise exception 'Expenses and income: expected NT$12050'; end if;
 select actual_expense_minor::numeric into n from public.finance_monthly_summary('2026-10-01');
 if n<>45000 then raise exception 'Actual spending expected NT$450'; end if;

 -- Correction from 350 to 300 reverses 50; no second expense.
 perform public.finance_put_transaction(gen_random_uuid(),'expense',30000,'2026-10-29',
   ctbc_id,null,grocery_id,'PX Mart','Corrected',expense_id,1);
 select balance_minor::numeric into n from public.finance_account_balances where account_id=ctbc_id;
 if n<>270000 then raise exception 'Edit failed to restore 50 TWD'; end if;
 select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u;
 if total<>1210000 then raise exception 'Expected NT$12,100 total after correction'; end if;
 select actual_expense_minor::numeric into n from public.finance_monthly_summary('2026-10-01');
 if n<>40000 then raise exception 'Edited expense double counted'; end if;

 -- Source swap reverses CTBC and charges Post.
 perform public.finance_put_transaction(gen_random_uuid(),'expense',30000,'2026-10-29',
   post_id,null,grocery_id,'PX Mart','Actual account',expense_id,2);
 select balance_minor::numeric into n from public.finance_account_balances where account_id=ctbc_id;
 if n<>300000 then raise exception 'Payment account edit failed CTBC reversal'; end if;

 -- Repeated void is blocked; first void reverses expense.
 perform public.finance_void_transaction(gen_random_uuid(),expense_id,3);
 select actual_expense_minor::numeric into n from public.finance_monthly_summary('2026-10-01');
 if n<>10000 then raise exception 'Voided expense still counts as spending'; end if;
 begin
   perform public.finance_void_transaction(gen_random_uuid(),expense_id,4);
   raise exception 'Double void unexpectedly allowed';
 exception when others then
   if sqlerrm='Double void unexpectedly allowed' then raise; end if;
 end;

 -- Transfers do not count as income or expenses; source and destination move equally.
 perform public.finance_put_transaction(gen_random_uuid(),'transfer',20000,'2026-10-29',ctbc_id,cash_id);
 select actual_income_minor::numeric into n from public.finance_monthly_summary('2026-10-01');
 if n<>600000 then raise exception 'Transfer appeared as income'; end if;
 select actual_expense_minor::numeric into n from public.finance_monthly_summary('2026-10-01');
 if n<>10000 then raise exception 'Transfer appeared as expense'; end if;

 -- Future planned money is not real bank money.
 plan_id:=public.finance_upsert_plan(schedule_key,'expense',25000,'2099-01-01',
   ctbc_id,grocery_id,'PX Mart future','');
 if plan_id<>public.finance_upsert_plan(schedule_key,'expense',25000,'2099-01-01',
    ctbc_id,grocery_id,'PX Mart future','')
 then raise exception 'Scheduled idempotency failed'; end if;
 if not exists(select 1 from public.finance_plan_details
    where id=plan_id and status='planned' and amount_minor='25000')
 then raise exception 'Scheduled read model failed'; end if;
 select balance_minor::numeric into n from public.finance_account_balances where account_id=ctbc_id;
 if n<>280000 then raise exception 'A future planned entry wrongly charged the bank'; end if;
 begin
   perform public.finance_post_plan(gen_random_uuid(),plan_id,1);
   raise exception 'Future schedule posted prematurely';
 exception when others then
   if sqlerrm='Future schedule posted prematurely' then raise; end if;
 end;

 -- Owner scoped planned edit then cancel.
 perform public.finance_upsert_plan(gen_random_uuid(),'expense',26000,'2099-01-02',
    ctbc_id,grocery_id,'Edited future','',plan_id,1);
 begin
   perform public.finance_upsert_plan(gen_random_uuid(),'expense',9999,'2099-01-02',
    ctbc_id,grocery_id,'Stale edit','',plan_id,1);
   raise exception 'Stale schedule edit unexpectedly succeeded';
 exception when others then
   if sqlerrm='Stale schedule edit unexpectedly succeeded' then raise; end if;
 end;
 perform public.finance_upsert_plan(gen_random_uuid(),'expense',26000,'2099-01-02',
    ctbc_id,grocery_id,'Edited future','',plan_id,2,true);

 -- An explicitly confirmed due plan posts once and is linked to one real event.
 plan_id:=public.finance_upsert_plan(gen_random_uuid(),'income',120000,'2026-10-29',
    cash_id,null,'Family support','');
 schedule_key:=gen_random_uuid();
 posted_id:=public.finance_post_plan(schedule_key,plan_id,1);
 if posted_id<>public.finance_post_plan(schedule_key,plan_id,1)
 then raise exception 'Planned post was not retry-idempotent'; end if;
 select count(*) into count_rows from public.finance_transactions where user_id=u
   and id=posted_id and kind='income' and amount_minor=120000;
 if count_rows<>1 then raise exception 'Planned income did not create one event'; end if;
 begin
   perform public.finance_post_plan(gen_random_uuid(),plan_id,2);
   raise exception 'Scheduled item double-posted';
 exception when others then
   if sqlerrm='Scheduled item double-posted' then raise; end if;
 end;

 -- A reconciliation locks the meaning of older balances: edits must not silently rewrite it.
 expense_id:=public.finance_put_transaction(gen_random_uuid(),'expense',7000,'2026-10-29',
   post_id,null,other_id,'Older expense','');
 perform public.finance_reconcile_account(gen_random_uuid(),post_id,850000,'2026-10-29','Checked statement');
 begin
   perform public.finance_put_transaction(gen_random_uuid(),'expense',5000,'2026-10-29',
     post_id,null,other_id,'Rewritten expense','',expense_id,1);
   raise exception 'Edit after reconciliation was silently accepted';
 exception when others then
   if sqlerrm='Edit after reconciliation was silently accepted' then raise; end if;
 end;

 -- Other owners cannot access or modify scheduled entries.
 perform set_config('request.jwt.claim.sub',u2::text,true);
 perform public.finance_bootstrap();
 if exists(select 1 from public.finance_plan_details where id=plan_id)
 then raise exception 'Other owner could read scheduled entry'; end if;
 begin
   perform public.finance_post_plan(gen_random_uuid(),plan_id,1);
   raise exception 'Other owner posted scheduled entry';
 exception when others then
   if sqlerrm='Other owner posted scheduled entry' then raise; end if;
 end;
end $$;
reset role;
