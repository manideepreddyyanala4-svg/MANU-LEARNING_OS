-- Phase 9 isolated authenticated ledger/export/reconciliation regression.
-- All data is synthetic and disposable; never run against real finance data.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-00000000000d'::uuid),
 ('00000000-0000-4000-8000-00000000000e'::uuid);
set role authenticated;
do $$
declare
 owner uuid:='00000000-0000-4000-8000-00000000000d';
 other_owner uuid:='00000000-0000-4000-8000-00000000000e';
 postbank uuid;ctbc uuid;cash uuid;groceries uuid;food uuid;
 expense_id uuid;grocery_id uuid;save_key uuid;
 out jsonb;diagnostic jsonb;amount numeric;
 original_bank numeric;owner_transactions integer;bank_balance numeric;
 manual_rate uuid;budget_id uuid;budget_revision integer;
begin
 perform set_config('request.jwt.claim.sub',owner::text,true);
 perform public.finance_bootstrap();
 select id into postbank from public.finance_accounts where user_id=owner and code='post';
 select id into ctbc from public.finance_accounts where user_id=owner and code='ctbc';
 select id into cash from public.finance_accounts where user_id=owner and code='cash';
 select id into groceries from public.finance_categories where user_id=owner and code='groceries';
 select id into food from public.finance_categories where user_id=owner and code='outside-food';
 perform public.finance_initialize_openings(jsonb_build_array(
   jsonb_build_object('accountId',postbank,'amountMinor','300000','effectiveDate','2025-10-01','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',ctbc,'amountMinor','300000','effectiveDate','2025-10-01','operationKey',gen_random_uuid()),
   jsonb_build_object('accountId',cash,'amountMinor','50000','effectiveDate','2025-10-01','operationKey',gen_random_uuid())
 ));
 select sum(balance_minor::numeric) into amount from public.finance_account_balances where user_id=owner;
 if amount<>650000 then raise exception 'Opening balances must be 6500 TWD'; end if;

 save_key:=gen_random_uuid();
 expense_id:=public.finance_put_transaction(
   p_operation_key=>save_key,p_kind=>'expense',p_amount_minor=>40000,
   p_txn_date=>'2025-10-28',p_source_account_id=>ctbc,
   p_category_id=>food,p_merchant=>'Meal'
 );
 if public.finance_put_transaction(
   p_operation_key=>save_key,p_kind=>'expense',p_amount_minor=>40000,
   p_txn_date=>'2025-10-28',p_source_account_id=>ctbc,
   p_category_id=>food,p_merchant=>'Meal'
 )<>expense_id then raise exception 'Idempotency replay did not return original payment';end if;
 select balance_minor::numeric into amount from public.finance_account_balances where account_id=ctbc;
 if amount<>260000 then raise exception 'CTBC expense must deduct once'; end if;

 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'transfer',p_amount_minor=>20000,
   p_txn_date=>'2025-10-28',p_source_account_id=>postbank,
   p_destination_account_id=>cash,p_merchant=>'Cash withdrawal'
 );
 select sum(balance_minor::numeric) into amount from public.finance_account_balances where user_id=owner;
 if amount<>610000 then raise exception 'Transfer must conserve bank-and-cash total'; end if;

 perform public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'income',p_amount_minor=>600000,
   p_txn_date=>'2025-10-28',p_destination_account_id=>postbank,
   p_merchant=>'RA stipend'
 );
 select balance_minor::numeric into amount from public.finance_account_balances where account_id=postbank;
 if amount<>880000 then raise exception 'Income must increase Post Bank to 8800'; end if;
 select sum(balance_minor::numeric) into amount from public.finance_account_balances where user_id=owner;
 if amount<>1210000 then raise exception 'Combined total after income must be 12100'; end if;

 grocery_id:=public.finance_put_transaction(
   p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>45000,
   p_txn_date=>'2025-10-30',p_source_account_id=>ctbc,
   p_category_id=>groceries,p_merchant=>'PX Mart',
   p_allocations=>'[{"amountMinor":"45000","startDate":"2025-10-30","durationDays":3}]'::jsonb
 );
 select balance_minor::numeric into original_bank
 from public.finance_account_balances where account_id=ctbc;
 if original_bank<>215000 then raise exception 'Grocery purchase deducted more than once'; end if;
 select allocated_cost_minor::numeric into amount
 from public.finance_daily_budget('2025-11-01') where day_date='2025-11-01';
 if amount<>15000 then raise exception 'Cross-month grocery daily share incorrect'; end if;
 select actual_expense_minor::numeric into amount
 from public.finance_daily_budget('2025-11-01') where day_date='2025-11-01';
 if amount<>0 then raise exception 'Future consumption double deducted actual payment'; end if;

 manual_rate:=public.finance_add_manual_fx_rate(4.25,'synthetic frozen exchange rate');
 budget_id:=public.finance_upsert_monthly_budget('2025-10-01','INR',600000,manual_rate);
 select b.revision into budget_revision from public.finance_monthly_budgets b where b.id=budget_id;
 perform public.finance_upsert_monthly_budget('2025-10-01','INR',700000,manual_rate,budget_revision);
 select balance_minor::numeric into bank_balance
 from public.finance_account_balances where account_id=ctbc;
 if bank_balance<>original_bank then raise exception 'Budget revision changed bank balance'; end if;

 diagnostic:=public.finance_integrity_report();
 if not (diagnostic->>'healthy')::boolean
   or (diagnostic->>'accountMismatchCount')::int<>0
 then raise exception 'Ledger report detected mismatch before export %',diagnostic; end if;
 out:=public.finance_full_backup();
 if out->>'format'<>'manuos-finance-full-backup' or (out->>'version')::integer<>2
 then raise exception 'Unsupported full finance backup'; end if;
 if jsonb_array_length(out->'transactions')<>(diagnostic->>'transactionCount')::int
 then raise exception 'Backup did not capture all owner transactions'; end if;
 if jsonb_array_length(out->'ledgerEvents')<>(diagnostic->>'ledgerEventCount')::int
 then raise exception 'Backup does not include full ledger history'; end if;
 if jsonb_array_length(out->'postings')<>(diagnostic->>'postingCount')::int
 then raise exception 'Backup does not include all bank postings'; end if;
 if jsonb_array_length(out->'allocations')<>1
 then raise exception 'Full backup missing grocery allocation'; end if;
 if jsonb_array_length(out->'monthlyBudgets')<>1
 then raise exception 'Full backup missing budget'; end if;
 if jsonb_array_length(out->'fxRates')<>1
 then raise exception 'Full backup missing manual FX'; end if;
 if jsonb_typeof(out->'transactions'->0->'amount_minor')<>'string'
 then raise exception 'Money should be precision-safe JSON text'; end if;
 select count(*) into owner_transactions from public.finance_transactions where user_id=owner;
 if jsonb_array_length(out->'transactions')<>owner_transactions
 then raise exception 'Backup silently truncated transactions'; end if;

 -- A reconciliation is an explicit dated ledger adjustment with audit provenance.
 perform public.finance_reconcile_account(
   gen_random_uuid(),ctbc,220000,'2025-10-30','Statement correction'
 );
 diagnostic:=public.finance_integrity_report();
 if not (diagnostic->>'healthy')::boolean
 then raise exception 'Reconciled account is not mathematically consistent'; end if;
 begin
   perform public.finance_put_transaction(
     p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>1000,
     p_txn_date=>'2025-10-29',p_source_account_id=>ctbc,
     p_category_id=>food,p_merchant=>'Late backdated meal'
   );
   raise exception 'Backdated purchase unexpectedly changed reconciled history';
 exception when others then
   if sqlerrm='Backdated purchase unexpectedly changed reconciled history' then raise;end if;
 end;
 begin
   perform public.finance_put_transaction(
     p_operation_key=>gen_random_uuid(),p_kind=>'expense',p_amount_minor=>30000,
     p_txn_date=>'2025-10-28',p_source_account_id=>ctbc,
     p_category_id=>food,p_merchant=>'Edited old expense',
     p_transaction_id=>expense_id,p_expected_revision=>1
   );
   raise exception 'Old expense changed after later reconciliation';
 exception when others then
   if sqlerrm='Old expense changed after later reconciliation' then raise;end if;
 end;
 select balance_minor::numeric into amount
 from public.finance_account_balances where account_id=ctbc;
 if amount<>220000 then raise exception 'Rejected backdate changed reconciled balance';end if;
 out:=public.finance_full_backup();
 if jsonb_array_length(out->'auditEvents')<1
 then raise exception 'Full backup lost reconciliation audit trail'; end if;

 -- Owner isolation: another signed-in user must not read this archive or report.
 perform set_config('request.jwt.claim.sub',other_owner::text,true);
 perform public.finance_bootstrap();
 out:=public.finance_full_backup();
 if out->>'ownerId'<>other_owner::text or
   jsonb_array_length(out->'transactions')<>0 or
   jsonb_array_length(out->'accounts')<>3
 then raise exception 'Finance backup includes foreign owner'; end if;
 diagnostic:=public.finance_integrity_report();
 if (diagnostic->>'transactionCount')::int<>0
 then raise exception 'Finance integrity report includes foreign owner'; end if;
 select count(*) into owner_transactions from public.finance_transactions where user_id=owner;
 if owner_transactions<>0 then raise exception 'RLS exposed another user transaction'; end if;
end $$;
reset role;
-- Verify more than the default 1000-row PostgREST response window can be
-- archived without truncation. The synthetic bulk rows are isolated to test DB.
insert into public.finance_categories(user_id,code,name)
select '00000000-0000-4000-8000-00000000000d'::uuid,
  'bulk-'+i::text,'Synthetic category '+i::text
from pg_catalog.generate_series(1,1100) i;
set role authenticated;
do $$
declare result jsonb;
begin
 perform set_config('request.jwt.claim.sub',
   '00000000-0000-4000-8000-00000000000d',true);
 result:=public.finance_full_backup();
 if jsonb_array_length(result->'categories')<1100
 then raise exception 'Owner backup truncated records above 1000'; end if;
 if (public.finance_integrity_report()->>'healthy')::boolean is not true
 then raise exception 'Backup stress test compromised ledger integrity'; end if;
end $$;
reset role;
