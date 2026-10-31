import { requireClient } from '@/lib/learning';
import { assertISODate } from './allocations';
import { minorBigInt } from './money';
import { validateOverview, type AnalyticsOverview,type AnalyticsMonth,
  type AnalyticsExpense,type AnalyticsFilters } from './analytics-model';

async function analyticsRpc<T>(name:string,args:Record<string,unknown>):Promise<T>{
 const client=requireClient();
 const {data:{user},error:authError}=await client.auth.getUser();
 if(authError||!user)throw new Error('Sign in to view your private finance analytics');
 const {data,error}=await client.rpc(name,args);
 if(error)throw new Error(error.message);
 return data as T;
}
function money(value:unknown):string{
 if(typeof value!=='string')throw new Error('Finance analytics returned an unsafe amount');
 return minorBigInt(value).toString();
}
function optionalMoney(value:unknown):string|null{
 return value==null?null:money(value);
}
function safeCount(value:unknown):number{
 const n=Number(value);
 if(!Number.isSafeInteger(n)||n<0)throw new Error('Analytics returned an invalid count');
 return n;
}
function filtersArgs(filters:AnalyticsFilters){
 if(filters.merchant&&filters.merchant.length>200)throw new Error('Merchant filter is too long');
 return {p_account_id:filters.accountId||null,p_category_id:filters.categoryId||null,
   p_merchant:filters.merchant??null};
}
function dates(from:string,to:string){
 assertISODate(from);assertISODate(to);
 if(from>to)throw new Error('Start date must not be after end date');
}
type OverviewRaw=Record<string,unknown> & {
 categories?:Record<string,unknown>[];merchants?:Record<string,unknown>[];
 accounts?:Record<string,unknown>[];
};
export async function getFinanceAnalyticsOverview(
 from:string,to:string,filters:AnalyticsFilters={}
):Promise<AnalyticsOverview>{
 dates(from,to);
 const raw=await analyticsRpc<OverviewRaw>('finance_analytics_overview',{
   p_from:from,p_to:to,...filtersArgs(filters)
 });
 if(!raw||typeof raw!=='object')throw new Error('Analytics summary unavailable');
 const out:AnalyticsOverview={
   from:String(raw.from),to:String(raw.to),
   expenseMinor:money(raw.expenseMinor),incomeMinor:optionalMoney(raw.incomeMinor),
   expenseCount:safeCount(raw.expenseCount),largestMinor:money(raw.largestMinor),
   firstTracked:raw.firstTracked==null?null:String(raw.firstTracked),
   categories:(raw.categories??[]).map(r=>({
     id:r.id==null?null:String(r.id),code:r.code==null?null:String(r.code),
     name:r.name==null?null:String(r.name),
     amountMinor:money(r.amountMinor),count:safeCount(r.count)
   })),
   merchants:(raw.merchants??[]).map(r=>({
     name:r.name==null?null:String(r.name),
     amountMinor:money(r.amountMinor),count:safeCount(r.count)
   })),
   accounts:(raw.accounts??[]).map(r=>({
     id:r.id==null?null:String(r.id),name:r.name==null?null:String(r.name),
     amountMinor:money(r.amountMinor),count:safeCount(r.count)
   }))
 };
 if(out.from!==from||out.to!==to)throw new Error('Analytics response date mismatch');
 validateOverview(out);
 return out;
}
export async function listFinanceAnalyticsMonths(
 startMonth:string,count:number,filters:AnalyticsFilters={}
):Promise<AnalyticsMonth[]>{
 assertISODate(startMonth);
 if(!startMonth.endsWith('-01')||!Number.isInteger(count)||count<1||count>12)
   throw new Error('Invalid analytics month selection');
 const rows=await analyticsRpc<Record<string,unknown>[]>('finance_analytics_months',{
   p_start:startMonth,p_count:count,...filtersArgs(filters)
 });
 if(!Array.isArray(rows)||rows.length!==count)
   throw new Error('Monthly history response incomplete');
 return rows.map(r=>{
   const coverage=String(r.coverage);
   if(!['unknown','partial-start','recorded','future'].includes(coverage))
     throw new Error('Invalid tracking coverage');
   return {
     monthStart:String(r.month_start),expenseMinor:money(r.expense_minor),
     incomeMinor:optionalMoney(r.income_minor),budgetMinor:optionalMoney(r.budget_minor),
     originalBudgetMinor:optionalMoney(r.original_budget_minor),
     budgetCurrency:r.budget_currency==null?null:r.budget_currency as 'TWD'|'INR',
     expenseCount:safeCount(r.expense_count),
     coverage:coverage as AnalyticsMonth['coverage']
   };
 });
}
export async function listFinanceAnalyticsExpenses(
 from:string,to:string,filters:AnalyticsFilters={},offset=0,limit=15
):Promise<{rows:AnalyticsExpense[];hasMore:boolean}>{
 dates(from,to);
 if(!Number.isSafeInteger(offset)||offset<0 || !Number.isInteger(limit)||limit<1||limit>99)
   throw new Error('Invalid drilldown page');
 const rows=await analyticsRpc<Record<string,unknown>[]>('finance_analytics_expenses',{
   p_from:from,p_to:to,...filtersArgs(filters),p_offset:offset,p_limit:limit+1
 });
 if(!Array.isArray(rows))throw new Error('Expense history unavailable');
 return {hasMore:rows.length>limit,rows:rows.slice(0,limit).map(r=>({
   id:String(r.transaction_id),date:String(r.txn_date),amountMinor:money(r.amount_minor),
   merchant:String(r.merchant??''),normalizedMerchant:r.normalized_merchant==null?
     null:String(r.normalized_merchant),categoryId:r.category_id==null?null:String(r.category_id),
   accountId:r.source_account_id==null?null:String(r.source_account_id)
 }))};
}


export type AnalyticsDaily={
 date:string;actualMinor:string;consumptionMinor:string;groceryAllocatedMinor:string;
};
export async function listFinanceAnalyticsDaily(
 monthStart:string,filters:AnalyticsFilters={}
):Promise<AnalyticsDaily[]>{
 assertISODate(monthStart);
 if(!monthStart.endsWith('-01'))throw new Error('Invalid analytics month');
 const rows=await analyticsRpc<Record<string,unknown>[]>('finance_analytics_daily',{
   p_month_start:monthStart,...filtersArgs(filters)
 });
 if(!Array.isArray(rows)||rows.length<28||rows.length>31)
   throw new Error('Daily analytics response incomplete');
 return rows.map(r=>({
   date:String(r.day_date),actualMinor:money(r.actual_minor),
   consumptionMinor:money(r.consumption_minor),
   groceryAllocatedMinor:money(r.grocery_allocated_minor)
 }));
}
