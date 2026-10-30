import { requireClient } from '@/lib/learning';
import { assertISODate } from './allocations';
import { minorBigInt } from './money';
import type {
  FinanceAccount, FinanceCategory, FinanceTransaction, GroceryRule,
  ISODate, ManualFxRate, MonthlyBudget, MonthlySummary, TransactionCommand,
  Currency, MoneyMinor, FinanceAccountOverview, OpeningBalanceEntry, AccountHistoryPage,
} from './types';

/**
 * Finance read/write boundary. Uses the existing authenticated Supabase client.
 * No localStorage ledger, service-role key, banking API or direct DML to finance
 * tables. Mutations call owner-authorized, atomic PostgreSQL RPC functions.
 */
async function clientForOwner() {
  const client = requireClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Finance requires a signed-in owner');
  return client;
}

async function callRpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const client = await clientForOwner();
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

function exactMinor(value: unknown): MoneyMinor {
  if (typeof value !== 'string') throw new Error('Finance backend returned an unsafe money representation');
  return minorBigInt(value).toString();
}

export async function initializeFinance(): Promise<void> {
  await callRpc<void>('finance_bootstrap');
}

export async function listFinanceAccounts(): Promise<FinanceAccount[]> {
  const client = await clientForOwner();
  const { data, error } = await client.from('finance_account_balances').select(
    'account_id,code,name,kind,currency,is_active,balance_minor'
  ).order('code');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAccount);
}

function mapAccount(row: Record<string, unknown>): FinanceAccount {
  return {
    accountId:String(row.account_id), code:String(row.code), name:String(row.name),
    kind:row.kind as FinanceAccount['kind'],currency:'TWD',
    isActive:row.is_active===true,balanceMinor:exactMinor(row.balance_minor),
  };
}

export async function createFinanceAccount(name: string, kind: 'bank'|'cash', code?: string): Promise<string> {
  return callRpc<string>('finance_create_account',{p_name:name,p_kind:kind,p_code:code ?? null});
}

export async function updateFinanceAccount(id: string, name: string, active: boolean): Promise<void> {
  await callRpc<void>('finance_update_account',{p_account_id:id,p_name:name,p_is_active:active});
}

export async function listCategories(): Promise<FinanceCategory[]> {
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_categories')
    .select('id,code,name,is_default,is_archived').order('name');
  if(error) throw new Error(error.message);
  return (data??[]).map(r=>({
    id:r.id,code:r.code,name:r.name,isDefault:r.is_default,isArchived:r.is_archived
  }));
}

export async function saveCategory(name:string, id?:string, archived=false):Promise<string> {
  return callRpc<string>('finance_save_category',{
    p_name:name,p_category_id:id??null,p_is_archived:archived
  });
}

export async function listTransactions(includeVoided=false): Promise<FinanceTransaction[]> {
  const client=await clientForOwner();
  let query=client.from('finance_transaction_details').select('*')
    .order('txn_date',{ascending:false}).order('created_at',{ascending:false});
  if(!includeVoided) query=query.is('voided_at',null);
  const {data,error}=await query;
  if(error) throw new Error(error.message);
  return (data??[]).map(r=>({
    id:r.id,kind:r.kind,amountMinor:exactMinor(r.amount_minor),currency:'TWD',
    txnDate:r.txn_date,txnTime:r.txn_time,
    sourceAccountId:r.source_account_id,destinationAccountId:r.destination_account_id,
    categoryId:r.category_id,merchant:r.merchant,note:r.note,
    revision:r.revision,voidedAt:r.voided_at,createdAt:r.created_at,updatedAt:r.updated_at
  }));
}

export async function saveTransaction(command: TransactionCommand): Promise<string> {
  assertISODate(command.txnDate);
  const amount=minorBigInt(command.amountMinor).toString();
  const allocations:GroceryRule[]=command.allocations??[];
  for(const a of allocations) {
    assertISODate(a.startDate);
    minorBigInt(a.amountMinor);
    if(!Number.isInteger(a.durationDays) || a.durationDays<1 || a.durationDays>3650)
      throw new Error('Invalid grocery duration');
  }
  return callRpc<string>('finance_put_transaction',{
    p_operation_key:command.idempotencyKey,p_kind:command.kind,
    p_amount_minor:amount,p_txn_date:command.txnDate,p_txn_time:command.txnTime??null,
    p_source_account_id:command.sourceAccountId??null,
    p_destination_account_id:command.destinationAccountId??null,
    p_category_id:command.categoryId??null,
    p_merchant:command.merchant??'',p_note:command.note??'',
    p_transaction_id:command.transactionId??null,
    p_expected_revision:command.expectedRevision??null,
    p_allocations:command.allocations===undefined ? null : allocations.map(a=>({
      itemName:a.itemName??'',categoryId:a.categoryId??null,
      amountMinor:minorBigInt(a.amountMinor).toString(),
      startDate:a.startDate,durationDays:a.durationDays
    })),
    p_void:false,
  });
}

export async function voidTransaction(
  transactionId:string,expectedRevision:number,idempotencyKey:string
):Promise<string> {
  return callRpc<string>('finance_void_transaction',{
    p_operation_key:idempotencyKey,
    p_transaction_id:transactionId,
    p_expected_revision:expectedRevision
  });
}

export async function reconcileAccount(
  accountId:string,targetBalanceMinor:MoneyMinor,reason:string,date:ISODate,
  idempotencyKey:string
):Promise<string> {
  assertISODate(date);
  return callRpc<string>('finance_reconcile_account',{
    p_operation_key:idempotencyKey,p_account_id:accountId,
    p_target_balance_minor:minorBigInt(targetBalanceMinor).toString(),
    p_txn_date:date,p_reason:reason
  });
}

export async function listAllocationDefinitions(transactionId?: string) {
  const client=await clientForOwner();
  let query=client.from('finance_allocation_details').select('*')
    .order('sort_order');
  if(transactionId) query=query.eq('transaction_id',transactionId);
  const {data,error}=await query;
  if(error) throw new Error(error.message);
  return (data??[]).map(r=>({
    id:r.id,transactionId:r.transaction_id,itemName:r.item_name,
    categoryId:r.category_id,amountMinor:exactMinor(r.amount_minor),
    startDate:r.start_date,durationDays:r.duration_days
  }));
}

export async function setFinancePreferences(currency:Currency,timezone:string):Promise<void> {
  await callRpc<void>('finance_update_preferences',{p_currency:currency,p_timezone:timezone});
}

export async function addManualExchangeRate(twdPerInr:string,note=''):Promise<string> {
  // PostgreSQL numeric receives a decimal string; never parseFloat().
  if(!/^(0|[1-9]\d*)(?:\.\d{1,8})?$/.test(twdPerInr))
    throw new Error('Invalid decimal exchange rate');
  return callRpc<string>('finance_add_manual_fx_rate',{
    p_twd_per_inr:twdPerInr,p_note:note
  });
}

export async function listManualExchangeRates():Promise<ManualFxRate[]> {
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_fx_rate_details')
    .select('*').order('recorded_at',{ascending:false});
  if(error) throw new Error(error.message);
  return (data??[]).map(r=>({
    id:r.id,twdPerInr:r.twd_per_inr,rateSource:'manual' as const,
    note:r.note,recordedAt:r.recorded_at
  }));
}

export async function saveMonthlyBudget(
  monthStart:ISODate,currency:Currency,amountMinor:MoneyMinor,
  fxRateId:string|null=null,expectedRevision:number|null=null
):Promise<string> {
  assertISODate(monthStart);
  if(!monthStart.endsWith('-01')) throw new Error('Choose the first of the budget month');
  return callRpc<string>('finance_upsert_monthly_budget',{
    p_month_start:monthStart,p_budget_currency:currency,
    p_budget_minor:minorBigInt(amountMinor).toString(),p_fx_rate_id:fxRateId,
    p_expected_revision:expectedRevision
  });
}

export async function listMonthlyBudgets():Promise<MonthlyBudget[]> {
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_budget_details')
    .select('*').order('month_start',{ascending:false});
  if(error) throw new Error(error.message);
  return (data??[]).map(r=>({
    id:r.id,monthStart:r.month_start,budgetMinor:exactMinor(r.budget_minor),
    budgetCurrency:r.budget_currency,fxRateId:r.fx_rate_id,
    fxTwdPerInr:r.fx_twd_per_inr,
    resolvedTwdMinor:exactMinor(r.resolved_twd_minor),revision:r.revision
  }));
}

export async function getMonthlySummary(monthStart:ISODate):Promise<MonthlySummary> {
  assertISODate(monthStart);
  if(!monthStart.endsWith('-01')) throw new Error('Invalid month start');
  const rows=await callRpc<Record<string,unknown>[]>('finance_monthly_summary',{
    p_month_start:monthStart
  });
  const row=rows?.[0];
  if(!row) throw new Error('Monthly finance summary unavailable');
  return {
    monthStart:String(row.month_start),budgetCurrency:(row.budget_currency??null) as Currency|null,
    budgetMinor:row.budget_minor==null?null:exactMinor(row.budget_minor),
    resolvedTwdMinor:row.resolved_twd_minor==null?null:exactMinor(row.resolved_twd_minor),
    actualExpenseMinor:exactMinor(row.actual_expense_minor),
    actualIncomeMinor:exactMinor(row.actual_income_minor),
    allocatedConsumptionMinor:exactMinor(row.allocated_consumption_minor)
  };
}

/** Future export route will use these owner-scoped readers, never raw service credentials. */
export async function financeExportSnapshot() {
  const [accounts,transactions,categories,budgets,fxRates,allocations]=await Promise.all([
    listFinanceAccounts(),listTransactions(true),listCategories(),
    listMonthlyBudgets(),listManualExchangeRates(),listAllocationDefinitions()
  ]);
  return {schemaVersion:1,exportedAt:new Date().toISOString(),manuallyTracked:true,
    accounts,transactions,categories,budgets,fxRates,allocations};
}


/** One owner-authenticated read model for the account detail screen. */
export async function listAccountOverviews():Promise<FinanceAccountOverview[]> {
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_account_overview').select('*');
  if(error) throw new Error(error.message);
  return (data??[]).map(r=>({
    accountId:r.account_id,
    openingTransactionId:r.opening_transaction_id,
    openingRevision:r.opening_revision,
    openingDate:r.opening_date,
    openingMinor:exactMinor(r.opening_minor),
    incomeMinor:exactMinor(r.income_minor),
    expenseMinor:exactMinor(r.expense_minor),
    netTransferMinor:exactMinor(r.net_transfer_minor),
    adjustmentMinor:exactMinor(r.adjustment_minor),
    lastActivityAt:r.last_activity_at,
    lastReconciledAt:r.last_reconciled_at,
  }));
}

export async function initializeOpeningBalances(entries:OpeningBalanceEntry[]):Promise<void> {
  if(!entries.length) throw new Error('No opening balances provided');
  if(new Set(entries.map(e=>e.accountId)).size!==entries.length)
    throw new Error('An account was included twice');
  entries.forEach(entry=>{
    if(minorBigInt(entry.amountMinor)<BigInt(0)) throw new Error('Opening balance cannot be negative');
    assertISODate(entry.effectiveDate);
  });
  await callRpc<unknown>('finance_initialize_openings',{p_entries:entries});
}

/** A single account's history, paginated at the database. Includes voided items for audit visibility. */
export async function listAccountActivity(accountId:string,offset=0,limit=20):Promise<AccountHistoryPage> {
  if(!/^[0-9a-f-]{36}$/i.test(accountId)) throw new Error('Invalid account ID');
  if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>100)
    throw new Error('Invalid history pagination');
  const client=await clientForOwner();
  const {data,error,count}=await client.from('finance_transaction_details')
    .select('*',{count:'exact'})
    .or('source_account_id.eq.'+accountId+',destination_account_id.eq.'+accountId)
    .order('txn_date',{ascending:false})
    .order('updated_at',{ascending:false})
    .range(offset,offset+limit-1);
  if(error) throw new Error(error.message);
  return {
    count:count??0,
    rows:(data??[]).map(r=>({
      id:r.id,kind:r.kind,amountMinor:exactMinor(r.amount_minor),currency:'TWD' as const,
      txnDate:r.txn_date,txnTime:r.txn_time,
      sourceAccountId:r.source_account_id,destinationAccountId:r.destination_account_id,
      categoryId:r.category_id,merchant:r.merchant,note:r.note,
      revision:r.revision,voidedAt:r.voided_at,createdAt:r.created_at,updatedAt:r.updated_at
    }))
  };
}
