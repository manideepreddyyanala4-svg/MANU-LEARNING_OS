'use client';

import { useCallback,useEffect,useMemo,useRef,useState } from 'react';
import { Activity,BarChart3,CalendarDays,ChevronLeft,ChevronRight,
  CircleAlert,Pencil,RefreshCw,TrendingUp,Utensils } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatMoney,minorBigInt } from '@/lib/finance/money';
import { monthOffset,percentLabel,roundedFraction,
  todayInFinanceTimezone,utilizationBasisPoints } from '@/lib/finance/budget-dashboard';
import { analyticsInsights,analyticsRange,averageActualPerDay,budgetComparison,
  monthEndProjection,monthStatus,netCashFlow,sharesForGroups,
  type AnalyticsPreset,type AnalyticsRange,type AnalyticsOverview,
  type AnalyticsMonth,type AnalyticsFilters } from '@/lib/finance/analytics-model';
import { getFinanceAnalyticsOverview,listFinanceAnalyticsMonths,
  listFinanceAnalyticsDaily,listFinanceAnalyticsExpenses,
  type AnalyticsDaily } from '@/lib/finance/analytics-repository';
import { getBudgetForMonth,getFinanceBudgetPreferences,listFinanceAccounts,
  listCategories,listFinanceCalendarDays,type FinanceCalendarDay } from '@/lib/finance/repository';
import { formatFinanceDate } from '@/lib/finance/dates';
import { shiftCalendarDay } from '@/lib/finance/allocations';
import type { FinanceAccount,FinanceCategory,MonthlyBudget } from '@/lib/finance/types';
import type { AnalyticsExpense } from '@/lib/finance/analytics-model';

const field='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)]';
const label='block space-y-1 text-xs font-semibold text-[var(--fg)]';
const action='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-xs font-bold text-[var(--fg)] disabled:opacity-50';
const num=(v:string)=>formatMoney(v,'TWD');
const fail=(e:unknown)=>e instanceof Error?e.message:'Analytics unavailable';
const thisMonth=(today:string)=>today.slice(0,7)+'-01';
const nameMonth=(month:string)=>new Intl.DateTimeFormat('en-US',{year:'numeric',month:'short',timeZone:'UTC'}).format(new Date(month+'T12:00:00Z'));
const noFilters=(f:AnalyticsFilters)=>!f.accountId&&!f.categoryId&&!f.merchant;
function percentBar(amount:string,total:string){
 const n=minorBigInt(amount),d=minorBigInt(total);
 return d<=BigInt(0)?0:Number((n*BigInt(100))/d);
}
type Bundle={
 overview:AnalyticsOverview;merchantOptions:{name:string|null}[];
 months:AnalyticsMonth[];daily:AnalyticsDaily[];budget:MonthlyBudget|null;
 accounts:FinanceAccount[];categories:FinanceCategory[];groceries:AnalyticsOverview;
 upcoming:FinanceCalendarDay[];timezone:string;
};

export function FinanceAnalytics(){
 const [today,setToday]=useState(()=>todayInFinanceTimezone('Asia/Taipei'));
 const [preset,setPreset]=useState<AnalyticsPreset>('current');
 const [customFrom,setCustomFrom]=useState(()=>thisMonth(todayInFinanceTimezone('Asia/Taipei')));
 const [customTo,setCustomTo]=useState(()=>todayInFinanceTimezone('Asia/Taipei'));
 const [filters,setFilters]=useState<AnalyticsFilters>({accountId:null,categoryId:null,merchant:null});
 const [cashView,setCashView]=useState<'consumption'|'cash'>('consumption');
 const [trendCount,setTrendCount]=useState(12);
 const [data,setData]=useState<Bundle|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [refreshKey,setRefreshKey]=useState(0);
 const [projectionOpen,setProjectionOpen]=useState(false);
 const [drillOpen,setDrillOpen]=useState(false);
 const [drillOffset,setDrillOffset]=useState(0);
 const [drillRows,setDrillRows]=useState<AnalyticsExpense[]>([]);
 const [drillMore,setDrillMore]=useState(false);
 const [drillLoading,setDrillLoading]=useState(false);
 const [drillError,setDrillError]=useState('');
 const request=useRef(0),drillRequest=useRef(0);

 const period=useMemo(()=>{
   try{return {value:analyticsRange(preset,today,customFrom,customTo),error:''};}
   catch(e){return {value:null,error:fail(e)};}
 },[preset,today,customFrom,customTo]);
 const currentRange=period.value;
 const trendEnd=useMemo(()=>thisMonth(currentRange?.to??today),[currentRange,today]);
 const trendStart=useMemo(()=>monthOffset(trendEnd,1-trendCount),[trendEnd,trendCount]);

 const read=useCallback(async()=>{
   if(!currentRange){setData(null);setError(period.error);setLoading(false);return;}
   const token=++request.current;setLoading(true);setError('');
   try{
     const dailyMonth=trendEnd;
     const [prefs,overview,options,months,daily,budget,accounts,categories,groceries,upcoming]=await Promise.all([
       getFinanceBudgetPreferences(),
       getFinanceAnalyticsOverview(currentRange.from,currentRange.to,filters),
       filters.merchant?getFinanceAnalyticsOverview(currentRange.from,currentRange.to,{
         ...filters,merchant:null}):getFinanceAnalyticsOverview(currentRange.from,currentRange.to,filters),
       listFinanceAnalyticsMonths(trendStart,trendCount,filters),
       listFinanceAnalyticsDaily(dailyMonth,filters),
       currentRange.fullSingleMonth?getBudgetForMonth(thisMonth(currentRange.from)):
         Promise.resolve(null),
       listFinanceAccounts(),listCategories(),
       getFinanceAnalyticsOverview(currentRange.from,currentRange.to,{
         ...filters,categoryId:null,merchant:null
       }).then(g=>g),
       Promise.all([
         listFinanceCalendarDays(thisMonth(today)),
         listFinanceCalendarDays(monthOffset(thisMonth(today),1))
       ]).then(([a,b])=>[...a,...b])
     ]);
     if(token!==request.current)return;
     const newToday=todayInFinanceTimezone(prefs.timezone);
     if(newToday!==today){setToday(newToday);return;}
     const grocerySubset=groceries.categories.some(c=>c.code==='groceries');
     setData({
       overview,merchantOptions:options.merchants,months,daily,budget,accounts,categories,
       groceries:grocerySubset?groceries:groceries,upcoming,timezone:prefs.timezone
     });
   }catch(e){if(token===request.current){setError(fail(e));setData(null);}}
   finally{if(token===request.current)setLoading(false);}
 },[currentRange,filters,period.error,trendEnd,trendStart,trendCount,today]);
 useEffect(()=>{
   const timer=window.setTimeout(()=>{void read();},0);
   const changed=()=>{void read();};
   window.addEventListener('manuos:finance-changed',changed);
   return ()=>{window.clearTimeout(timer);request.current++;
     window.removeEventListener('manuos:finance-changed',changed);};
 },[read,refreshKey]);

 useEffect(()=>{
   const id=++drillRequest.current;
   if(!drillOpen||!currentRange||!data)return;
   const timer=window.setTimeout(async()=>{
     setDrillLoading(true);setDrillError('');
     try{
       const res=await listFinanceAnalyticsExpenses(currentRange.from,currentRange.to,
         filters,drillOffset,15);
       if(id!==drillRequest.current)return;
       setDrillRows(res.rows);setDrillMore(res.hasMore);
     }catch(e){if(id===drillRequest.current){setDrillError(fail(e));setDrillRows([]);}}
     finally{if(id===drillRequest.current)setDrillLoading(false);}
   },0);
   return ()=>{window.clearTimeout(timer);drillRequest.current++;};
 },[drillOpen,currentRange,filters,drillOffset,data]);

 const overview=data?.overview;
 const income=overview?.incomeMinor??null;
 const net=overview?netCashFlow(overview.expenseMinor,income):null;
 const budgetEligible=Boolean(currentRange?.fullSingleMonth&&
   currentRange.to<=today&&noFilters(filters));
 const budget=budgetEligible?data?.budget??null:null;
 const budgetResult=overview?budgetComparison(overview.expenseMinor,budget?.resolvedTwdMinor??null):null;
 const avg=overview&&currentRange?averageActualPerDay(overview.expenseMinor,currentRange.denominatorDays):null;
 const categories=overview?.categories??[];
 const categoryShares=overview?sharesForGroups(categories,overview.expenseMinor):[];
 const merchantShares=overview?sharesForGroups(overview.merchants,overview.expenseMinor):[];
 const accountShares=overview?sharesForGroups(overview.accounts,overview.expenseMinor):[];
 const topCategory=categories[0];
 const grocery=categories.find(c=>c.code==='groceries');
 const outside=categories.find(c=>c.code==='outside-food');
 const groceryForMerchants=data?.groceries.categories.find(c=>c.code==='groceries');
 const groceryVendorDetails=data?.groceries.merchants??[];
 const groceryDaily=data?.daily.reduce((n,d)=>n+minorBigInt(d.groceryAllocatedMinor),BigInt(0)).toString()??'0';
 const rolling=data?.upcoming.filter(r=>r.date>today&&r.date<=shiftCalendarDay(today,7)
   &&minorBigInt(r.groceryMinor)>BigInt(0))??[];
 const currentTrend=trendEnd===thisMonth(today);
 const projected=overview&&currentRange&&preset==='current'&&noFilters(filters)?
   monthEndProjection({today,monthStart:thisMonth(today),firstTracked:overview.firstTracked,
     actualMinor:overview.expenseMinor}):null;
 const insightTexts=overview&&currentRange?analyticsInsights(overview,
   budget?.resolvedTwdMinor??null,currentRange):[];
 const maxMonth=(data?.months??[]).reduce((m,row)=>{
   const value=minorBigInt(row.expenseMinor);
   return value>m?value:m;
 },BigInt(1)).toString();
 const maxDay=(data?.daily??[]).reduce((m,row)=>{
   const value=minorBigInt(cashView==='cash'?row.actualMinor:row.consumptionMinor);
   return value>m?value:m;
 },BigInt(1)).toString();

 function focusTransactions(){
   setDrillOffset(0);setDrillOpen(true);
   window.setTimeout(()=>document.getElementById('finance-analytics-drilldown')?.
     scrollIntoView({behavior:'smooth',block:'start'}),50);
 }
 function reviewExpense(id:string){
   window.dispatchEvent(new CustomEvent('manuos:finance-edit-transaction',{detail:{id}}));
   document.getElementById('finance-transactions')?.scrollIntoView({behavior:'smooth'});
 }
 function chooseFilter(next:AnalyticsFilters){
   setFilters(next);setDrillOffset(0);setDrillOpen(false);setData(null);
 }
 const metrics=[
   ['Actual expenses',overview?.expenseMinor==null?'—':num(overview.expenseMinor),
     'Real posted payments, excluding transfers'],
   ['Recorded income',overview?income===null?'Not comparable':num(income):'—',
     income===null?'Merchant/category filters do not apply to income':'Includes refunds recorded as income'],
   ['Net cash flow',overview?net===null?'Not comparable':num(net):'—',
     'Income minus expense; not account balance'],
   ['Monthly budget',data?(budget?formatMoney(budget.budgetMinor,budget.budgetCurrency):
     'Not compared'):'—','Only a single full or current-to-date month, unfiltered'],
   ['Budget remaining',budgetResult?.remainingMinor==null?'Not compared':
     num(budgetResult.remainingMinor),'Budget minus posted expenses; not savings'],
   ['Budget utilization',budgetResult?.utilization??'Not compared',
     'Based on frozen saved budget conversion to TWD'],
   ['Daily average (actual)',avg===null?'—':num(avg),
     (currentRange?.denominatorDays??0)+' observed calendar days in selected range'],
   ['Top expense category',topCategory?.name??(topCategory?'Uncategorized':'No spending'),
     'Ranked by actual paid expense amount'],
   ['Largest purchase',overview?num(overview.largestMinor):'—',
     'Largest single active expense in selection'],
   ['Expense transactions',overview?String(overview.expenseCount):'—',
     'Counts purchases, not allocation days']
 ];
 return <section id="finance-analytics" className="mt-8 scroll-mt-20 space-y-5" aria-label="Finance analytics">
   <div className="flex flex-wrap items-start justify-between gap-3">
     <div>
       <h2 className="text-xl font-extrabold text-[var(--fg)]">
         <BarChart3 size={21} className="mr-2 inline"/> Spending analytics</h2>
       <p className="mt-1 text-sm text-[var(--muted)]">
         What you actually paid, where it went, and how grocery costs spread across days.
       </p>
     </div>
     <button className={action} type="button" disabled={loading} onClick={()=>setRefreshKey(x=>x+1)}>
       <RefreshCw size={15}/> Refresh</button>
   </div>
   <Card>
     <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
       <label className={label}>Period
         <select className={field} value={preset} onChange={e=>setPreset(e.target.value as AnalyticsPreset)}>
           <option value="current">Current month</option><option value="previous">Previous month</option>
           <option value="three">Last 3 months</option><option value="six">Last 6 months</option>
           <option value="twelve">Last 12 months</option><option value="custom">Custom range</option>
         </select>
       </label>
       <label className={label}>Payment account
         <select className={field} value={filters.accountId??''}
           onChange={e=>chooseFilter({...filters,accountId:e.target.value||null})}>
           <option value="">All accounts</option>
           {data?.accounts.map(a=><option key={a.accountId} value={a.accountId}>{a.name}</option>)}
         </select>
       </label>
       <label className={label}>Expense category
         <select className={field} value={filters.categoryId??''}
           onChange={e=>chooseFilter({...filters,categoryId:e.target.value||null})}>
           <option value="">All categories</option>
           {data?.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
       </label>
       <label className={label}>Merchant
         <select className={field} value={filters.merchant??''}
           onChange={e=>chooseFilter({...filters,merchant:e.target.value||null})}>
           <option value="">All merchants</option>
           {data?.merchantOptions.filter(x=>x.name!==null).map(x=>
             <option key={x.name!} value={x.name!}>{x.name}</option>)}
         </select>
       </label>
       <label className={label}>History chart
         <select className={field} value={trendCount}
           onChange={e=>setTrendCount(Number(e.target.value))}>
           <option value={3}>3 months</option><option value={6}>6 months</option>
           <option value={12}>12 months</option>
         </select>
       </label>
     </div>
     {preset==='custom'&&<div className="mt-4 flex flex-wrap gap-3">
       <label className={label}>From
         <input className={field} type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/></label>
       <label className={label}>Through
         <input className={field} type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)}/></label>
     </div>}
     <p className="mt-3 text-xs text-[var(--muted)]">
       {currentRange?currentRange.label+' · '+formatFinanceDate(currentRange.from)+' to '+
         formatFinanceDate(currentRange.to):period.error}
       {currentRange?.partial?' · Current period is incomplete.':''}
       {!noFilters(filters)?' · FILTERED totals (not overall spending).':''}
     </p>
     {!noFilters(filters)&&<button type="button" className="mt-2 text-xs font-semibold underline"
       onClick={()=>chooseFilter({accountId:null,categoryId:null,merchant:null})}>Clear filters</button>}
   </Card>
   {loading&&<p role="status" className="text-sm text-[var(--muted)]">Loading your recorded financial analytics…</p>}
   {error&&<p role="alert" className="text-sm text-[var(--danger)]">
     <CircleAlert size={16} className="mr-2 inline"/>{error}. No invented totals are shown.</p>}
   {data&&!loading&&!error&&overview&&<>
     <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
       {metrics.map(([name,value,info])=><div key={name} className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
         <p className="text-xs font-semibold text-[var(--muted)]">{name}</p>
         <p className="mt-2 break-words text-base font-extrabold text-[var(--fg)] sm:text-lg">{value}</p>
         <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">{info}</p>
       </div>)}
     </div>
     <Card>
       <h3 className="text-lg font-bold text-[var(--fg)]">Spending by category</h3>
       <p className="mt-1 text-xs text-[var(--muted)]">
         Actual expense payments by assigned category. Tap a category to review its purchases.
       </p>
       {categories.length===0?<p className="mt-4 text-sm text-[var(--muted)]">No recorded expenses for this selection.</p>:
         <div className="mt-4 space-y-3">
           {categories.map((c,i)=><button type="button" key={c.id??'missing'}
             className="block w-full rounded-xl border border-[var(--line)] p-3 text-left"
             onClick={()=>{chooseFilter({...filters,categoryId:c.id});focusTransactions();}}>
             <div className="flex items-center justify-between gap-3 text-xs">
               <strong className="text-[var(--fg)]">{c.name||'Uncategorized'} · {c.count} purchases</strong>
               <span className="text-[var(--fg)]">{num(c.amountMinor)} · {categoryShares[i]}</span>
             </div>
             <div role="img" aria-label={(c.name||'Uncategorized')+' accounts for '+categoryShares[i]}
               className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--accent-subtle)]">
               <div className="h-full rounded-full bg-[var(--accent)]"
                 style={{width:percentBar(c.amountMinor,overview.expenseMinor)+'%'}}/>
             </div>
           </button>)}
         </div>}
     </Card>
     <div className="grid gap-4 lg:grid-cols-2">
       <Card>
         <h3 className="text-lg font-bold text-[var(--fg)]">Top merchants</h3>
         <p className="mt-1 text-xs text-[var(--muted)]">
           Curated PX Mart / FamilyMart / 7-Eleven aliases only. Other names stay distinct.
         </p>
         {overview.merchants.length===0?<p className="mt-3 text-sm text-[var(--muted)]">No merchant purchases in this range.</p>:
           <div className="mt-4 divide-y divide-[var(--line)]">
             {overview.merchants.slice(0,12).map((m,i)=><button type="button"
               key={m.name??'missing'} className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left"
               onClick={()=>{if(m.name){chooseFilter({...filters,merchant:m.name});focusTransactions();}}}
               disabled={!m.name}>
               <div className="text-sm">
                 <p className="font-semibold text-[var(--fg)]">{m.name??'Merchant not recorded'}</p>
                 <p className="text-xs text-[var(--muted)]">{m.count} purchases ·
                   average {num(roundedFraction(m.amountMinor,m.count))}</p>
               </div>
               <div className="text-right text-xs font-bold text-[var(--fg)]">
                 {num(m.amountMinor)}<p className="text-[var(--muted)]">{merchantShares[i]}</p>
               </div>
             </button>)}
           </div>}
       </Card>
       <Card>
         <h3 className="text-lg font-bold text-[var(--fg)]">Spending from each account</h3>
         <p className="mt-1 text-xs text-[var(--muted)]">Original payment accounts only; transfers are excluded.</p>
         {overview.accounts.length===0?<p className="mt-3 text-sm text-[var(--muted)]">No account expenses recorded.</p>:
           <div className="mt-4 space-y-2">
             {overview.accounts.map((a,i)=><button key={a.id??'missing'} type="button"
               className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--line)] p-3 text-left"
               onClick={()=>{chooseFilter({...filters,accountId:a.id});focusTransactions();}}>
               <span className="text-sm font-semibold text-[var(--fg)]">{a.name??'Unspecified account'}</span>
               <span className="text-xs font-bold text-[var(--fg)]">{num(a.amountMinor)} · {accountShares[i]}</span>
             </button>)}
           </div>}
         <p className="mt-4 text-xs text-[var(--muted)]">
           Current tracked bank/cash balance is a separate account metric, not income,
           net cash flow or unspent budget.
         </p>
       </Card>
     </div>
     <Card>
       <div className="flex flex-wrap items-center justify-between gap-2">
         <h3 className="text-lg font-bold text-[var(--fg)]">Monthly spending trend</h3>
         <p className="text-xs text-[var(--muted)]">All bars are actual paid expenses in TWD · {trendCount} months</p>
       </div>
       <div className="mt-4 space-y-2">
         {data.months.map((m,i)=>{
           const prev=data.months[i-1],pastComparable=prev&&m.coverage==='recorded'&&
             prev.coverage==='recorded'&&m.monthStart<thisMonth(today)&&
             prev.monthStart<thisMonth(today);
           const delta=pastComparable?
             (minorBigInt(m.expenseMinor)-minorBigInt(prev.expenseMinor)).toString():null;
           const utilization=m.budgetMinor===null?'No budget':
             percentLabel(utilizationBasisPoints(m.expenseMinor,m.budgetMinor));
           return <div key={m.monthStart} className="grid grid-cols-[66px_minmax(0,1fr)] items-center gap-2 rounded-xl py-2 sm:grid-cols-[90px_minmax(0,1fr)_150px]">
             <span className="text-xs font-semibold text-[var(--fg)]">{nameMonth(m.monthStart)}</span>
             <div className="min-w-0">
               <div className="h-3.5 overflow-hidden rounded-full bg-[var(--accent-subtle)]" role="img"
                 aria-label={monthStatus(m,today)+', '+num(m.expenseMinor)}>
                 {m.coverage!=='unknown'&&<div className="h-full rounded-full bg-[var(--accent)]"
                   style={{width:percentBar(m.expenseMinor,maxMonth)+'%'}}/>}
               </div>
               <p className="mt-1 text-[11px] text-[var(--muted)]">{monthStatus(m,today)}</p>
             </div>
             <p className="col-span-2 text-xs text-[var(--fg)] sm:col-span-1 sm:text-right">
               {m.coverage==='unknown'?'Unknown':num(m.expenseMinor)}
               <span className="block text-[var(--muted)]">
                 {m.budgetMinor===null?'No saved budget':
                   'Budget '+num(m.budgetMinor)+' · '+utilization}
                 {delta!==null?' · vs previous '+num(delta):''}
               </span>
             </p>
           </div>;
         })}
       </div>
       <p className="mt-3 text-xs text-[var(--muted)]">
         Trend comparison is withheld for current partial months and before-recording periods.
         INR budgets are converted using each month’s frozen manual TWD rate.
         Different monthly conversion snapshots may affect budget comparisons, not expense totals.
       </p>
     </Card>
     <Card>
       <div className="flex flex-wrap items-center justify-between gap-2">
         <h3 className="text-lg font-bold text-[var(--fg)]">Daily spending · {nameMonth(trendEnd)}</h3>
         <div role="group" aria-label="Daily spending method" className="flex gap-2">
           <button className={action} type="button" aria-pressed={cashView==='consumption'}
             onClick={()=>setCashView('consumption')}>Daily consumption</button>
           <button className={action} type="button" aria-pressed={cashView==='cash'}
             onClick={()=>setCashView('cash')}>Actual payments</button>
         </div>
       </div>
       <p className="mt-2 text-xs text-[var(--muted)]">
         {cashView==='cash'?'Full payments on their original dates.':
           'Allocations across consumption dates; these do not make another bank deduction.'}
         {' '}Dates beyond today may show already-paid grocery consumption commitments.
       </p>
       <div className="mt-4 grid grid-cols-7 gap-2 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
         {data.daily.map(d=>{
           const amount=cashView==='cash'?d.actualMinor:d.consumptionMinor;
           return <div key={d.date} className="min-w-0" title={formatFinanceDate(d.date)+' · '+num(amount)}>
             <div role="img" aria-label={formatFinanceDate(d.date)+': '+num(amount)}
               className="flex h-16 items-end rounded bg-[var(--accent-subtle)]">
               <div className="w-full rounded-t bg-[var(--accent)]"
                 style={{height:percentBar(amount,maxDay)+'%'}}/>
             </div>
             <p className="mt-1 text-center text-[10px] font-semibold text-[var(--fg)]">{Number(d.date.slice(8))}</p>
           </div>;
         })}
       </div>
       <details className="mt-4 text-xs text-[var(--fg)]">
         <summary className="cursor-pointer font-bold">Show exact daily values</summary>
         <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
           {data.daily.map(d=><div key={d.date} className="rounded border border-[var(--line)] p-2">
             {formatFinanceDate(d.date)} · {num(cashView==='cash'?d.actualMinor:d.consumptionMinor)}
           </div>)}
         </div>
       </details>
     </Card>
     <div className="grid gap-4 lg:grid-cols-2">
       <Card>
         <h3 className="text-lg font-bold text-[var(--fg)]"><Utensils size={17} className="mr-2 inline"/> Groceries vs outside food</h3>
         <p className="mt-1 text-xs text-[var(--muted)]">Only the categories you actually assigned.</p>
         {[
           ['Groceries',grocery?.amountMinor??'0'],
           ['Outside food',outside?.amountMinor??'0']
         ].map(([name,amount])=><div key={name} className="mt-4">
           <div className="flex justify-between text-sm font-bold text-[var(--fg)]">
             <span>{name}</span><span>{num(amount)}</span>
           </div>
           <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--accent-subtle)]">
             <div className="h-full rounded-full bg-[var(--accent)]"
               style={{width:percentBar(amount,
                 (minorBigInt(grocery?.amountMinor??'0')+minorBigInt(outside?.amountMinor??'0')).toString())+'%'}}/>
           </div>
         </div>)}
         <p className="mt-4 text-sm font-semibold text-[var(--fg)]">Recorded combined food spend:
           {' '}{num((minorBigInt(grocery?.amountMinor??'0')+minorBigInt(outside?.amountMinor??'0')).toString())}</p>
         <p className="mt-2 text-xs text-[var(--muted)]">
           Food categories are based on your choices, not inferred meals, nutrition or savings.
         </p>
       </Card>
       <Card>
         <h3 className="text-lg font-bold text-[var(--fg)]">Grocery purchasing and usage</h3>
         <p className="mt-2 text-xs text-[var(--muted)]">
           Actual grocery payments this selected period: {num(grocery?.amountMinor??'0')}
           {' '}({grocery?.count??0} purchases)
         </p>
         <p className="mt-2 text-xs text-[var(--muted)]">Average paid purchase:
           {' '}{grocery?.count?num(roundedFraction(grocery.amountMinor,grocery.count)):'No purchases'}</p>
         <p className="mt-2 text-xs text-[var(--muted)]">
           Allocated grocery consumption in {nameMonth(trendEnd)}:
           {' '}{num(groceryDaily)} · average per calendar day
           {' '}{num(roundedFraction(groceryDaily,data.daily.length))}
         </p>
         <p className="mt-3 text-xs font-bold text-[var(--fg)]">Frequent grocery merchants</p>
         <p className="mt-1 text-xs text-[var(--muted)]">
           {groceryVendorDetails.length?groceryVendorDetails.slice(0,3).map(v=>
             (v.name??'Merchant not recorded')+' ('+v.count+')').join(' · '):'No recorded grocery purchases'}
         </p>
         <p className="mt-3 text-xs font-bold text-[var(--fg)]">Already-paid grocery costs coming up</p>
         {rolling.length===0?<p className="mt-2 text-xs text-[var(--muted)]">No commitments in next 7 days.</p>:
           <div className="mt-2 space-y-1">
             {rolling.map(d=><p key={d.date} className="text-xs text-[var(--muted)]">
               {formatFinanceDate(d.date)} · {num(d.groceryMinor)}</p>)}
           </div>}
         <p className="mt-2 text-xs text-[var(--muted)]">
           These are already-paid allocations, not upcoming withdrawals.
         </p>
       </Card>
     </div>
     <Card>
       <h3 className="text-lg font-bold text-[var(--fg)]">
         <Activity size={17} className="mr-2 inline"/> Recorded-data insights</h3>
       <div className="mt-3 space-y-2">
         {insightTexts.map((text,i)=><p key={i}
           className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--fg)]">{text}</p>)}
         {overview.firstTracked&&<p className="text-xs text-[var(--muted)]">
           Earliest retained transaction date: {formatFinanceDate(overview.firstTracked)}.
           Manual records may omit purchases; this date does not prove earlier history is complete.
         </p>}
       </div>
       <button type="button" className={action+' mt-4'}
         onClick={()=>setProjectionOpen(x=>!x)} aria-expanded={projectionOpen}>
         <TrendingUp size={15}/> {projectionOpen?'Hide':'Show'} optional spending projection
       </button>
       {projectionOpen&&<p className="mt-3 text-sm text-[var(--fg)]">
         {projected===null?
           'Month-end estimate unavailable: needs at least 7 elapsed days, a current-month unfiltered view, and recorded history starting no later than the first day of this month.':
           'Simple projected actual spending by month-end: '+num(projected)+
             '. Assumes average paid spending per elapsed day continues unchanged; not a guarantee, and never creates bank deductions.'}
       </p>}
     </Card>
     <Card>
       <div id="finance-analytics-drilldown" className="scroll-mt-24">
         <div className="flex flex-wrap items-center justify-between gap-2">
           <h3 className="text-lg font-bold text-[var(--fg)]">Expense transaction details</h3>
           <button className={action} type="button" onClick={()=>setDrillOpen(x=>!x)}>
             {drillOpen?'Close':'View'} recorded purchases</button>
         </div>
         {!drillOpen?<p className="mt-2 text-xs text-[var(--muted)]">
           Open to inspect account, merchant, category and exact original payment for this selection.
         </p>:<>
           {drillLoading&&<p className="mt-3 text-sm text-[var(--muted)]">Loading private transaction page…</p>}
           {drillError&&<p role="alert" className="mt-3 text-sm text-[var(--danger)]">{drillError}</p>}
           {!drillLoading&&!drillError&&<div className="mt-3 divide-y divide-[var(--line)]">
             {drillRows.length===0?<p className="text-sm text-[var(--muted)]">No matching purchases.</p>:
               drillRows.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                 <div>
                   <p className="text-sm font-semibold text-[var(--fg)]">
                     {r.merchant.trim()||'Merchant not recorded'}</p>
                   <p className="mt-1 text-xs text-[var(--muted)]">
                     {formatFinanceDate(r.date)} ·
                     {data.categories.find(c=>c.id===r.categoryId)?.name??'Uncategorized'} ·
                     {data.accounts.find(a=>a.accountId===r.accountId)?.name??'Account'}
                   </p>
                 </div>
                 <div className="flex items-center gap-2">
                   <strong className="text-sm text-[var(--fg)]">{num(r.amountMinor)}</strong>
                   <button className={action} type="button" onClick={()=>reviewExpense(r.id)}
                     aria-label={'Edit purchase '+r.id}><Pencil size={15}/> Review</button>
                 </div>
               </div>)}
           </div>}
           <div className="mt-3 flex justify-between gap-2 text-xs text-[var(--muted)]">
             <span>Showing {drillRows.length?drillOffset+1:0}–{drillOffset+drillRows.length}</span>
             <div className="flex gap-2">
               <button className={action} disabled={drillLoading||drillOffset===0}
                 onClick={()=>setDrillOffset(x=>Math.max(0,x-15))}>Previous</button>
               <button className={action} disabled={drillLoading||!drillMore}
                 onClick={()=>setDrillOffset(x=>x+15)}>Next</button>
             </div>
           </div>
         </>}
       </div>
     </Card>
     <p className="text-xs text-[var(--muted)]">
       Expense categories, merchants and account metrics use actual posted ledger payments.
       Transfers, openings, adjustments, voids and unpaid schedules are excluded.
       Cash-flow income includes refunds as separately recorded income; budget remaining is not saved cash.
       Your data stays within your authenticated ManuOS Finance connection.
     </p>
   </>}
 </section>;
}
