'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import { CalendarDays,RefreshCw,ShoppingBasket,Wallet } from 'lucide-react';
import { Card } from '@/components/ui';
import { getBudgetDailyRows,getBudgetForMonth,getMonthlySummary,
 getFinanceBudgetPreferences,listFinanceHistory,listFinanceCalendarDays } from '@/lib/finance/repository';
import { todayInFinanceTimezone,standardDailyAmounts } from '@/lib/finance/budget-dashboard';
import { formatMoney,minorBigInt } from '@/lib/finance/money';
import { formatFinanceDate } from '@/lib/finance/dates';
import type { MonthlyBudget,MonthlySummary,FinanceTransaction } from '@/lib/finance/types';

const action='inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--fg)]';
type OverviewState={
 today:string;budget:MonthlyBudget|null;summary:MonthlySummary;
 actualDay:string;consumptionDay:string;groceryDay:string;
 targetDay:string|null;recent:FinanceTransaction[];
};
export function FinanceOverviewSnapshot(){
 const [state,setState]=useState<OverviewState|null>(null);
 const [error,setError]=useState(''),[loading,setLoading]=useState(true);
 const request=useRef(0);
 const refresh=useCallback(async()=>{
   const id=++request.current;setLoading(true);setError('');
   try{
     const prefs=await getFinanceBudgetPreferences();
     const today=todayInFinanceTimezone(prefs.timezone);
     const month=today.slice(0,7)+'-01';
     const [budget,summary,days,history,calendar]=await Promise.all([
       getBudgetForMonth(month),getMonthlySummary(month),getBudgetDailyRows(month),
       listFinanceHistory({kind:'expense',limit:5}),
       listFinanceCalendarDays(month)
     ]);
     if(id!==request.current)return;
     const row=days.find(d=>d.date===today),grocery=calendar.find(d=>d.date===today);
     if(!row||!grocery)throw new Error('Today’s saved finance totals are incomplete');
     const index=Number(today.slice(8,10))-1;
     const target=budget?standardDailyAmounts(budget.resolvedTwdMinor,days.length)[index]:null;
     setState({today,budget,summary,
       actualDay:row.actualMinor,consumptionDay:row.allocatedMinor,
       groceryDay:grocery.groceryMinor,targetDay:target,recent:history.rows});
   }catch(e){if(id===request.current)setError(e instanceof Error?e.message:'Finance overview unavailable');}
   finally{if(id===request.current)setLoading(false);}
 },[]);
 useEffect(()=>{
   const t=window.setTimeout(()=>void refresh(),0);
   const changed=()=>{void refresh();};
   window.addEventListener('manuos:finance-changed',changed);
   const tracker=request;
   return ()=>{window.clearTimeout(t);tracker.current++;
     window.removeEventListener('manuos:finance-changed',changed);};
 },[refresh]);
 const remaining=state?.targetDay==null?null:
   (minorBigInt(state.targetDay)-minorBigInt(state.consumptionDay)).toString();
 return <section className="mt-6 space-y-4" aria-label="Monthly and daily financial overview">
   <div className="flex flex-wrap items-center justify-between gap-2">
     <div><h2 className="text-xl font-extrabold text-[var(--fg)]">Your financial snapshot</h2>
       <p className="mt-1 text-xs text-[var(--muted)]">
         Your balances above are manually tracked, not verified by a bank.</p></div>
     <button type="button" className={action} disabled={loading} onClick={()=>void refresh()}>
       <RefreshCw size={15}/> Refresh</button>
   </div>
   {loading&&<p role="status" className="text-sm text-[var(--muted)]">Loading saved spending…</p>}
   {error&&<p role="alert" className="break-words text-sm text-[var(--danger)]">{error}</p>}
   {state&&!loading&&!error&&<>
     <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
       {[
         ['This month: paid',formatMoney(state.summary.actualExpenseMinor,'TWD'),'Recorded expense payments'],
         ['Budget remaining',state.budget?
           formatMoney((minorBigInt(state.budget.resolvedTwdMinor)-minorBigInt(state.summary.actualExpenseMinor)).toString(),'TWD'):
           'Not configured','Budget minus actual payments, not bank cash'],
         ['Today: attributed',formatMoney(state.consumptionDay,'TWD'),'Includes already-paid grocery portions'],
         ['Today: allowance left',remaining!==null?formatMoney(remaining,'TWD'):'No budget',
           'Standard daily budget minus today’s consumption'],
       ].map(([name,value,description])=><div key={name}
         className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
         <p className="text-xs font-semibold text-[var(--muted)]">{name}</p>
         <p className="mt-2 break-words text-lg font-extrabold text-[var(--fg)]">{value}</p>
         <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
       </div>)}
     </div>
     <div className="grid gap-3 lg:grid-cols-2">
       <Card>
         <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]">
           <ShoppingBasket size={17}/> Today, {formatFinanceDate(state.today)}</h3>
         <p className="mt-3 text-sm text-[var(--fg)]">
           Groceries allocated today: <strong>{formatMoney(state.groceryDay,'TWD')}</strong></p>
         <p className="mt-2 text-sm text-[var(--fg)]">
           Actual payments today: <strong>{formatMoney(state.actualDay,'TWD')}</strong></p>
         <p className="mt-2 text-xs text-[var(--muted)]">
           Grocery allocations are planned daily consumption from existing paid transactions;
           no extra deduction occurs today.</p>
       </Card>
       <Card>
         <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]">
           <CalendarDays size={17}/> Recent recorded expenses</h3>
         {state.recent.length===0?<p className="mt-3 text-xs text-[var(--muted)]">
           No expense transactions recorded.</p>:
           <div className="mt-2 divide-y divide-[var(--line)]">
             {state.recent.map(t=><div key={t.id}
               className="flex items-center justify-between gap-2 py-2 text-xs">
               <div className="min-w-0">
                 <p className="truncate font-semibold text-[var(--fg)]">
                   {t.merchant||'Merchant not recorded'}</p>
                 <p className="text-[var(--muted)]">{formatFinanceDate(t.txnDate)}</p>
               </div>
               <span className="shrink-0 font-bold text-[var(--fg)]">
                 {formatMoney(t.amountMinor,'TWD')}</span>
             </div>)}
           </div>}
       </Card>
     </div>
     <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
       <Wallet size={15}/> Available bank/cash money, monthly budget remaining, and net income are different measurements.
     </p>
   </>}
 </section>;
}
