import { minorBigInt } from './money';
import { percentLabel, roundedFraction, utilizationBasisPoints } from './budget-dashboard';
import { daysInMonth } from './budget';
import { assertISODate } from './allocations';
import { monthOffset } from './budget-dashboard';
import type { Currency, MoneyMinor } from './types';

export type AnalyticsPreset='current'|'previous'|'three'|'six'|'twelve'|'custom';
export type AnalyticsRange={from:string;to:string;denominatorDays:number;label:string;
 partial:boolean;fullSingleMonth:boolean};
export type AnalyticsGroup={id:string|null;code?:string|null;name:string|null;
 amountMinor:MoneyMinor;count:number};
export type AnalyticsMerchant={name:string|null;amountMinor:MoneyMinor;count:number};
export type AnalyticsOverview={
 from:string;to:string;expenseMinor:MoneyMinor;incomeMinor:MoneyMinor|null;
 expenseCount:number;largestMinor:MoneyMinor;firstTracked:string|null;
 categories:AnalyticsGroup[];merchants:AnalyticsMerchant[];
 accounts:AnalyticsGroup[];
};
export type AnalyticsMonth={
 monthStart:string;expenseMinor:MoneyMinor;incomeMinor:MoneyMinor|null;
 budgetMinor:MoneyMinor|null;originalBudgetMinor:MoneyMinor|null;
 budgetCurrency:Currency|null;coverage:'unknown'|'partial-start'|'recorded'|'future';
 expenseCount:number;
};
export type AnalyticsExpense={
 id:string;date:string;amountMinor:MoneyMinor;merchant:string;
 normalizedMerchant:string|null;categoryId:string|null;accountId:string|null;
};
export type AnalyticsFilters={accountId?:string|null;categoryId?:string|null;
 merchant?:string|null};

export function analyticsRange(preset:AnalyticsPreset,today:string,customFrom?:string,customTo?:string):AnalyticsRange{
 assertISODate(today);
 const month=today.slice(0,7)+'-01',end=monthOffset(month,1);
 let from=month,to=today,label='Current month to date';
 if(preset==='previous'){
   from=monthOffset(month,-1);
   to=shiftBackOneDay(month);
   label='Previous full month';
 }else if(preset==='three'||preset==='six'||preset==='twelve'){
   from=monthOffset(month,preset==='three'?-2:preset==='six'?-5:-11);
   label='Last '+(preset==='three'?'3':preset==='six'?'6':'12')+' months (current partial)';
 }else if(preset==='custom'){
   if(!customFrom||!customTo)throw new Error('Choose both custom dates');
   assertISODate(customFrom);assertISODate(customTo);
   from=customFrom;to=customTo;label='Custom date range';
 }else if(preset!=='current')throw new Error('Invalid analysis period');
 if(from>to||new Date(to+'T12:00:00Z').getTime()-new Date(from+'T12:00:00Z').getTime()>730*86400000)
   throw new Error('Select an ordered date range of at most 731 days');
 // A date range may include the future; do not treat it as observed cash-flow.
 const observedTo=to>today?today:to;
 const fromMs=new Date(from+'T12:00:00Z').getTime();
 const observedMs=new Date(observedTo+'T12:00:00Z').getTime();
 const days=observedTo>=from?Math.round((observedMs-fromMs)/86400000)+1:0;
 const single=from.slice(0,7)===to.slice(0,7)&&from.endsWith('-01')&&
   (to===shiftBackOneDay(end)||to===today);
 return {from,to,denominatorDays:days,label,
   partial:to>=today&&to<shiftBackOneDay(monthOffset(monthForDate(to),1)),
   fullSingleMonth:single};
}
function monthForDate(date:string){return date.slice(0,7)+'-01';}
function shiftBackOneDay(date:string):string{
 return new Date(new Date(date+'T12:00:00Z').getTime()-86400000).toISOString().slice(0,10);
}
export function averageActualPerDay(expenses:MoneyMinor,days:number):MoneyMinor|null{
 if(!Number.isSafeInteger(days)||days<0)throw new Error('Invalid elapsed days');
 return days?roundedFraction(expenses,days):null;
}
export function netCashFlow(expenses:MoneyMinor,income:MoneyMinor|null):MoneyMinor|null{
 return income===null?null:(minorBigInt(income)-minorBigInt(expenses)).toString();
}
export function budgetComparison(expenses:MoneyMinor,budget:MoneyMinor|null){
 if(budget===null)return {remainingMinor:null,utilization:null};
 return {remainingMinor:(minorBigInt(budget)-minorBigInt(expenses)).toString(),
   utilization:percentLabel(utilizationBasisPoints(expenses,budget))};
}

/** Largest remainder fixes display-percentage rounding, so group labels total 100.00%. */
export function sharesForGroups<T extends {amountMinor:MoneyMinor}>(groups:T[],total:MoneyMinor):string[]{
 const denominator=minorBigInt(total);
 if(denominator===BigInt(0))return groups.map(()=>'0.00%');
 const shares=groups.map((g,i)=>{
   const numerator=minorBigInt(g.amountMinor)*BigInt(10000);
   return {i,base:numerator/denominator,remainder:numerator%denominator};
 });
 let remaining=BigInt(10000)-shares.reduce((n,x)=>n+x.base,BigInt(0));
 if(remaining<BigInt(0)||remaining>BigInt(shares.length))
   throw new Error('Breakdown does not reconcile with actual spending');
 const sorted=[...shares].sort((a,b)=>a.remainder===b.remainder?a.i-b.i:
   a.remainder>b.remainder?-1:1);
 for(const s of sorted){
   if(remaining===BigInt(0))break;
   s.base++;remaining--;
 }
 const result=shares.sort((a,b)=>a.i-b.i);
 return result.map(s=>(s.base/BigInt(100)).toString()+'.'+
   (s.base%BigInt(100)).toString().padStart(2,'0')+'%');
}
export function sumGroupMoney(rows:{amountMinor:MoneyMinor}[]):MoneyMinor{
 return rows.reduce((n,r)=>n+minorBigInt(r.amountMinor),BigInt(0)).toString();
}
export function validateOverview(o:AnalyticsOverview){
 const expense=minorBigInt(o.expenseMinor);
 if(expense<BigInt(0)||o.expenseCount<0||!Number.isSafeInteger(o.expenseCount))
   throw new Error('Invalid financial analytics totals');
 for(const [name,rows] of [['category',o.categories],['merchant',o.merchants],['account',o.accounts]] as const){
   if(minorBigInt(sumGroupMoney(rows))!==expense)
     throw new Error(name+' totals do not reconcile with actual expenses');
   const count=rows.reduce((n,row)=>n+row.count,0);
   if(count!==o.expenseCount)throw new Error(name+' purchase count differs from ledger');
 }
}
export function monthStatus(m:AnalyticsMonth,today:string):string {
 if(m.coverage==='future')return 'Future month; no payments yet';
 if(m.coverage==='unknown')return 'Before first tracked record; unknown';
 if(m.coverage==='partial-start')return 'Tracking started partway through month';
 if(m.monthStart===monthForDate(today))return 'Current partial month';
 if(m.monthStart>monthForDate(today))return 'Future / not observed';
 return 'Recorded month (manual entries may be incomplete)';
}
/** Only project when 7+ days observed in a month whose first recorded transaction
 * predates the month. This is a linear estimate, never a predicted future debit. */
export function monthEndProjection(args:{
 today:string;monthStart:string;firstTracked:string|null;actualMinor:MoneyMinor;
}):MoneyMinor|null{
 const {today,monthStart,firstTracked,actualMinor}=args;
 assertISODate(today);assertISODate(monthStart);
 if(monthForDate(today)!==monthStart||!firstTracked||firstTracked>monthStart)
   return null;
 const elapsed=Number(today.slice(8,10));
 if(elapsed<7)return null;
 return roundedFraction((minorBigInt(actualMinor)*BigInt(daysInMonth(monthStart))).toString(),elapsed);
}
export function analyticsInsights(o:AnalyticsOverview,budgetMinor:MoneyMinor|null,
 period:AnalyticsRange):string[]{
 const insights:string[]=[];
 if(o.firstTracked===null||o.firstTracked>period.from)
   insights.push('History begins during or after this period. Recorded totals may be incomplete.');
 if(o.expenseCount===0){
   insights.push('No expense transactions recorded for this selection.');
   return insights;
 }
 if(o.categories.length){
   const top=o.categories[0];
   insights.push((top.name||'Uncategorized')+' is your largest recorded expense category ('+
     sharesForGroups(o.categories,o.expenseMinor)[0]+').');
 }
 if(budgetMinor!==null&&period.fullSingleMonth){
   const remaining=minorBigInt(budgetMinor)-minorBigInt(o.expenseMinor);
   insights.push(remaining<BigInt(0)?
     'Actual expenses exceed this month’s budget.':
     'Recorded actual expenses are within this month’s budget.');
 }
 return insights.slice(0,3);
}
