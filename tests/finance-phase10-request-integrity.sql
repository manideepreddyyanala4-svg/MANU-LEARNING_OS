-- Phase 10 hardening regression: isolated PostgreSQL only.
-- Verifies a retry key cannot silently accept a different expense or statement.
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000011'::uuid),
 ('00000000-0000-4000-8000-000000000012'::uuid);
set role authenticated;
do $$
declare
 owner uuid:='00000000-0000-4000-8000-000000000011';
 intruder uuid:='00000000-0000-4000-8000-000000000012';
 account_id uuid;other_account uuid;category_id uuid;
 original uuid; recon uuid;
 write_key uuid:=gen_random_uuid();
 recon_key uuid:=gen_random_uuid();
 balance numeric; bad boolean;
begin
 perform set_config('request.jwt.claim.sub',owner::text,true);
 perform public.finance_bootstrap();
 select id into account_id from public.finance_accounts where user_id=owner and code='ctbc';
 select id into other_account from public.finance_accounts where user_id=owner and code='post';
 select id into category_id from public.finance_categories where user_id=owner and code='groceries';
 perform public.finance_initialize_openings(jsonb_build_array(
  jsonb_build_object('accountId',account_id,'amountMinor','200000','effectiveDate','2025-09-01','operationKey',gen_random_uuid()),
  jsonb_build_object('accountId',other_account,'amountMinor','50000','effectiveDate','2025-09-01','operationKey',gen_random_uuid())
 ));
 original:=public.finance_put_transaction(
  p_operation_key=>write_key,p_kind=>'expense',p_amount_minor=>35000,
  p_txn_date=>'2025-10-20',p_source_account_id=>account_id,
  p_category_id=>category_id,p_merchant=>'PX Mart',
  p_allocations=>'[{"amountMinor":"35000","startDate":"2025-10-20","durationDays":3}]'::jsonb);
 if original is distinct from public.finance_put_transaction(
  p_operation_key=>write_key,p_kind=>'expense',p_amount_minor=>35000,
  p_txn_date=>'2025-10-20',p_source_account_id=>account_id,
  p_category_id=>category_id,p_merchant=>'PX Mart',
  p_allocations=>'[{"amountMinor":"35000","startDate":"2025-10-20","durationDays":3}]'::jsonb)
 then raise exception 'Same-request retry changed transaction ID';end if;
 begin
  perform public.finance_put_transaction(
   p_operation_key=>write_key,p_kind=>'expense',p_amount_minor=>36000,
   p_txn_date=>'2025-10-20',p_source_account_id=>account_id,
   p_category_id=>category_id,p_merchant=>'PX Mart',
   p_allocations=>'[{"amountMinor":"36000","startDate":"2025-10-20","durationDays":3}]'::jsonb);
  raise exception 'Reused operation key accepted different amount';
 exception when others then
  if sqlerrm='Reused operation key accepted different amount' then raise;end if;
  if sqlerrm not like '%Operation key reused%' then raise;end if;
 end;
 begin
  perform public.finance_put_transaction(
   p_operation_key=>write_key,p_kind=>'expense',p_amount_minor=>35000,
   p_txn_date=>'2025-10-20',p_source_account_id=>other_account,
   p_category_id=>category_id,p_merchant=>'PX Mart',
   p_allocations=>'[{"amountMinor":"35000","startDate":"2025-10-20","durationDays":3}]'::jsonb);
  raise exception 'Reused operation key accepted different bank account';
 exception when others then
  if sqlerrm='Reused operation key accepted different bank account' then raise;end if;
  if sqlerrm not like '%Operation key reused%' then raise;end if;
 end;
 begin
  perform public.finance_put_transaction(
   p_operation_key=>write_key,p_kind=>'expense',p_amount_minor=>35000,
   p_txn_date=>'2025-10-20',p_source_account_id=>account_id,
   p_category_id=>category_id,p_merchant=>'Different merchant',
   p_allocations=>'[{"amountMinor":"35000","startDate":"2025-10-20","durationDays":3}]'::jsonb);
  raise exception 'Reused operation key accepted different merchant';
 exception when others then
  if sqlerrm='Reused operation key accepted different merchant' then raise;end if;
  if sqlerrm not like '%Operation key reused%' then raise;end if;
 end;
 if (select count(*) from public.finance_transactions where user_id=owner and kind='expense')<>1
 then raise exception 'Duplicate expense posted';end if;
 select b.balance_minor::numeric into balance
 from public.finance_account_balances b where b.code='ctbc' and b.user_id=owner;
 if balance<>165000 then raise exception 'Expense deducted more than once: %',balance;end if;
 recon:=public.finance_reconcile_account(
   recon_key,account_id,165500,'2025-10-30','Verified bank app');
 if recon is distinct from public.finance_reconcile_account(
   recon_key,account_id,165500,'2025-10-30','Verified bank app')
 then raise exception 'Identical reconciliation replay was not idempotent';end if;
 begin
  perform public.finance_reconcile_account(
   recon_key,account_id,165000,'2025-10-30','Verified bank app');
  raise exception 'Reused reconciliation key accepted a different target';
 exception when others then
  if sqlerrm='Reused reconciliation key accepted a different target' then raise;end if;
  if sqlerrm not like '%Reconciliation key reused%' then raise;end if;
 end;
 if (select count(*) from public.finance_ledger_events where user_id=owner
     and operation_key=write_key)<>1
 then raise exception 'Ledger duplicated the transaction request key';end if;
 if (select count(*) from public.finance_ledger_events where user_id=owner
     and operation_key=recon_key)<>1
 then raise exception 'Ledger duplicated the reconciliation request key';end if;
 -- User 2 cannot replay owner 1's ledger event, even knowing an operation UUID.
 perform set_config('request.jwt.claim.sub',intruder::text,true);
 perform public.finance_bootstrap();
 begin
  perform public.finance_put_transaction(
   p_operation_key=>write_key,p_kind=>'expense',p_amount_minor=>35000,
   p_txn_date=>'2025-10-20',p_source_account_id=>account_id,
   p_category_id=>category_id,p_merchant=>'PX Mart');
  raise exception 'Cross-owner replay or write was authorized';
 exception when others then
  if sqlerrm='Cross-owner replay or write was authorized' then raise;end if;
 end;
 raise notice 'Phase 10 request-integrity PASS: duplicate payments, same-key mismatch, reconciliation, cross-owner';
end $$;
reset role;
