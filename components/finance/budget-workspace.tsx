'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, CircleAlert,
  Coins, Pencil, RefreshCw, Save } from 'lucide-react';
import { Card, Empty } from '@/components/ui';
import {
  addManualExchangeRate, getBudgetDailyRows, getBudgetForMonth,
  getFinanceBudgetPreferences, getMonthlySummary, listManualExchangeRates,
  saveMonthlyBudget
} from '@/lib/finance/repository';
import {
  buildBudgetProjection, displayFraction, monthOffset, percentLabel,
  standardDailyAmounts, todayInFinanceTimezone, type BudgetDailyRow
} from '@/lib/finance/budget-dashboard';
import { formatMoney, minorBigInt, parseManualTwdPerInr, parseMoney } from '@/lib/finance/money';
import { daysInMonth } from '@/lib/finance/budget';
import type { Currency, ManualFxRate, MonthlyBudget, MonthlySummary } from '@/lib/finance/types';

const input='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const button='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] disabled:opacity-50';
const primary='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50';
const label='block space-y-1 text-xs font-semibold text-[var(--fg)]';
const initialMonth=()=>todayInFinanceTimezone('Asia/Taipei').slice(0,7)+'-01';
function readable(e:unknown){return e instanceof Error?e.message:'Budget data unavailable';}
function asInput(minor:string):string{
  const n=minorBigInt(minor),positive=n<BigInt(0)?-n:n;
  return (n<BigInt(0)?'-':'')+(positive/BigInt(100)).toString()+'.'+
    (positive%BigInt(100)).toString().padStart(2,'0');
}
function monthTitle(value:string):string{
  return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'})
    .format(new Date(value+'T12:00:00Z'));
}
function currentDayInMonth(month:string,day:string){return month.slice(0,7)===day.slice(0,7);}

type BudgetState={
  budget:MonthlyBudget|null;summary:MonthlySummary;daily:BudgetDailyRow[];
  rates:ManualFxRate[]; timezone:string;displayCurrency:Currency;currentFxRateId:string|null;
};

export function FinanceBudgetWorkspace(){
  const [month,setMonth]=useState(initialMonth);
  const [state,setState]=useState<BudgetState|null>(null);
  const [today,setToday]=useState(()=>todayInFinanceTimezone('Asia/Taipei'));
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [edit,setEdit]=useState(false);
  const [amount,setAmount]=useState('');
  const [currency,setCurrency]=useState<Currency>('TWD');
  const [rateId,setRateId]=useState('');
  const [newRate,setNewRate]=useState('');
  const [rateNote,setRateNote]=useState('');
  const [pending,setPending]=useState(false);
  const [formError,setFormError]=useState('');
  const [ratePending,setRatePending]=useState(false);
  const [rateError,setRateError]=useState('');
  const pendingRef=useRef(false);
  const ratePendingRef=useRef(false);
  const requestId=useRef(0);
  const initiallySynced=useRef(false);

  const refresh=useCallback(async()=>{
    const request=++requestId.current;
    setLoading(true);
    try{
      const [prefs,budget,summary,daily,rates]=await Promise.all([
        getFinanceBudgetPreferences(),getBudgetForMonth(month),getMonthlySummary(month),
        getBudgetDailyRows(month),listManualExchangeRates()
      ]);
      if(request!==requestId.current)return false;
      const clock=todayInFinanceTimezone(prefs.timezone);
      const rows={budget,summary,daily,rates,...prefs};
      setState(rows);setToday(clock);setError('');
      // Default to the configured timezone's current month on initial load only.
      if(!initiallySynced.current){
        initiallySynced.current=true;
        const configuredMonth=clock.slice(0,7)+'-01';
        if(month!==configuredMonth){setMonth(configuredMonth);return true;}
      }
      return true;
    }catch(e){
      if(request===requestId.current)setError(readable(e));
      return false;
    }finally{if(request===requestId.current)setLoading(false);}
  },[month]);

  useEffect(()=>{
    const starter=window.setTimeout(()=>{void refresh();},0);
    const changed=()=>{void refresh();};
    const visible=()=>{if(document.visibilityState==='visible')void refresh();};
    window.addEventListener('manuos:finance-changed',changed);
    document.addEventListener('visibilitychange',visible);
    const req=requestId;
    return ()=>{
      window.clearTimeout(starter);req.current++;
      window.removeEventListener('manuos:finance-changed',changed);
      document.removeEventListener('visibilitychange',visible);
    };
  },[refresh]);

  const projection=useMemo(()=>{
    if(!state?.budget)return null;
    return buildBudgetProjection({
      monthStart:month,today,budgetTwdMinor:state.budget.resolvedTwdMinor,
      actualExpenseMinor:state.summary.actualExpenseMinor,
      allocatedConsumptionMinor:state.summary.allocatedConsumptionMinor,
      daily:state.daily
    });
  },[state,month,today]);

  function openEditor(){
    if(!state)return;
    setCurrency(state.budget?.budgetCurrency??state.displayCurrency);
    setAmount(state.budget?asInput(state.budget.budgetMinor):'');
    setRateId(state.budget?.fxRateId??state.currentFxRateId??state.rates[0]?.id??'');
    setFormError('');setRateError('');setEdit(true);
  }
  function changeMonth(next:string){
    if(pendingRef.current)return;
    setEdit(false);setNotice('');setError('');setState(null);setMonth(next);
  }
  async function copyPrevious(){
    if(!state)return;
    setFormError('');
    try{
      const previous=await getBudgetForMonth(monthOffset(month,-1));
      if(!previous)throw new Error('Previous month has no saved budget to copy');
      setAmount(asInput(previous.budgetMinor));setCurrency(previous.budgetCurrency);
      setRateId(previous.fxRateId??'');setEdit(true);
      setNotice('Previous month copied into the editor. Nothing changes until you press Save.');
    }catch(e){setFormError(readable(e));setEdit(true);}
  }
  async function addRate(){
    if(ratePendingRef.current)return;
    try{
      parseManualTwdPerInr(newRate);
      ratePendingRef.current=true;setRatePending(true);setRateError('');
      // A network retry can be resolved against the immutable manual-rate history.
      const match=state?.rates.find(r=>parseManualTwdPerInr(r.twdPerInr)===
        parseManualTwdPerInr(newRate)&&r.note===rateNote.trim());
      const id=match?.id??await addManualExchangeRate(newRate,rateNote.trim());
      setRateId(id);setNewRate('');setRateNote('');
      await refresh();
      setNotice('Manual exchange rate saved and selected. Budget is unchanged until you save it.');
    }catch(e){setRateError(readable(e));}
    finally{ratePendingRef.current=false;setRatePending(false);}
  }
  async function save(e:React.FormEvent){
    e.preventDefault();if(pendingRef.current||!state)return;
    setFormError('');
    try{
      const amountMinor=parseMoney(amount);
      if(minorBigInt(amountMinor)<BigInt(0))throw new Error('Budget cannot be negative');
      if(currency==='INR'&&!rateId)throw new Error('Choose or add a manual INR-to-TWD rate');
      pendingRef.current=true;setPending(true);
      const previousRevision=state.budget?.revision??null;
      await saveMonthlyBudget(month,currency,amountMinor,currency==='INR'?rateId:null,previousRevision);
      setEdit(false);
      setNotice('Monthly budget saved. Bank balances and transactions were not changed.');
      const loaded=await refresh();
      if(!loaded)setNotice('Budget saved, but the dashboard could not refresh. Try Refresh before editing again.');
    }catch(e){setFormError(readable(e));}
    finally{pendingRef.current=false;setPending(false);}
  }

  const currencyCode=state?.budget?.budgetCurrency??'TWD';
  const totalDays=daysInMonth(month);
  const todayRow=state?.daily.find(r=>r.date===today);
  const budget=state?.budget;
  const basisPoints=projection?.percentageBasisPoints??null;
  const barWidth=basisPoints===null?0:
    Number(BigInt(basisPoints)>BigInt(10000)?BigInt(100):BigInt(basisPoints)/BigInt(100));
  const activeRate=budget?.fxTwdPerInr;
  const chosenRate=state?.rates.find(r=>r.id===rateId);

  return <section id="finance-budget" aria-label="Monthly spending budget" className="mt-8 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--fg)]">Monthly spending budget</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Separate from tracked bank balances · Calendar-based planning · No automatic budget
        </p>
      </div>
      <button className={button} type="button" disabled={loading}
        onClick={()=>void refresh()}><RefreshCw size={15}/> Refresh</button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button className={button} type="button" aria-label="Previous budget month"
        onClick={()=>changeMonth(monthOffset(month,-1))}><ArrowLeft size={17}/></button>
      <label className={label+' min-w-[180px]'}>Selected month
        <input className={input} type="month" value={month.slice(0,7)}
          onChange={e=>{if(/^\d{4}-\d{2}$/.test(e.target.value))changeMonth(e.target.value+'-01');}}/>
      </label>
      <button className={button} type="button" aria-label="Next budget month"
        onClick={()=>changeMonth(monthOffset(month,1))}><ArrowRight size={17}/></button>
      <div className="ml-auto text-right">
        <p className="text-sm font-bold text-[var(--fg)]">{monthTitle(month)}</p>
        <p className="text-xs text-[var(--muted)]">{totalDays} calendar days · {state?.timezone??'Asia/Taipei'}</p>
      </div>
    </div>

    {error&&<p role="alert" className="rounded-xl border border-[var(--line)] p-4 text-sm text-[var(--danger)]">
      <CircleAlert className="mr-2 inline" size={17}/>{error} Nothing was saved or estimated from missing data.
    </p>}
    {notice&&!error&&<p role="status" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--fg)]">
      <CheckCircle2 size={16} className="mr-2 inline text-emerald-600"/>{notice}</p>}
    {loading&&<p role="status" className="text-sm text-[var(--muted)]">Reading saved budget and expenses…</p>}

    {!loading&&!error&&state&&!budget&&(
      <Empty title="No budget for this month"
        description={'You have not set a spending limit for '+monthTitle(month)+'. Expenses remain recorded, but daily allowances are not configured.'}
        icon={<Coins size={20}/>}
        action={<button type="button" className={primary} onClick={openEditor}>
          <Pencil size={16}/> Set monthly budget</button>}/>
    )}

    {!loading&&!error&&state&&budget&&projection&&(
      <>
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <p className="text-xs font-bold text-[var(--muted)]">Monthly limit</p>
            <p className="mt-2 break-words text-2xl font-extrabold text-[var(--fg)]">
              {formatMoney(budget.budgetMinor,currencyCode)}</p>
            {currencyCode==='INR'&&<p className="mt-1 text-xs text-[var(--muted)]">
              Frozen planning equivalent: {formatMoney(budget.resolvedTwdMinor,'TWD')}</p>}
          </Card>
          <Card>
            <p className="text-xs font-bold text-[var(--muted)]">Actual paid this month</p>
            <p className="mt-2 break-words text-2xl font-extrabold text-[var(--fg)]">
              {formatMoney(state.summary.actualExpenseMinor,'TWD')}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Expenses only. No transfers, income or reconciliations.</p>
          </Card>
          <Card>
            <p className="text-xs font-bold text-[var(--muted)]">
              {minorBigInt(projection.actualRemainingMinor)<BigInt(0)?'Over monthly limit':'Monthly budget remaining'}
            </p>
            <p className="mt-2 break-words text-2xl font-extrabold text-[var(--fg)]">
              {formatMoney(projection.actualRemainingMinor,'TWD')}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Budget limit less actual expenses, not bank cash.</p>
          </Card>
        </div>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[var(--fg)]">Budget utilization</p>
            <p className="text-sm font-extrabold text-[var(--fg)]">{percentLabel(basisPoints)}</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--line)]"
            role="progressbar" aria-label="Monthly budget utilization"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={barWidth}>
            <div className="h-full rounded-full bg-[var(--accent)]" style={{width:barWidth+'%'}}/>
          </div>
          {projection.warning!=='none'&&<p className="mt-3 text-sm font-semibold text-[var(--fg)]">
            <AlertTriangle size={16} className="mr-2 inline"/>
            {projection.warning==='over'?'Monthly spending limit exceeded.':
              projection.warning==='90'?'At least 90% of your monthly budget has been used.':
              'At least 75% of your monthly budget has been used.'}
          </p>}
          {minorBigInt(budget.budgetMinor)===BigInt(0)&&<p className="mt-2 text-xs text-[var(--muted)]">
            A zero budget has no meaningful utilization percentage.</p>}
          {currencyCode==='INR'&&<p className="mt-3 text-xs text-[var(--muted)]">
            Manual rate snapshot: 1 INR = {activeRate} TWD. This is not a live exchange rate.
            Changing a rate will not revalue this saved month unless you explicitly edit it.
          </p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={primary} onClick={openEditor}><Pencil size={16}/> Edit budget</button>
            <button type="button" className={button} onClick={()=>void copyPrevious()}>
              Copy previous month's budget</button>
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <p className="text-xs font-bold text-[var(--muted)]">Standard daily allowance</p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--fg)]">
              {displayFraction(projection.dailyStandard,'TWD')}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Budget ÷ {totalDays} calendar days. The exact ratio is kept until display.</p>
          </Card>
          <Card>
            <p className="text-xs font-bold text-[var(--muted)]">
              {projection.period==='current'?'Today's standard allowance left':'Daily allowance status'}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--fg)]">
              {projection.dailyToday?displayFraction(projection.dailyToday.standardRemaining,'TWD'):'Not applicable'}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {projection.dailyToday?
                (projection.dailyToday.isOverStandard?'Over today's daily target.':
                  'Standard daily target minus today’s allocated cost.'):
                'Shown for today only when viewing the current month.'}
            </p>
            {projection.dailyToday&&<p className="mt-1 text-xs text-[var(--muted)]">
              Paid today: {formatMoney(projection.dailyActualTodayMinor??'0','TWD')} ·
              Allocated today: {formatMoney(projection.dailyToday.allocatedMinor,'TWD')}
            </p>}
          </Card>
          <Card>
            <p className="text-xs font-bold text-[var(--muted)]">
              {projection.period==='past'?'Historical month':
                projection.period==='future'?'Future monthly plan':'Dynamic remaining-days average'}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--fg)]">
              {projection.dynamicAllowance?displayFraction(projection.dynamicAllowance,'TWD'):'Not applicable'}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {projection.period==='past'?'No remaining days; historical results only.':
                projection.period==='future'?'Planned budget divided by all month days.':
                (projection.remainingDaysInclusive+' days including today. Monthly remaining budget ÷ remaining days. Not an additional amount to spend today.')}
            </p>
          </Card>
        </div>
        <Card>
          <p className="text-sm font-bold text-[var(--fg)]">Separate planned consumption</p>
          <p className="mt-2 text-xl font-extrabold text-[var(--fg)]">
            {formatMoney(state.summary.allocatedConsumptionMinor,'TWD')}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {formatMoney(projection.allocatedRemainingMinor,'TWD')} remaining against allocated cost.
            Multi-day purchases can contribute in different months from their bank payment.
            This is a separate planning view, not a second deduction or extra cash spending.
          </p>
        </Card>
      </>
    )}

    {!loading&&!error&&state&&!budget&&<Card>
      <p className="text-xs font-bold text-[var(--muted)]">Actual spending already recorded</p>
      <p className="mt-1 text-xl font-extrabold text-[var(--fg)]">
        {formatMoney(state.summary.actualExpenseMinor,'TWD')}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Expenses are preserved independently of whether you set a budget.</p>
      <button type="button" className={button+' mt-4'} onClick={()=>void copyPrevious()}>
        Copy previous month's budget</button>
    </Card>}

    {edit&&state&&<Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--fg)]">
            {budget?'Edit':'Create'} budget for {monthTitle(month)}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            This month only. Saving does not create an expense or move money between accounts.</p>
        </div>
        <button type="button" className={button} onClick={()=>{if(!pending)setEdit(false);}}
          disabled={pending}>Close</button>
      </div>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={save}>
        <label className={label}>Monthly spending limit
          <input className={input+' text-xl font-bold'} required inputMode="decimal"
            type="text" value={amount} placeholder="e.g. 6000.00"
            onChange={e=>setAmount(e.target.value)}/>
        </label>
        <label className={label}>Budget currency
          <select className={input} value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>
            <option value="TWD">NT$ (TWD)</option><option value="INR">₹ (INR)</option>
          </select>
        </label>
        {currency==='INR'&&<>
          <label className={label+' sm:col-span-2'}>Manual planning exchange rate
            <select className={input} value={rateId} required
              onChange={e=>setRateId(e.target.value)}>
              <option value="">Choose manual rate (required)</option>
              {state.rates.map(r=><option key={r.id} value={r.id}>
                1 INR = {r.twdPerInr} TWD · {r.recordedAt.slice(0,10)} · {r.note||'Manual'}
              </option>)}
            </select>
            {chosenRate&&<p className="text-xs font-normal text-[var(--muted)]">
              Selected manual rate: {chosenRate.twdPerInr} TWD per INR. It will be frozen for this month's budget.</p>}
          </label>
          <div className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4">
            <p className="text-xs font-bold text-[var(--fg)]">Add a new manual exchange rate</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className={label}>1 INR equals how many TWD?
                <input className={input} type="text" inputMode="decimal"
                  placeholder="e.g. 0.38" value={newRate} onChange={e=>setNewRate(e.target.value)}/>
              </label>
              <label className={label}>Rate note (optional)
                <input className={input} type="text" maxLength={500}
                  placeholder="Source / date" value={rateNote} onChange={e=>setRateNote(e.target.value)}/>
              </label>
              <button type="button" className={button+' self-end'}
                disabled={ratePending||pending||!newRate.trim()} onClick={()=>void addRate()}>
                {ratePending?'Saving rate…':'Save rate'}</button>
            </div>
            {rateError&&<p role="alert" className="mt-2 text-xs text-[var(--danger)]">{rateError}</p>}
          </div>
        </>}
        {formError&&<p role="alert" className="sm:col-span-2 text-sm text-[var(--danger)]">
          <CircleAlert size={16} className="mr-1 inline"/>{formError}</p>}
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button className={primary} disabled={pending||ratePending} type="submit">
            <Save size={16}/>{pending?'Saving…':'Save monthly budget'}</button>
          <button className={button} type="button" disabled={pending} onClick={()=>void copyPrevious()}>
            Copy previous month</button>
        </div>
      </form>
    </Card>}
    {!loading&&!error&&state&&<p className="text-xs text-[var(--muted)]">
      <CalendarDays size={14} className="mr-1 inline"/>
      Planning days: {totalDays} · Expenses in TWD, budget possibly in INR using a saved manual rate.
      The exact daily distribution of budget minor units preserves the full monthly total
      ({standardDailyAmounts(''+(budget?.resolvedTwdMinor??'0'),totalDays).length} days).
    </p>}
  </section>;
}
