import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

/**
 * DESTRUCTIVE TO TEST DATA: run ONLY against an isolated disposable Supabase
 * project with migrations 001–011. No production database or real owner.
 *
 * MANU_FINANCE_ISOLATED_DB=1 MANU_FINANCE_TEST_READY=1
 * MANU_FINANCE_TEST_URL=... MANU_FINANCE_TEST_ANON_KEY=...
 * MANU_FINANCE_TEST_EMAIL=... MANU_FINANCE_TEST_PASSWORD=...
 */
const isolated = process.env.MANU_FINANCE_ISOLATED_DB === '1' &&
  process.env.MANU_FINANCE_TEST_READY === '1' &&
  Boolean(process.env.MANU_FINANCE_TEST_URL && process.env.MANU_FINANCE_TEST_ANON_KEY &&
    process.env.MANU_FINANCE_TEST_EMAIL && process.env.MANU_FINANCE_TEST_PASSWORD);

test('finance RPC accounting, revisions, retries, reconciliation and RLS (isolated DB)', async () => {
  test.skip(!isolated, 'Requires explicit isolated finance DB environment and migrations');
  test.setTimeout(120000);
  const client = createClient(process.env.MANU_FINANCE_TEST_URL!, process.env.MANU_FINANCE_TEST_ANON_KEY!);
  const {error:authError}=await client.auth.signInWithPassword({
    email:process.env.MANU_FINANCE_TEST_EMAIL!,password:process.env.MANU_FINANCE_TEST_PASSWORD!
  });
  expect(authError).toBeNull();
  async function rpc(name:string,args:Record<string,unknown>={}) {
    const {data,error}=await client.rpc(name,args);
    if(error) throw new Error(name+': '+error.message);
    return data as string;
  }
  async function balance(id:string):Promise<bigint> {
    const {data,error}=await client.from('finance_account_balances')
      .select('balance_minor').eq('account_id',id).single();
    if(error) throw error;
    return BigInt(data.balance_minor);
  }
  const now = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',
    year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const date = /^\d{4}-\d{2}-\d{2}$/.test(now) ? now : new Date().toISOString().slice(0,10);
  const month = date.slice(0,7)+'-01';
  await rpc('finance_bootstrap');
  await rpc('finance_bootstrap'); // idempotent

  const a = await rpc('finance_create_account',{p_name:'Finance test A '+randomUUID(),p_kind:'bank'});
  const b = await rpc('finance_create_account',{p_name:'Finance test B '+randomUUID(),p_kind:'bank'});
  const cash = await rpc('finance_create_account',{p_name:'Finance test Cash '+randomUUID(),p_kind:'cash'});
  const key = () => randomUUID();
  const create = async (kind:string, amount:string, src:string|null, dest:string|null, extra:Record<string,unknown>={}) =>
    rpc('finance_put_transaction',{p_operation_key:key(),p_kind:kind,p_amount_minor:amount,
      p_txn_date:date,p_source_account_id:src,p_destination_account_id:dest,...extra});

  const opening=await create('opening','100000',null,a);
  expect(await balance(a)).toBe(BigInt(100000));
  expect(opening).toBeTruthy();

  const paymentKey=key();
  const payload={p_operation_key:paymentKey,p_kind:'expense',p_amount_minor:'20000',
    p_txn_date:date,p_source_account_id:a,p_merchant:'Test grocery',
    p_allocations:[{itemName:'Staples',amountMinor:'20000',startDate:date,durationDays:3}]};
  const expense=await rpc('finance_put_transaction',payload);
  expect(await rpc('finance_put_transaction',payload)).toBe(expense); // idempotent
  expect(await balance(a)).toBe(BigInt(80000));

  await create('income','600000',null,b);
  expect(await balance(b)).toBe(BigInt(600000));
  await create('transfer','50000',b,a);
  expect(await balance(a)).toBe(BigInt(130000));
  expect(await balance(b)).toBe(BigInt(550000));
  const totalBeforeCash=(await balance(a))+(await balance(b))+(await balance(cash));
  await create('transfer','30000',a,cash);
  const totalAfterCash=(await balance(a))+(await balance(b))+(await balance(cash));
  expect(totalAfterCash).toBe(totalBeforeCash);

  await rpc('finance_put_transaction',{p_operation_key:key(),p_kind:'expense',p_amount_minor:'10000',
    p_txn_date:date,p_source_account_id:a,p_transaction_id:expense,p_expected_revision:1,
    p_allocations:[{itemName:'Staples',amountMinor:'10000',startDate:date,durationDays:3}]});
  expect(await balance(a)).toBe(BigInt(110000));
  await rpc('finance_put_transaction',{p_operation_key:key(),p_kind:'expense',p_amount_minor:'10000',
    p_txn_date:date,p_source_account_id:b,p_transaction_id:expense,p_expected_revision:2,
    p_allocations:[{itemName:'Staples',amountMinor:'10000',startDate:date,durationDays:3}]});
  expect(await balance(a)).toBe(BigInt(120000));
  expect(await balance(b)).toBe(BigInt(540000));

  const bad=await client.rpc('finance_put_transaction',{p_operation_key:key(),
    p_kind:'expense',p_amount_minor:'999',p_txn_date:date,p_source_account_id:a,
    p_transaction_id:expense,p_expected_revision:1});
  expect(bad.error).not.toBeNull(); // stale revision

  await rpc('finance_void_transaction',{p_operation_key:key(),
    p_transaction_id:expense,p_expected_revision:3});
  expect(await balance(b)).toBe(BigInt(550000));
  // Post concurrent payments BEFORE the reconciled statement date. A later
  // backdated spend is correctly forbidden by the Finance checkpoint guard.
  const parallel=await Promise.all([
    create('expense','100',a,null),create('expense','200',a,null)
  ]);
  expect(parallel[0]).not.toBe(parallel[1]);
  expect(await balance(a)).toBe(BigInt(119700));
  const adjustmentKey=key();
  const adjusted=await rpc('finance_reconcile_account',{p_operation_key:adjustmentKey,
    p_account_id:a,p_target_balance_minor:'77700',p_txn_date:date,p_reason:'Test statement reconciliation'});
  expect(await balance(a)).toBe(BigInt(77700));
  expect(await rpc('finance_reconcile_account',{p_operation_key:adjustmentKey,
    p_account_id:a,p_target_balance_minor:'77700',p_txn_date:date,p_reason:'Test statement reconciliation'}))
    .toBe(adjusted);
  expect(await balance(a)).toBe(BigInt(77700));

  const category=await rpc('finance_save_category',{p_name:'Test '+randomUUID()});
  expect(category).toBeTruthy();
  const rate=await rpc('finance_add_manual_fx_rate',{p_twd_per_inr:'0.50000000',
    p_note:'Isolated test rate, not live'});
  const budget=await rpc('finance_upsert_monthly_budget',{
    p_month_start:month,p_budget_currency:'INR',p_budget_minor:'600000',p_fx_rate_id:rate});
  expect(budget).toBeTruthy();
  const summary=await client.rpc('finance_monthly_summary',{p_month_start:month});
  expect(summary.error).toBeNull();
  expect(summary.data?.[0]?.resolved_twd_minor).toBe('300000');
  const invalidBudget=await client.rpc('finance_upsert_monthly_budget',{
    p_month_start:month,p_budget_currency:'TWD',p_budget_minor:'200000',
    p_expected_revision:999});
  expect(invalidBudget.error).not.toBeNull();
  await rpc('finance_upsert_monthly_budget',{p_month_start:month,p_budget_currency:'TWD',
    p_budget_minor:'200000',p_expected_revision:1});

  const directWrite=await client.from('finance_postings').insert({
    user_id:randomUUID(),ledger_event_id:randomUUID(),account_id:a,delta_minor:999
  });
  expect(directWrite.error).not.toBeNull(); // server-only journal mutation
});

test('unauthenticated users cannot read or initialize finance',async()=>{
  test.skip(!isolated,'Requires explicitly configured isolated DB');
  const anonymous=createClient(process.env.MANU_FINANCE_TEST_URL!,process.env.MANU_FINANCE_TEST_ANON_KEY!);
  const denied=await anonymous.rpc('finance_bootstrap');
  expect(denied.error).not.toBeNull();
  const read=await anonymous.from('finance_transactions').select('id');
  expect(read.error!==null || (read.data??[]).length===0).toBe(true);
});
