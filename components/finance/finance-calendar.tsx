'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Clock3,
  Pencil, Plus, RefreshCw, ShoppingBasket } from 'lucide-react';
import { Card } from '@/components/ui';
import { assertISODate, shiftCalendarDay } from '@/lib/finance/allocations';
import { daysInMonth } from '@/lib/finance/budget';
import { buildBudgetProjection, displayFraction, monthOffset,
  todayInFinanceTimezone, type BudgetDailyRow } from '@/lib/finance/budget-dashboard';
import { buildFinanceCalendar, assertCalendarMatchesLedger, nextSevenGroceryDays,
  monthForDay, type CalendarSpendingView } from '@/lib/finance/calendar-view';
import { formatMoney, minorBigInt } from '@/lib/finance/money';
import { formatFinanceDate } from '@/lib/finance/dates';
import { getBudgetDailyRows, getBudgetForMonth, getFinanceBudgetPreferences,
  getMonthlySummary, listFinanceAccounts, listCategories,
  listFinanceCalendarDays, listFinanceCalendarDayDetails,
  type FinanceCalendarDay, type FinanceCalendarLine,
  type FinanceCalendarFilters } from '@/lib/finance/repository';
import type { FinanceAccount, FinanceCategory, MonthlyBudget, MonthlySummary } from '@/lib/finance/types';

const outline='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] disabled:opacity-50';
const control='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]';
const label='block space-y-1 text-xs font-bold text-[var(--fg)]';
const PAGE=25;
const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const localMonth=()=>monthForDay(todayInFinanceTimezone('Asia/Taipei'));
const errorText=(e:unknown)=>e instanceof Error?e.message:'Could not load financial calendar';

type Bundle={
 baseline:BudgetDailyRow[];unfiltered:FinanceCalendarDay[];filtered:FinanceCalendarDay[];
 budget:MonthlyBudget|null;summary:MonthlySummary;accounts:FinanceAccount[];
 categories:FinanceCategory[];upcoming:FinanceCalendarDay[];timezone:string;
};
function monthName(month:string){
 return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'})
   .format(new Date(month+'T12:00:00Z'));
}
function shortAmount(minor:string):string{
 const value=minorBigInt(minor);
 const absolute=value<BigInt(0)?-value:value;
 const cents=absolute%BigInt(100);
 return (value<BigInt(0)?'-':'')+(absolute/BigInt(100)).toLocaleString('en-US')+
   (cents===BigInt(0)?'':'.'+cents.toString().padStart(2,'0'));
}
function statusText(s:string){
 return s==='over'?'Over target':s==='near'?'Near limit':
   s==='under'?'Within target':'No budget';
}
function statusClass(s:string){
 return s==='over'?'border-red-500/60 bg-red-500/10':
   s==='near'?'border-amber-500/60 bg-amber-500/10':
     'border-[var(--line)] bg-[var(--surface)]';
}
function filtersActive(f:FinanceCalendarFilters){
 return Boolean(f.accountId||f.categoryId||(f.spendingType&&f.spendingType!=='all'));
}

export function FinanceCalendar(){
 const [month,setMonth]=useState(localMonth);
 const [selected,setSelected]=useState(()=>todayInFinanceTimezone('Asia/Taipei'));
 const [today,setToday]=useState(()=>todayInFinanceTimezone('Asia/Taipei'));
 const [view,setView]=useState<CalendarSpendingView>('consumption');
 const [filters,setFilters]=useState<FinanceCalendarFilters>({
   spendingType:'all',accountId:null,categoryId:null
 });
 const [bundle,setBundle]=useState<Bundle|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [revision,setRevision]=useState(0);
 const requestRef=useRef(0);
 const timezoneReady=useRef(false);
 const [lines,setLines]=useState<FinanceCalendarLine[]>([]);
 const [lineOffset,setLineOffset]=useState(0);
 const [hasMore,setHasMore]=useState(false);
 const [linesLoading,setLinesLoading]=useState(false);
 const [linesError,setLinesError]=useState('');
 const linesRequest=useRef(0);

 const readMonth=useCallback(async()=>{
   const seq=++requestRef.current;setLoading(true);setError('');
   try{
     const [prefs,baseline,summary,budget,unfiltered,accounts,categories]=await Promise.all([
       getFinanceBudgetPreferences(),getBudgetDailyRows(month),getMonthlySummary(month),
       getBudgetForMonth(month),listFinanceCalendarDays(month),
       listFinanceAccounts(),listCategories()
     ]);
     if(seq!==requestRef.current)return;
     const localToday=todayInFinanceTimezone(prefs.timezone);
     setToday(localToday);
     if(!timezoneReady.current){
       timezoneReady.current=true;
       const correctMonth=monthForDay(localToday);
       if(correctMonth!==month){
         setMonth(correctMonth);setSelected(localToday);
         return;
       }
     }
     assertCalendarMatchesLedger(baseline,unfiltered);
     const applied=filtersActive(filters)?
       await listFinanceCalendarDays(month,filters):unfiltered;
     const todayMonth=monthForDay(localToday);
     const nextMonth=monthOffset(todayMonth,1);
     const rollingCurrent=month===todayMonth?unfiltered:
       await listFinanceCalendarDays(todayMonth);
     const rollingNext=month===nextMonth?unfiltered:
       await listFinanceCalendarDays(nextMonth);
     if(seq!==requestRef.current)return;
     setBundle({baseline,summary,budget,unfiltered,filtered:applied,
       accounts,categories,timezone:prefs.timezone,
       upcoming:[...rollingCurrent,...rollingNext]});
     setError('');
   }catch(e){
     if(seq===requestRef.current){setError(errorText(e));setBundle(null);}
   }finally{if(seq===requestRef.current)setLoading(false);}
 },[month,filters]);

 useEffect(()=>{
   const pending=window.setTimeout(()=>{void readMonth();},0);
   const changed=()=>{void readMonth();};
   const foreground=()=>{if(document.visibilityState==='visible')void readMonth();};
   window.addEventListener('manuos:finance-changed',changed);
   document.addEventListener('visibilitychange',foreground);
   const tracker=requestRef;
   return ()=>{
     window.clearTimeout(pending);tracker.current++;
     window.removeEventListener('manuos:finance-changed',changed);
     document.removeEventListener('visibilitychange',foreground);
   };
 },[readMonth,revision]);

 useEffect(()=>{
   const token=++linesRequest.current;
   if(!bundle||error)return;
   const start=window.setTimeout(async()=>{
     setLinesLoading(true);setLinesError('');
     try{
       const page=await listFinanceCalendarDayDetails(selected,view,filters,lineOffset,PAGE);
       if(token!==linesRequest.current)return;
       setLines(page.rows);setHasMore(page.hasMore);
     }catch(e){
       if(token===linesRequest.current){
         setLinesError(errorText(e));setLines([]);setHasMore(false);
       }
     }finally{if(token===linesRequest.current)setLinesLoading(false);}
   },0);
   const tracker=linesRequest;
   return ()=>{window.clearTimeout(start);tracker.current++;};
 },[bundle,selected,view,filters,lineOffset,error]);

 const calendar=useMemo(()=>{
   if(!bundle)return {cells:[],grid:[],calculationError:''};
   try{
     const result=buildFinanceCalendar(month,today,bundle.baseline,bundle.filtered,
       bundle.budget?.resolvedTwdMinor??null);
     return {...result,calculationError:''};
   }catch(e){return {cells:[],grid:[],calculationError:errorText(e)};}
 },[bundle,month,today]);
 const summary=useMemo(()=>{
   if(!bundle?.budget)return null;
   try{
     return buildBudgetProjection({
       monthStart:month,today,budgetTwdMinor:bundle.budget.resolvedTwdMinor,
       actualExpenseMinor:bundle.summary.actualExpenseMinor,
       allocatedConsumptionMinor:bundle.summary.allocatedConsumptionMinor,
       daily:bundle.baseline
     });
   }catch{return null;}
 },[bundle,month,today]);

 const selectedCell=calendar.cells.find(x=>x.date===selected)??null;
 const filtered=filtersActive(filters);
 const todayUpcoming=bundle?nextSevenGroceryDays(today,bundle.upcoming):[];
 const relevantUpcoming=todayUpcoming.filter(x=>minorBigInt(x.amountMinor)>BigInt(0));
 const monthHasEntries=calendar.cells.some(x=>
   minorBigInt(x.cashMinor)>BigInt(0)||minorBigInt(x.consumptionMinor)>BigInt(0));
 const showingFiltered=selectedCell?
   (view==='consumption'?selectedCell.consumptionMinor:selectedCell.cashMinor):'0';

 function chooseDay(d:string){
   assertISODate(d);setSelected(d);setLineOffset(0);
   const next=monthForDay(d);
   if(next!==month){setMonth(next);setBundle(null);}
 }
 function changeMonth(delta:-1|1){
   const next=monthOffset(month,delta);setMonth(next);setSelected(next);
   setLineOffset(0);setBundle(null);
 }
 function editTransaction(id:string){
   window.dispatchEvent(new CustomEvent('manuos:finance-edit-transaction',{detail:{id}}));
   document.getElementById('finance-transactions')?.scrollIntoView({
     behavior:'smooth',block:'start'
   });
 }
 function addExpense(){
   window.dispatchEvent(new Event('manuos:finance-open-expense'));
   document.getElementById('finance-transactions')?.scrollIntoView({
     behavior:'smooth',block:'start'
   });
 }
 const normalBudget=bundle?.budget?.resolvedTwdMinor??null;
 const currentDayRatio=normalBudget===null?null:{
   numerator:normalBudget,denominator:daysInMonth(month)
 };
 const dailyLabel=normalBudget!==null&&bundle?.budget?.budgetCurrency==='INR'?
   'Standard daily equivalent in TWD':'Standard daily budget (TWD)';
 return <section id="finance-calendar" className="mt-8 space-y-4 scroll-mt-20"
   aria-label="Personal financial calendar">
   <div className="flex flex-wrap items-start justify-between gap-3">
     <div>
       <h2 className="text-xl font-extrabold text-[var(--fg)]">Daily finance calendar</h2>
       <p className="mt-1 text-xs text-[var(--muted)]">
         Consumption planning by default. Your actual bank payments stay separate.
       </p>
     </div>
     <div className="flex flex-wrap gap-2">
       <button type="button" className={outline} onClick={addExpense}>
         <Plus size={16}/> Add expense</button>
       <button type="button" className={outline} disabled={loading}
         onClick={()=>setRevision(x=>x+1)}><RefreshCw size={16}/> Refresh</button>
     </div>
   </div>
   <Card>
     <div className="flex flex-wrap items-end justify-between gap-3">
       <div className="flex items-center gap-2">
         <button className={outline} type="button" aria-label="Previous calendar month"
           onClick={()=>changeMonth(-1)}><ChevronLeft size={18}/></button>
         <label className={label}>Calendar month
           <input className={control} type="month" value={month.slice(0,7)}
             onChange={e=>{
               if(/^\d{4}-\d{2}$/.test(e.target.value)){
                 const next=e.target.value+'-01';
                 setMonth(next);setSelected(next);setLineOffset(0);setBundle(null);
               }
             }}/>
         </label>
         <button className={outline} type="button" aria-label="Next calendar month"
           onClick={()=>changeMonth(1)}><ChevronRight size={18}/></button>
       </div>
       <div className="text-right">
         <p className="text-sm font-bold text-[var(--fg)]">{monthName(month)}</p>
         <p className="text-xs text-[var(--muted)]">{daysInMonth(month)} days ·
           {bundle?.timezone??'Asia/Taipei'}</p>
       </div>
     </div>
     <div className="mt-4 flex flex-wrap items-center gap-2" role="group"
       aria-label="Calendar spending representation">
       <button type="button" className={outline}
         aria-pressed={view==='consumption'}
         onClick={()=>{setView('consumption');setLineOffset(0);}}>
         {view==='consumption'?'✓ ':''}Daily consumption</button>
       <button type="button" className={outline}
         aria-pressed={view==='cash'}
         onClick={()=>{setView('cash');setLineOffset(0);}}>
         {view==='cash'?'✓ ':''}Actual payments</button>
     </div>
     <p className="mt-2 text-xs text-[var(--muted)]">
       {view==='consumption'?
         'Daily cost shares, including groceries bought in an earlier month. No new bank deductions.':
         'Full amounts paid on their original transaction dates. No repeated grocery charges.'}
     </p>
     <div className="mt-4 grid gap-2 sm:grid-cols-3">
       <label className={label}>Show spending
         <select className={control} value={filters.spendingType??'all'}
           onChange={e=>{setFilters(f=>({...f,spendingType:e.target.value as FinanceCalendarFilters['spendingType']}));setLineOffset(0);}}>
           <option value="all">All spending</option>
           <option value="groceries">Groceries</option>
           <option value="other">Other expenses</option>
         </select>
       </label>
       <label className={label}>Payment account
         <select className={control} value={filters.accountId??''}
           onChange={e=>{setFilters(f=>({...f,accountId:e.target.value||null}));setLineOffset(0);}}>
           <option value="">All accounts</option>
           {bundle?.accounts.map(a=><option key={a.accountId} value={a.accountId}>{a.name}</option>)}
         </select>
       </label>
       <label className={label}>Expense category
         <select className={control} value={filters.categoryId??''}
           onChange={e=>{setFilters(f=>({...f,categoryId:e.target.value||null}));setLineOffset(0);}}>
           <option value="">All categories</option>
           {bundle?.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
       </label>
     </div>
     {filtered&&<p className="mt-3 rounded-xl border border-[var(--line)] p-3 text-xs font-semibold text-[var(--fg)]">
       Filtered calendar: displayed payment/consumption amounts are partial.
       Daily allowance statuses always reflect your complete spending, not this filter.
       <button type="button" className="ml-2 underline" onClick={()=>{
         setFilters({spendingType:'all',accountId:null,categoryId:null});setLineOffset(0);
       }}>Clear filters</button>
     </p>}
     {loading&&<p role="status" className="mt-4 text-sm text-[var(--muted)]">Loading real calendar records…</p>}
     {error&&<p role="alert" className="mt-4 text-sm text-[var(--danger)]">
       <CircleAlert size={16} className="mr-1 inline"/>{error}. No financial values were estimated.
     </p>}
     {calendar.calculationError&&<p role="alert" className="mt-4 text-sm text-[var(--danger)]">
       {calendar.calculationError}; verify the financial records before using this calendar.
     </p>}
     {!loading&&!error&&!calendar.calculationError&&bundle&&<>
       <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--muted)] sm:gap-2 sm:text-xs">
         {weekdays.map(day=><div key={day} className="py-2">{day}</div>)}
       </div>
       <div className="grid grid-cols-7 gap-1 sm:gap-2" aria-label={'Finance calendar '+monthName(month)}>
         {calendar.grid.map((slot,index)=>{
           const cell=slot.cell;
           if(!cell)return <div key={'pad-'+index} aria-hidden="true" className="min-h-[66px] sm:min-h-[95px]"/>;
           const total=view==='cash'?cell.cashMinor:cell.consumptionMinor;
           const isSelected=cell.date===selected;
           const description=cell.date+': '+formatMoney(total,'TWD')+
             ' '+(view==='cash'?'paid':'attributed')+
             '; '+statusText(cell.status)+(cell.allocationCount>0?
               '; '+cell.allocationCount+' saved allocations':'')+
             (filtered?'; filtered amount':'');
           return <button key={cell.date} type="button"
             aria-label={description}
             aria-pressed={isSelected}
             title={description}
             onClick={()=>chooseDay(cell.date)}
             className={'relative min-w-0 min-h-[66px] overflow-hidden rounded-xl border p-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:min-h-[95px] sm:p-2 '+
               statusClass(cell.status)+(isSelected?' ring-2 ring-[var(--accent)]':'')}>
             <div className="flex items-center justify-between gap-0.5">
               <span className={'text-xs font-extrabold sm:text-sm '+(cell.isToday?
                 'text-[var(--accent)]':'text-[var(--fg)]')}>{cell.day}</span>
               {cell.isToday&&<span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"/>}
             </div>
             <span className="mt-1 block truncate text-[9px] font-bold leading-tight text-[var(--fg)] sm:mt-2 sm:text-xs">
               {shortAmount(total)}
             </span>
             <span className="mt-1 block text-[8px] font-medium leading-tight text-[var(--muted)] sm:text-[10px]">
               {cell.status==='over'?'Over':cell.status==='near'?'Near':
                 cell.status==='no-budget'?'No budget':'OK'}
             </span>
             {cell.allocationCount>0&&<span className="mt-1 flex items-center gap-0.5 text-[8px] text-[var(--muted)] sm:text-[10px]">
               <ShoppingBasket size={10}/> Allocated</span>}
           </button>;
         })}
       </div>
       <p className="mt-3 text-xs text-[var(--muted)]">
         Cell amounts in NT$ · <strong>OK</strong> within allowance · <strong>Near</strong> at least
         80% · <strong>Over</strong> exceeds allowance · <strong>Allocated</strong> saved multi-day shares.
       </p>
       {!monthHasEntries&&<p className="mt-3 text-sm text-[var(--muted)]">
         No recorded expenses or allocations for these filters and dates.</p>}
     </>}
   </Card>
   {bundle&&!error&&!loading&&!calendar.calculationError&&<>
     <div className="grid gap-3 sm:grid-cols-3">
       <Card>
         <p className="text-xs font-semibold text-[var(--muted)]">Monthly spending limit</p>
         <p className="mt-2 text-xl font-bold text-[var(--fg)]">
           {bundle.budget?formatMoney(bundle.budget.budgetMinor,bundle.budget.budgetCurrency):
             'No monthly budget'}</p>
         {bundle.budget?.budgetCurrency==='INR'&&<p className="mt-1 text-xs text-[var(--muted)]">
           Manual planning equivalent {formatMoney(bundle.budget.resolvedTwdMinor,'TWD')}</p>}
         {!bundle.budget&&<button type="button" className="mt-2 text-xs underline"
           onClick={()=>document.getElementById('finance-budget')?.scrollIntoView({behavior:'smooth'})}>
           Configure a monthly budget
         </button>}
       </Card>
       <Card>
         <p className="text-xs font-semibold text-[var(--muted)]">Actual monthly expenses</p>
         <p className="mt-2 text-xl font-bold text-[var(--fg)]">
           {formatMoney(bundle.summary.actualExpenseMinor,'TWD')}</p>
         <p className="mt-1 text-xs text-[var(--muted)]">Paid once, by payment date; not allocated twice.</p>
       </Card>
       <Card>
         <p className="text-xs font-semibold text-[var(--muted)]">
           {summary?.period==='past'?'Historical budget remaining':'Budget left / daily average'}
         </p>
         <p className="mt-2 text-xl font-bold text-[var(--fg)]">
           {summary?formatMoney(summary.actualRemainingMinor,'TWD'):'Not configured'}</p>
         <p className="mt-1 text-xs text-[var(--muted)]">
           {summary?.period==='current'?
             summary.remainingDaysInclusive+' days including today · '+displayFraction(summary.dynamicAllowance!)+'/day':
             summary?.period==='future'?'Future budget, not an available bank balance':
               'Historical month; no remaining-days projection'}
         </p>
       </Card>
     </div>
     <Card>
       <div className="flex flex-wrap justify-between gap-2">
         <h3 className="text-lg font-bold text-[var(--fg)]">Selected day · {formatFinanceDate(selected)}</h3>
         <p className="text-xs text-[var(--muted)]">
           {filtered?'Filtered line items; full budget totals below':'All recorded spending'}
         </p>
       </div>
       <div className="mt-3 grid gap-3 sm:grid-cols-3">
         <div><p className="text-xs text-[var(--muted)]">{dailyLabel}</p>
           <p className="mt-1 text-lg font-extrabold text-[var(--fg)]">
             {currentDayRatio?displayFraction(currentDayRatio):'No budget'}</p></div>
         <div><p className="text-xs text-[var(--muted)]">Actual payment on this day</p>
           <p className="mt-1 text-lg font-extrabold text-[var(--fg)]">
             {selectedCell?formatMoney(bundle.baseline.find(x=>x.date===selected)?.actualMinor??'0','TWD'):'—'}</p></div>
         <div><p className="text-xs text-[var(--muted)]">Complete attributed consumption</p>
           <p className="mt-1 text-lg font-extrabold text-[var(--fg)]">
             {selectedCell?formatMoney(bundle.baseline.find(x=>x.date===selected)?.allocatedMinor??'0','TWD'):'—'}</p></div>
       </div>
       {selectedCell&&<div className="mt-3 flex flex-wrap gap-4 border-t border-[var(--line)] pt-3 text-sm">
         <span className="font-semibold text-[var(--fg)]">
           {selectedCell.dailyRemainingMinor===null?'Daily remaining: not configured':
             'Daily remaining: '+formatMoney(selectedCell.dailyRemainingMinor,'TWD')}
         </span>
         <span className="text-[var(--muted)]">
           {view==='cash'?'Payments shown':'Consumption shown'} with filters:
           {' '}{formatMoney(showingFiltered,'TWD')} (partial when filtered)
         </span>
         {selectedCell.status==='over'&&<strong className="text-[var(--fg)]">Over daily allowance.</strong>}
       </div>}
       <h4 className="mt-5 text-sm font-extrabold text-[var(--fg)]">
         <Clock3 size={15} className="mr-2 inline"/> {view==='cash'?'Payments timeline':'Daily consumption timeline'}
       </h4>
       <p className="mt-1 text-xs text-[var(--muted)]">
         Original transaction dates are displayed. Times are not invented.
         {view==='consumption'?' Multi-day costs refer back to their paid purchases.':''}
       </p>
       {linesLoading&&<p role="status" className="mt-4 text-sm text-[var(--muted)]">Reading selected-day entries…</p>}
       {linesError&&<p role="alert" className="mt-3 text-sm text-[var(--danger)]">{linesError}</p>}
       {!linesLoading&&!linesError&&(lines.length===0?
         <p className="mt-4 text-sm text-[var(--muted)]">No recorded items for this day and filter.</p>:
         <div className="mt-3 divide-y divide-[var(--line)]">
           {lines.map((line,i)=>{
             const category=bundle.categories.find(c=>c.id===line.categoryId)?.name??'Other';
             const account=bundle.accounts.find(a=>a.accountId===line.accountId)?.name??'Account';
             return <div key={line.transactionId+'-'+i+'-'+line.itemName}
               className="flex flex-wrap items-center justify-between gap-3 py-3">
               <div className="min-w-0 flex-1">
                 <p className="break-words text-sm font-bold text-[var(--fg)]">
                   {line.itemName||line.merchant||'Expense'}</p>
                 <p className="mt-1 text-xs text-[var(--muted)]">
                   {line.kind==='allocated'?'Allocated cost':'Payment cost'} · {category} · {account}
                 </p>
                 <p className="mt-0.5 text-xs text-[var(--muted)]">
                   Bought {formatFinanceDate(line.txnDate)}
                   {line.kind==='allocated'&&line.allocationStart&&line.durationDays?
                     ' · Allocated '+formatFinanceDate(line.allocationStart)+' to '+
                     formatFinanceDate(shiftCalendarDay(line.allocationStart,line.durationDays-1)):''
                   }
                 </p>
               </div>
               <div className="flex flex-wrap items-center gap-2">
                 <strong className="text-sm text-[var(--fg)]">{formatMoney(line.amountMinor,'TWD')}</strong>
                 <button type="button" className={outline}
                   onClick={()=>editTransaction(line.transactionId)}
                   aria-label={'Review or edit '+(line.itemName||line.merchant)}>
                   <Pencil size={14}/> Review</button>
               </div>
             </div>;
           })}
         </div>)}
       <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
         <span>Showing {lines.length===0?0:lineOffset+1}–{lineOffset+lines.length} entries</span>
         <div className="flex gap-2">
           <button type="button" className={outline} disabled={linesLoading||lineOffset===0}
             onClick={()=>setLineOffset(n=>Math.max(0,n-PAGE))}>Previous</button>
           <button type="button" className={outline} disabled={linesLoading||!hasMore}
             onClick={()=>setLineOffset(n=>n+PAGE)}>Next</button>
         </div>
       </div>
     </Card>
     <Card>
       <div className="flex items-center gap-2">
         <ShoppingBasket size={18} className="text-[var(--accent)]"/>
         <h3 className="text-lg font-bold text-[var(--fg)]">Upcoming grocery costs · next 7 days</h3>
       </div>
       <p className="mt-2 text-xs text-[var(--muted)]">
         Already-paid groceries assigned to future consumption dates. These are NOT unpaid bills
         and will not create another bank deduction. Unpaid scheduled purchases remain in
         Scheduled transactions above.
       </p>
       {relevantUpcoming.length===0?
         <p className="mt-3 text-sm text-[var(--muted)]">No saved grocery allocations in the next seven days.</p>:
         <div className="mt-3 grid gap-2 sm:grid-cols-2">
           {relevantUpcoming.map(day=><button type="button" key={day.date} className={outline+' justify-between'}
             onClick={()=>chooseDay(day.date)}>
             <span>{formatFinanceDate(day.date)}</span>
             <strong>{formatMoney(day.amountMinor,'TWD')}</strong>
           </button>)}
         </div>}
     </Card>
   </>}
 </section>;
}
