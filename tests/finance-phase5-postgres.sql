-- Disposable PostgreSQL only: fake owners. NEVER run against real Supabase.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000005'::uuid),
 ('00000000-0000-4000-8000-000000000006'::uuid);
set role authenticated;
do $$
declare
 u uuid:='00000000-0000-4000-8000-000000000005';
 intruder uuid:='00000000-0000-4000-8000-000000000006';
 post_id uuid; ctbc_id uuid; category_id uuid;
 rate_id uuid; newer_rate_id uuid;
 oct_budget uuid; nov_budget uuid; tx_id uuid;
 prior_balance numeric; after_balance numeric;
 month_cost numeric; month_actual numeric; updated_oct numeric;
 budget_rev integer;
begin
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform public.finance_bootstrap();
 select id into post_id from public.finance_accounts where user_id=u and code='post';
 select id into ctbc_id from public.finance_accounts where user_id=u and code='ctbc';
 select id into category_id from public.finance_categories where user_id=u and code='groceries';

 -- A missing month has no invented default budget.
 if exists(select 1 from public.finance_budget_details where user_id=u)
 then raise exception 'Budget was fabricated during bootstrap'; end if;
 select count(*) into budget_rev from public.finance_daily_budget('2027-02-01');
 if budget_rev<>28 then raise exception 'February 2027 must contain 28 days'; end if;
 select count(*) into budget_rev from public.finance_daily_budget('2028-02-01');
 if budget_rev<>29 then raise exception 'February 2028 must contain 29 days'; end if;

 perform public.finance_put_transaction(gen_random_uuid(),'opening',300000,'2026-10-29',null,post_id);
 perform public.finance_put_transaction(gen_random_uuid(),'opening',150000,'2026-10-29',null,ctbc_id);
 select sum(balance_minor::numeric) into prior_balance
 from public.finance_account_balances where user_id=u;
 oct_budget:=public.finance_upsert_monthly_budget('2026-10-01','TWD',50000);
 nov_budget:=public.finance_upsert_monthly_budget('2026-11-01','TWD',60000);

 -- An edit is scoped to its month and optimistic revision, never bank postings.
 perform public.finance_upsert_monthly_budget('2026-11-01','TWD',70000,null,1);
 select resolved_twd_minor::numeric into updated_oct
 from public.finance_budget_details where user_id=u and id=oct_budget;
 if updated_oct<>50000 then raise exception 'November budget edit altered October'; end if;
 select resolved_twd_minor::numeric into updated_oct
 from public.finance_budget_details where user_id=u and id=nov_budget;
 if updated_oct<>70000 then raise exception 'November budget edit did not persist'; end if;
 begin
   perform public.finance_upsert_monthly_budget('2026-11-01','TWD',80000,null,1);
   raise exception 'Stale budget update succeeded';
 exception when others then
   if sqlerrm='Stale budget update succeeded' then raise; end if;
 end;

 -- Explicit manual INR rate, frozen to each saved monthly version.
 rate_id:=public.finance_add_manual_fx_rate(0.38500000,'Test rate 1');
 perform public.finance_upsert_monthly_budget('2026-11-01','INR',600000,rate_id,2);
 select resolved_twd_minor::numeric into updated_oct
 from public.finance_budget_details where user_id=u and id=nov_budget;
 if updated_oct<>231000 then raise exception 'INR 6000 with rate 0.385 should be TWD 2310'; end if;
 newer_rate_id:=public.finance_add_manual_fx_rate(0.40000000,'Test rate 2');
 select resolved_twd_minor::numeric into updated_oct
 from public.finance_budget_details where user_id=u and id=nov_budget;
 if updated_oct<>231000 then raise exception 'New FX rate unexpectedly revalued historic budget'; end if;
 perform public.finance_upsert_monthly_budget('2026-11-01','INR',600000,newer_rate_id,3);
 select resolved_twd_minor::numeric into updated_oct
 from public.finance_budget_details where user_id=u and id=nov_budget;
 if updated_oct<>240000 then raise exception 'Explicit revalue failed'; end if;

 -- Financial source of truth: paid purchase in October, consumed October/November.
 tx_id:=public.finance_put_transaction(gen_random_uuid(),'expense',10000,'2026-10-30',
    ctbc_id,null,category_id,'Groceries','',null,null,
    '[{"amountMinor":"10000","startDate":"2026-10-30","durationDays":3}]'::jsonb);
 perform public.finance_put_transaction(gen_random_uuid(),'income',60000,'2026-10-30',
    null,post_id,null,'RA stipend');
 perform public.finance_put_transaction(gen_random_uuid(),'transfer',20000,'2026-10-30',
    post_id,ctbc_id);
 select actual_expense_minor::numeric,allocated_consumption_minor::numeric
 into month_actual,month_cost from public.finance_monthly_summary('2026-10-01');
 if month_actual<>10000 or month_cost<>6667 then
   raise exception 'October actual and allocated consumption mixed up'; end if;
 select actual_expense_minor::numeric,allocated_consumption_minor::numeric
 into month_actual,month_cost from public.finance_monthly_summary('2026-11-01');
 if month_actual<>0 or month_cost<>3333 then
   raise exception 'November allocation added an extra bank expense'; end if;

 select actual_expense_minor::numeric,allocated_cost_minor::numeric
 into month_actual,month_cost from public.finance_daily_budget('2026-10-01')
 where day_date='2026-10-30';
 if month_actual<>10000 or month_cost<>3334 then
   raise exception 'Daily October 30 cash-flow/consumption mismatch'; end if;
 select actual_expense_minor::numeric,allocated_cost_minor::numeric
 into month_actual,month_cost from public.finance_daily_budget('2026-11-01')
 where day_date='2026-11-01';
 if month_actual<>0 or month_cost<>3333 then
   raise exception 'Cross-month daily carryover incorrect'; end if;
 select sum(actual_expense_minor::numeric),sum(allocated_cost_minor::numeric)
 into month_actual,month_cost from public.finance_daily_budget('2026-10-01');
 if month_actual<>10000 or month_cost<>6667 then
   raise exception 'Daily totals do not match monthly totals'; end if;

 -- Expense revisions change actual spending but editing a monthly budget does not.
 perform public.finance_put_transaction(gen_random_uuid(),'expense',9000,'2026-10-30',
   ctbc_id,null,category_id,'Groceries','Reduced charge',tx_id,1,
   '[{"amountMinor":"9000","startDate":"2026-10-30","durationDays":3}]'::jsonb);
 select actual_expense_minor::numeric into month_actual
 from public.finance_monthly_summary('2026-10-01');
 if month_actual<>9000 then raise exception 'Edited transaction spending was not reflected'; end if;
 select actual_expense_minor::numeric,allocated_cost_minor::numeric
 into month_actual,month_cost from public.finance_daily_budget('2026-10-01')
 where day_date='2026-10-30';
 if month_actual<>9000 or month_cost<>3000 then
   raise exception 'Corrected expense was counted twice on October 30'; end if;

 select sum(balance_minor::numeric) into prior_balance
 from public.finance_account_balances where user_id=u;
 perform public.finance_upsert_monthly_budget('2026-10-01','TWD',100000,null,1);
 select sum(balance_minor::numeric) into after_balance
 from public.finance_account_balances where user_id=u;
 if prior_balance<>after_balance then raise exception 'Budget editing changed bank money'; end if;
 select actual_expense_minor::numeric into month_actual
 from public.finance_monthly_summary('2026-10-01');
 if month_actual<>9000 then raise exception 'Budget editing rewrote spending'; end if;

 -- Cross-owner private budget read and mutation protection.
 perform set_config('request.jwt.claim.sub',intruder::text,true);
 perform public.finance_bootstrap();
 if exists(select 1 from public.finance_budget_details where user_id=u or id=oct_budget)
 then raise exception 'Cross-owner budget data leaked'; end if;
 if exists(select 1 from public.finance_daily_budget('2026-10-01')
     where actual_expense_minor<>'0' or allocated_cost_minor<>'0')
 then raise exception 'Cross-owner daily cash flow leaked'; end if;
 begin
   perform public.finance_upsert_monthly_budget('2026-10-01','TWD',500,null,2);
   raise exception 'Cross-user budget update succeeded';
 exception when others then
   if sqlerrm='Cross-user budget update succeeded' then raise; end if;
 end;
end $$;
reset role;
