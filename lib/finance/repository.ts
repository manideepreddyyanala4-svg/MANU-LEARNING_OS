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


export type FinanceHistoryFilters = {
  search?: string;
  kind?: string;
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  oldestFirst?: boolean;
  offset?: number;
  limit?: number;
};

export type FinanceHistoryPage = { rows: FinanceTransaction[]; count: number };

/** Server-paginated, authenticated transaction history. Never load the entire ledger for display. */
export async function listFinanceHistory(filters: FinanceHistoryFilters = {}): Promise<FinanceHistoryPage> {
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 20;
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100)
    throw new Error('Invalid history page');
  if (filters.fromDate) assertISODate(filters.fromDate);
  if (filters.toDate) assertISODate(filters.toDate);
  if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate)
    throw new Error('Start date must not be after end date');
  const client = await clientForOwner();
  let query = client.from('finance_transaction_details')
    .select('*', {count:'exact'});
  if (filters.kind && filters.kind !== 'all') query = query.eq('kind', filters.kind);
  if (filters.categoryId && filters.categoryId !== 'all') query = query.eq('category_id', filters.categoryId);
  if (filters.accountId && filters.accountId !== 'all') {
    if (!/^[0-9a-f-]{36}$/i.test(filters.accountId)) throw new Error('Invalid account filter');
    query = query.or('source_account_id.eq.'+filters.accountId+',destination_account_id.eq.'+filters.accountId);
  }
  if (filters.fromDate) query = query.gte('txn_date', filters.fromDate);
  if (filters.toDate) query = query.lte('txn_date', filters.toDate);
  const search = (filters.search ?? '').trim();
  if (search.length > 100) throw new Error('Search is too long');
  // PostgREST .ilike sends a parameterized pattern instead of interpolating filter expressions.
  if (search) query = query.ilike('merchant', '%'+search.replace(/[%_\\]/g, '\\$&')+'%');
  const ascending = Boolean(filters.oldestFirst);
  const {data,error,count} = await query
    .order('txn_date',{ascending})
    .order('created_at',{ascending})
    .order('id',{ascending})
    .range(offset,offset+limit-1);
  if(error) throw new Error(error.message);
  return {count:count??0,rows:(data??[]).map(r=>({
    id:r.id,kind:r.kind,amountMinor:exactMinor(r.amount_minor),currency:'TWD' as const,
    txnDate:r.txn_date,txnTime:r.txn_time,sourceAccountId:r.source_account_id,
    destinationAccountId:r.destination_account_id,categoryId:r.category_id,
    merchant:r.merchant,note:r.note,revision:r.revision,voidedAt:r.voided_at,
    createdAt:r.created_at,updatedAt:r.updated_at
  }))};
}

export interface PlannedFinanceEntry {
  id:string; kind:'income'|'expense'; amountMinor:MoneyMinor; dueDate:ISODate;
  accountId:string; categoryId:string|null; merchant:string; note:string;
  status:'planned'|'cancelled'|'posted'; revision:number;
  allocationRules:GroceryRule[];
  postedTransactionId:string|null; createdAt:string; updatedAt:string;
}
export type PlannedFinanceCommand = {
  idempotencyKey:string; kind:'income'|'expense'; amountMinor:MoneyMinor;
  dueDate:ISODate; accountId:string; categoryId?:string|null;
  merchant:string; note:string; planId?:string; expectedRevision?:number;
  cancel?:boolean;
};

export async function listFinancePlans(offset=0,limit=20):Promise<{rows:PlannedFinanceEntry[];count:number}> {
  if(!Number.isSafeInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>100)
    throw new Error('Invalid scheduled entry page');
  const client=await clientForOwner();
  const {data,error,count}=await client.from('finance_plan_details')
    .select('*',{count:'exact'}).order('due_date',{ascending:true})
    .order('created_at',{ascending:false}).range(offset,offset+limit-1);
  if(error)throw new Error(error.message);
  return {count:count??0,rows:(data??[]).map(r=>({
    id:r.id,kind:r.kind,amountMinor:exactMinor(r.amount_minor),
    dueDate:r.due_date,accountId:r.account_id,categoryId:r.category_id,
    merchant:r.merchant,note:r.note,status:r.status,revision:r.revision,
    allocationRules:(r.allocation_rules??[]).map((a:Record<string,unknown>)=>({
      itemName:String(a.itemName??''),categoryId:a.categoryId?String(a.categoryId):null,
      amountMinor:exactMinor(a.amountMinor),startDate:String(a.startDate),
      durationDays:Number(a.durationDays)
    })),
    postedTransactionId:r.posted_transaction_id,createdAt:r.created_at,updatedAt:r.updated_at
  }))};
}

export async function saveFinancePlan(command:PlannedFinanceCommand):Promise<string> {
  assertISODate(command.dueDate);
  const amountMinor=minorBigInt(command.amountMinor).toString();
  if(!command.cancel && BigInt(amountMinor)<=BigInt(0))throw new Error('Amount must be positive');
  return callRpc<string>('finance_upsert_plan',{
    p_operation_key:command.idempotencyKey,p_kind:command.kind,p_amount_minor:amountMinor,
    p_due_date:command.dueDate,p_account_id:command.accountId,
    p_category_id:command.categoryId??null,p_merchant:command.merchant,p_note:command.note,
    p_plan_id:command.planId??null,p_expected_revision:command.expectedRevision??null,
    p_cancel:command.cancel??false
  });
}

export async function postFinancePlan(planId:string,revision:number,key:string):Promise<string> {
  return callRpc<string>('finance_post_plan',{
    p_operation_key:key,p_plan_id:planId,p_expected_revision:revision
  });
}


/** Budget reads remain owner-scoped; no financial mutation or local ledger cache. */
export async function getFinanceBudgetPreferences(): Promise<{
  timezone:string; displayCurrency:Currency; currentFxRateId:string|null
}> {
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_preferences')
    .select('timezone,display_currency,current_fx_rate_id').maybeSingle();
  if(error)throw new Error(error.message);
  if(!data)throw new Error('Finance preferences are not initialized');
  return {timezone:data.timezone,displayCurrency:data.display_currency as Currency,
    currentFxRateId:data.current_fx_rate_id};
}

/** A selected month's immutable saved rate snapshot and editable revision. */
export async function getBudgetForMonth(monthStart:ISODate):Promise<MonthlyBudget|null> {
  assertISODate(monthStart);
  if(!monthStart.endsWith('-01'))throw new Error('Invalid selected month');
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_budget_details').select('*')
    .eq('month_start',monthStart).maybeSingle();
  if(error)throw new Error(error.message);
  return data?{
    id:data.id,monthStart:data.month_start,budgetMinor:exactMinor(data.budget_minor),
    budgetCurrency:data.budget_currency,fxRateId:data.fx_rate_id,
    fxTwdPerInr:data.fx_twd_per_inr,
    resolvedTwdMinor:exactMinor(data.resolved_twd_minor),revision:data.revision
  }:null;
}

/** Exactly 28–31 daily rows, including prior-month grocery commitments. */
export async function getBudgetDailyRows(monthStart:ISODate):Promise<
  import('./budget-dashboard').BudgetDailyRow[]
> {
  assertISODate(monthStart);
  if(!monthStart.endsWith('-01'))throw new Error('Invalid selected month');
  const data=await callRpc<Record<string,unknown>[]>('finance_daily_budget',{
    p_month_start:monthStart
  });
  return (data??[]).map(row=>({
    date:String(row.day_date),
    actualMinor:exactMinor(row.actual_expense_minor),
    allocatedMinor:exactMinor(row.allocated_cost_minor)
  }));
}


/** Scheduled grocery purchase, including validated allocation definitions.
 * The plan does not debit the account until explicitly posted on/after its date.
 */
export async function saveAllocatedFinancePlan(command:PlannedFinanceCommand & {
  allocations:GroceryRule[];
}):Promise<string> {
  if(command.kind!=='expense' || command.cancel)throw new Error('Only grocery purchase schedules use this action');
  assertISODate(command.dueDate);
  const amountMinor=minorBigInt(command.amountMinor).toString();
  if(minorBigInt(amountMinor)<=BigInt(0))throw new Error('Purchase must be positive');
  const rules=command.allocations.map(a=>{
    assertISODate(a.startDate);
    if(!Number.isInteger(a.durationDays)||a.durationDays<1||a.durationDays>3650)
      throw new Error('Invalid allocation duration');
    if(minorBigInt(a.amountMinor)<=BigInt(0))
      throw new Error('Invalid allocation amount');
    return {itemName:a.itemName??'',amountMinor:minorBigInt(a.amountMinor).toString(),
      startDate:a.startDate,durationDays:a.durationDays,categoryId:a.categoryId??null};
  });
  const allocated=rules.reduce((sum,a)=>sum+minorBigInt(a.amountMinor),BigInt(0));
  if(rules.length&&allocated!==minorBigInt(amountMinor))
    throw new Error('Allocated item amounts do not equal purchase total');
  return callRpc<string>('finance_upsert_allocated_plan',{
    p_operation_key:command.idempotencyKey,p_amount_minor:amountMinor,
    p_due_date:command.dueDate,p_account_id:command.accountId,
    p_category_id:command.categoryId??null,p_merchant:command.merchant,
    p_note:command.note,p_plan_id:command.planId??null,
    p_expected_revision:command.expectedRevision??null,p_allocations:rules
  });
}

export interface FinanceDayCost {
  transactionId:string;
  merchant:string;
  purchaseDate:ISODate;
  categoryId:string|null;
  itemName:string;
  amountMinor:MoneyMinor;
  attributionType:'single'|'allocated';
}

/** A single day, no entire-history scan in the browser. */
export async function listDayCostBreakdown(
  date:ISODate,offset=0,limit=25
):Promise<FinanceDayCost[]> {
  assertISODate(date);
  if(!Number.isSafeInteger(offset)||offset<0||
    !Number.isSafeInteger(limit)||limit<1||limit>100)
    throw new Error('Invalid daily breakdown page');
  const data=await callRpc<Record<string,unknown>[]>('finance_day_cost_breakdown',{
    p_day:date,p_limit:limit,p_offset:offset
  });
  return (data??[]).map(r=>({
    transactionId:String(r.transaction_id),
    merchant:String(r.merchant??''),purchaseDate:String(r.txn_date),
    categoryId:r.category_id?String(r.category_id):null,
    itemName:String(r.item_name??''),amountMinor:exactMinor(r.amount_minor),
    attributionType:r.attribution_type as 'single'|'allocated'
  }));
}


/** Full owner-protected transaction details for a clicked daily allocation. */
export async function getFinanceTransaction(transactionId:string):Promise<FinanceTransaction> {
  if(!/^[0-9a-f-]{36}$/i.test(transactionId))throw new Error('Invalid transaction ID');
  const client=await clientForOwner();
  const {data,error}=await client.from('finance_transaction_details').select('*')
    .eq('id',transactionId).maybeSingle();
  if(error)throw new Error(error.message);
  if(!data)throw new Error('Purchase not found or unavailable');
  return {
    id:data.id,kind:data.kind,amountMinor:exactMinor(data.amount_minor),currency:'TWD',
    txnDate:data.txn_date,txnTime:data.txn_time,sourceAccountId:data.source_account_id,
    destinationAccountId:data.destination_account_id,categoryId:data.category_id,
    merchant:data.merchant,note:data.note,revision:data.revision,voidedAt:data.voided_at,
    createdAt:data.created_at,updatedAt:data.updated_at
  };
}


/** Server aggregates one calendar month and selected filters, always owner-scoped.
 * Filters affect only the displayed partial totals, never the authoritative budget.
 */
export type FinanceCalendarFilters = {
  accountId?:string|null;categoryId?:string|null;spendingType?:'all'|'groceries'|'other';
};
export type FinanceCalendarDay = {
  date:ISODate;cashMinor:MoneyMinor;consumptionMinor:MoneyMinor;
  groceryMinor:MoneyMinor;ordinaryMinor:MoneyMinor;allocationCount:number;
};
function filterArgs(filter:FinanceCalendarFilters){
  return {p_account_id:filter.accountId||null,p_category_id:filter.categoryId||null,
    p_spending_type:filter.spendingType??'all'};
}
export async function listFinanceCalendarDays(
  monthStart:ISODate,filters:FinanceCalendarFilters={}
):Promise<FinanceCalendarDay[]> {
  assertISODate(monthStart);
  if(!monthStart.endsWith('-01'))throw new Error('Select the first date of a month');
  const rows=await callRpc<Record<string,unknown>[]>('finance_calendar_days',{
    p_month_start:monthStart,...filterArgs(filters)
  });
  return (rows??[]).map(r=>({
    date:String(r.day_date),cashMinor:exactMinor(r.filtered_cash_minor),
    consumptionMinor:exactMinor(r.filtered_consumption_minor),
    groceryMinor:exactMinor(r.allocated_grocery_minor),
    ordinaryMinor:exactMinor(r.ordinary_minor),
    allocationCount:Number(r.allocation_count)
  }));
}
export type FinanceCalendarLine = {
  transactionId:string;merchant:string;txnDate:ISODate;accountId:string|null;
  categoryId:string|null;itemName:string;amountMinor:MoneyMinor;
  kind:'payment'|'single'|'allocated';allocationStart:ISODate|null;
  durationDays:number|null;
};
export async function listFinanceCalendarDayDetails(
  day:ISODate,view:'cash'|'consumption',filters:FinanceCalendarFilters={},
  offset=0,limit=30
):Promise<{rows:FinanceCalendarLine[];hasMore:boolean}> {
  assertISODate(day);
  if(!Number.isSafeInteger(offset)||offset<0 || !Number.isSafeInteger(limit)
    ||limit<1||limit>99)throw new Error('Invalid calendar timeline page');
  const rows=await callRpc<Record<string,unknown>[]>('finance_calendar_day_details',{
    p_day:day,p_view:view,...filterArgs(filters),
    p_limit:limit+1,p_offset:offset
  });
  const list=rows??[];
  return {hasMore:list.length>limit,rows:list.slice(0,limit).map(r=>({
    transactionId:String(r.transaction_id),merchant:String(r.merchant??''),
    txnDate:String(r.txn_date),accountId:r.source_account_id?String(r.source_account_id):null,
    categoryId:r.category_id?String(r.category_id):null,
    itemName:String(r.item_name??''),amountMinor:exactMinor(r.amount_minor),
    kind:r.attribution_type as FinanceCalendarLine['kind'],
    allocationStart:r.allocation_start?String(r.allocation_start):null,
    durationDays:r.duration_days==null?null:Number(r.duration_days)
  }))};
}
