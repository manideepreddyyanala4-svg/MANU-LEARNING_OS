'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatMoney, minorBigInt } from '@/lib/finance/money';
import { todayInTaipei, formatFinanceDate } from '@/lib/finance/dates';
import { daysInMonth } from '@/lib/finance/budget';
import { displayFraction } from '@/lib/finance/budget-dashboard';
import { assertISODate } from '@/lib/finance/allocations';
import { getBudgetDailyRows, getBudgetForMonth, getFinanceTransaction,
  listDayCostBreakdown, type FinanceDayCost } from '@/lib/finance/repository';
import type { FinanceTransaction } from '@/lib/finance/types';

const control='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const action='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] disabled:opacity-50';
const PAGE=25;
const readable=(e:unknown)=>e instanceof Error?e.message:'Daily cost details unavailable';

export function FinanceDayBreakdown(){
  const [date,setDate]=useState(todayInTaipei);
  const [version,setVersion]=useState(0);
  const [offset,setOffset]=useState(0);
  const [lines,setLines]=useState<FinanceDayCost[]>([]);
  const [hasNext,setHasNext]=useState(false);
  const [spent,setSpent]=useState('0');
  const [cash,setCash]=useState('0');
  const [monthBudget,setMonthBudget]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [selected,setSelected]=useState<FinanceTransaction|null>(null);
  const [selectedError,setSelectedError]=useState('');
  const [detailPending,setDetailPending]=useState(false);

  const refresh=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      assertISODate(date);
      const month=date.slice(0,7)+'-01';
      const [items,allDays,budget]=await Promise.all([
        // Fetch an extra item for exact next-page detection, not the whole history.
        listDayCostBreakdown(date,offset,PAGE+1),
        getBudgetDailyRows(month),getBudgetForMonth(month)
      ]);
      const d=allDays.find(row=>row.date===date);
      if(!d)throw new Error('Daily financial summary missing');
      setLines(items.slice(0,PAGE));setHasNext(items.length>PAGE);
      setSpent(d.allocatedMinor);setCash(d.actualMinor);
      setMonthBudget(budget?.resolvedTwdMinor??null);
    }catch(e){setError(readable(e));setLines([]);setHasNext(false);}
    finally{setLoading(false);}
  },[date,offset]);

  useEffect(()=>{
    let active=true;
    const start=window.setTimeout(()=>{if(active)void refresh();},0);
    const changed=()=>{if(active)void refresh();};
    window.addEventListener('manuos:finance-changed',changed);
    return ()=>{active=false;window.clearTimeout(start);
      window.removeEventListener('manuos:finance-changed',changed);};
  },[refresh,version]);

  function choose(dateValue:string){
    setDate(dateValue);setOffset(0);setSelected(null);setSelectedError('');
  }
  async function inspect(id:string){
    setSelected(null);setSelectedError('');setDetailPending(true);
    try{
      const result=await getFinanceTransaction(id);
      setSelected(result);
    }catch(e){setSelectedError(readable(e));}
    finally{setDetailPending(false);}
  }
  const target=monthBudget?{numerator:monthBudget,denominator:daysInMonth(date.slice(0,7)+'-01')}:null;
  const remaining=target?{
    numerator:(minorBigInt(monthBudget!)-minorBigInt(spent)*BigInt(target.denominator)).toString(),
    denominator:target.denominator
  }:null;
  return <section className="mt-8" aria-label="Daily grocery allocation breakdown">
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--fg)]">Where your daily budget goes</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Grocery cost allocations and ordinary daily expenses. These are not extra bank payments.
          </p>
        </div>
        <button type="button" className={action} onClick={()=>setVersion(v=>v+1)}
          disabled={loading}><RefreshCw size={16}/> Refresh</button>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <button className={action} type="button" aria-label="Previous day"
          onClick={()=>choose(shiftDay(date,-1))}><ChevronLeft size={18}/></button>
        <label className="min-w-[175px] space-y-1 text-xs font-bold text-[var(--fg)]">
          Allocation day
          <input type="date" className={control} value={date}
            onChange={e=>{if(e.target.value)choose(e.target.value);}}/>
        </label>
        <button className={action} type="button" aria-label="Next day"
          onClick={()=>choose(shiftDay(date,1))}><ChevronRight size={18}/></button>
      </div>
      {loading&&<p role="status" className="mt-4 text-sm text-[var(--muted)]">Checking daily costs…</p>}
      {error&&<p role="alert" className="mt-4 text-sm text-[var(--danger)]">
        {error}. No amounts were estimated. Check the configured database migration.
      </p>}
      {!loading&&!error&&<>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] p-3">
            <p className="text-xs text-[var(--muted)]">Attributed daily consumption</p>
            <p className="mt-2 text-xl font-black text-[var(--fg)]">{formatMoney(spent,'TWD')}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] p-3">
            <p className="text-xs text-[var(--muted)]">Actually paid on this date</p>
            <p className="mt-2 text-xl font-black text-[var(--fg)]">{formatMoney(cash,'TWD')}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] p-3">
            <p className="text-xs text-[var(--muted)]">Remaining standard allowance</p>
            <p className="mt-2 text-xl font-black text-[var(--fg)]">
              {remaining?displayFraction(remaining):'No monthly budget set'}</p>
            {remaining&&minorBigInt(remaining.numerator)<BigInt(0)&&
              <p className="mt-1 text-xs font-semibold text-[var(--fg)]">Daily target exceeded.</p>}
          </div>
        </div>
        <h3 className="mt-5 text-sm font-extrabold text-[var(--fg)]">
          <CalendarDays size={15} className="mr-2 inline"/>{formatFinanceDate(date)} cost breakdown
        </h3>
        {lines.length===0?<p className="mt-3 text-sm text-[var(--muted)]">
          No purchases or allocated grocery items on this date.
        </p>:<div className="mt-2 divide-y divide-[var(--line)]">
          {lines.map((line,index)=><div key={line.transactionId+'-'+index}
            className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--fg)]">
                {line.itemName||line.merchant||'Expense'}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {line.attributionType==='allocated'?'Allocated from':'Paid at'} {line.merchant} ·
                Purchase date: {formatFinanceDate(line.purchaseDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <strong className="text-sm text-[var(--fg)]">
                {formatMoney(line.amountMinor,'TWD')}</strong>
              <button className={action} type="button"
                onClick={()=>void inspect(line.transactionId)}>View purchase</button>
            </div>
          </div>)}
        </div>}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>Showing {offset+1}–{offset+lines.length} {hasNext?'of more':'items'}</span>
          <div className="flex gap-2">
            <button className={action} type="button" disabled={offset===0}
              onClick={()=>setOffset(n=>Math.max(0,n-PAGE))}>Previous</button>
            <button className={action} type="button" disabled={!hasNext}
              onClick={()=>setOffset(n=>n+PAGE)}>Next</button>
          </div>
        </div>
        {detailPending&&<p role="status" className="mt-3 text-xs text-[var(--muted)]">Loading original purchase…</p>}
        {selectedError&&<p role="alert" className="mt-3 text-xs text-[var(--danger)]">{selectedError}</p>}
        {selected&&<div className="mt-4 rounded-xl border border-[var(--line)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--fg)]">Original purchase: {selected.merchant}</p>
            <button type="button" className={action} onClick={()=>setSelected(null)}>Close</button>
          </div>
          <p className="mt-2 text-sm text-[var(--fg)]">
            {formatMoney(selected.amountMinor,'TWD')} paid on {formatFinanceDate(selected.txnDate)}.
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Ledger revision {selected.revision} · {selected.voidedAt?'Voided':'Recorded'}.
            Day-by-day shares do not produce additional deductions.
          </p>
        </div>}
      </>}
    </Card>
  </section>;
}
function shiftDay(date:string,offset:number):string{
  assertISODate(date);
  const y=Number(date.slice(0,4)),m=Number(date.slice(5,7))-1,d=Number(date.slice(8,10));
  return new Date(Date.UTC(y,m,d+offset)).toISOString().slice(0,10);
}
