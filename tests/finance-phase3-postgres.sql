-- Isolated disposable PostgreSQL test only. Run after mock auth fixture + 009-012.
-- Uses fictional figures, never actual user data.
set role authenticated;
do $$
declare
  u1 uuid := '00000000-0000-4000-8000-000000000001'::uuid;
  u2 uuid := '00000000-0000-4000-8000-000000000002'::uuid;
  post_id uuid; ctbc_id uuid; cash_id uuid; zero_id uuid;
  keys jsonb; first_results jsonb; replay_results jsonb;
  transfer_id uuid; adjustment_id uuid; opening_id uuid;
  expected numeric; total numeric; overview numeric; count_openings integer;
begin
  perform set_config('request.jwt.claim.sub',u2::text,true);
  perform public.finance_bootstrap();
  select id into post_id from public.finance_accounts where user_id=u2 and code='post';
  select id into ctbc_id from public.finance_accounts where user_id=u2 and code='ctbc';
  select id into cash_id from public.finance_accounts where user_id=u2 and code='cash';
  keys:=jsonb_build_array(
    jsonb_build_object('accountId',post_id,'amountMinor','300000','effectiveDate','2026-10-30','operationKey',gen_random_uuid()),
    jsonb_build_object('accountId',ctbc_id,'amountMinor','300000','effectiveDate','2026-10-30','operationKey',gen_random_uuid()),
    jsonb_build_object('accountId',cash_id,'amountMinor','50000','effectiveDate','2026-10-30','operationKey',gen_random_uuid())
  );
  first_results:=public.finance_initialize_openings(keys);
  replay_results:=public.finance_initialize_openings(keys);
  if first_results<>replay_results then raise exception 'Opening batch retry not idempotent'; end if;
  select count(*) into count_openings from public.finance_transactions
    where user_id=u2 and kind='opening' and voided_at is null;
  if count_openings<>3 then raise exception 'Duplicate opening balances created'; end if;
  select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u2 and is_active;
  if total<>650000 then raise exception 'Test A: total must be NT$6500'; end if;
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=post_id;
  if expected<>300000 then raise exception 'Test A: post balance wrong'; end if;

  transfer_id:=public.finance_put_transaction(gen_random_uuid(),'transfer',50000,'2026-10-30',ctbc_id,post_id);
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=post_id;
  if expected<>350000 then raise exception 'Test B: Post must be NT$3500'; end if;
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=ctbc_id;
  if expected<>250000 then raise exception 'Test B: CTBC must be NT$2500'; end if;
  perform public.finance_put_transaction(gen_random_uuid(),'transfer',20000,'2026-10-30',post_id,cash_id);
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=post_id;
  if expected<>330000 then raise exception 'Test C: Post must be NT$3300'; end if;
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=cash_id;
  if expected<>70000 then raise exception 'Test C: Cash must be NT$700'; end if;
  select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u2 and is_active;
  if total<>650000 then raise exception 'Test C: transfer changed combined total'; end if;

  adjustment_id:=public.finance_reconcile_account(gen_random_uuid(),post_id,325000,
    '2026-10-30','Manual test statement amount');
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=post_id;
  if expected<>325000 then raise exception 'Test D: Post not reconciled'; end if;
  select sum(balance_minor::numeric) into total from public.finance_account_balances where user_id=u2 and is_active;
  if total<>645000 then raise exception 'Test D: total must be NT$6450'; end if;
  select adjustment_minor::numeric into overview from public.finance_account_overview where account_id=post_id;
  if overview<>-5000 then raise exception 'Test D: overview adjustment must be -NT$50'; end if;

  perform public.finance_void_transaction(gen_random_uuid(),adjustment_id,1);
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=post_id;
  if expected<>330000 then raise exception 'Test I: audited reversal failed'; end if;

  select id into opening_id from public.finance_transactions
    where user_id=u2 and kind='opening' and destination_account_id=post_id;
  perform public.finance_put_transaction(gen_random_uuid(),'opening',310000,'2026-10-30',
    null,post_id,null,'Opening balance','Fix initial transcription',opening_id,1);
  select balance_minor::numeric into expected from public.finance_account_balances where account_id=post_id;
  if expected<>340000 then raise exception 'Edited initial opening incorrectly'; end if;
  select opening_minor::numeric into overview from public.finance_account_overview where account_id=post_id;
  if overview<>310000 then raise exception 'Opening overview not updated'; end if;

  zero_id:=public.finance_create_account('Unused Cash','cash');
  perform public.finance_initialize_openings(jsonb_build_array(
    jsonb_build_object('accountId',zero_id,'amountMinor','0','effectiveDate','2026-10-30','operationKey',gen_random_uuid())
  ));
  if not exists (select 1 from public.finance_account_overview
    where account_id=zero_id and opening_transaction_id is not null and opening_minor::numeric=0)
    then raise exception 'Explicit zero opening was not persisted'; end if;
  perform public.finance_update_account(zero_id,'Unused Cash',false);
  if exists(select 1 from public.finance_account_balances
    where account_id=zero_id and is_active) then raise exception 'Archive failed'; end if;

  -- Owner isolation for the new read model and init RPC.
  perform set_config('request.jwt.claim.sub',u1::text,true);
  if exists(select 1 from public.finance_account_overview where account_id=post_id)
    then raise exception 'Test G: cross-user view leaked account overview'; end if;
  begin
    perform public.finance_initialize_openings(jsonb_build_array(
      jsonb_build_object('accountId',post_id,'amountMinor','111','effectiveDate','2026-10-30','operationKey',gen_random_uuid())
    ));
    raise exception 'Test G: cross-user opening unexpectedly allowed';
  exception when others then
    if sqlerrm='Test G: cross-user opening unexpectedly allowed' then raise; end if;
  end;

  -- All account overview arithmetic must equal the authoritative ledger.
  perform set_config('request.jwt.claim.sub',u2::text,true);
  if exists(
    select 1 from public.finance_account_balances a
    join public.finance_account_overview o on o.user_id=a.user_id and o.account_id=a.account_id
    where a.user_id=u2 and a.balance_minor::numeric<>
      (o.opening_minor::numeric+o.income_minor::numeric-o.expense_minor::numeric
       +o.net_transfer_minor::numeric+o.adjustment_minor::numeric)
  ) then raise exception 'Account breakdown disagrees with postings'; end if;
end $$;
reset role;