'use client';

import { useMemo } from 'react';
import { CalendarRange, Plus, Trash2 } from 'lucide-react';
import { formatFinanceDate } from '@/lib/finance/dates';
import { formatMoney } from '@/lib/finance/money';
import { aggregateDailyCost, purchasePreview, type PurchaseAllocationDraft,
  type AllocationItemDraft, MAX_PURCHASE_DAYS } from '@/lib/finance/allocation-editor';

const input='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const pill='min-h-11 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)] disabled:opacity-50';
const label='block space-y-1 text-xs font-semibold text-[var(--fg)]';
const presets=['1','2','3','4','5','7'];

export function PurchaseAllocationEditor({
 draft,onChange,paymentAccount,
}:{
 draft:PurchaseAllocationDraft;
 onChange:(draft:PurchaseAllocationDraft)=>void;
 paymentAccount:string;
}){
  const preview=useMemo(()=>{
    try{
      return {value:purchasePreview(draft),error:''};
    }catch(e){
      return {value:null,error:e instanceof Error?e.message:'Invalid allocation'};
    }
  },[draft]);
  const days=preview.value?aggregateDailyCost(preview.value.daily):[];
  const update=(patch:Partial<PurchaseAllocationDraft>)=>onChange({...draft,...patch});
  const updateItem=(id:string,patch:Partial<AllocationItemDraft>)=>update({
    items:draft.items.map(x=>x.id===id?{...x,...patch}:x)
  });
  const addItem=()=>update({items:[...draft.items,{
    id:crypto.randomUUID(),name:'',amount:'',startDate:draft.purchaseDate,duration:'3'
  }]});
  return <fieldset className="sm:col-span-2 space-y-4 rounded-2xl border border-[var(--line)] p-4">
    <legend className="px-2 text-sm font-bold text-[var(--fg)]">
      <CalendarRange size={17} className="mr-2 inline"/> Daily cost allocation
    </legend>
    <p className="text-xs text-[var(--muted)]">
      Your account pays once. This setting only distributes the purchase for daily budgeting.
    </p>
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Expense allocation type">
      {([
        ['single','Single day'],
        ['whole','Multiple days'],
        ['items','Basket items (optional)']
      ] as const).map(([mode,text])=><label key={mode}
        className={'flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-semibold '+(
          draft.mode===mode?'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--fg)]':
            'border-[var(--line)] text-[var(--muted)]'
        )}>
        <input type="radio" name="allocation-type" checked={draft.mode===mode}
          onChange={()=>update({
            mode,
            items:mode==='items'&&draft.items.length===0?[{
              id:crypto.randomUUID(),name:'',amount:'',startDate:draft.purchaseDate,duration:'3'
            }]:draft.items
          })}/>{text}
      </label>)}
    </div>
    {draft.mode==='whole'&&<div className="grid gap-3 sm:grid-cols-2">
      <label className={label}>First consumption date
        <input type="date" required className={input} value={draft.startDate}
          onChange={e=>update({startDate:e.target.value})}/>
      </label>
      <label className={label}>Number of days (1–{MAX_PURCHASE_DAYS})
        <input type="number" inputMode="numeric" min={1} max={MAX_PURCHASE_DAYS}
          step={1} required className={input} value={draft.duration}
          onChange={e=>update({duration:e.target.value})}/>
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2" aria-label="Quick duration presets">
        {presets.map(days=><button key={days} type="button" className={pill}
          aria-pressed={draft.duration===days} onClick={()=>update({duration:days})}>
          {days} {days==='1'?'day':'days'}
        </button>)}
      </div>
    </div>}
    {draft.mode==='items'&&<div className="space-y-3">
      {draft.items.map((item,i)=><div key={item.id}
        className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold text-[var(--fg)]">Basket item {i+1}</p>
          <button className={pill} type="button" onClick={()=>update({items:draft.items.filter(x=>x.id!==item.id)})}
            aria-label={'Remove basket item '+(i+1)}><Trash2 size={15}/></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>Item name
            <input className={input} required maxLength={200}
              value={item.name} placeholder="Chicken, eggs…" onChange={e=>updateItem(item.id,{name:e.target.value})}/>
          </label>
          <label className={label}>Item total (NT$)
            <input className={input} inputMode="decimal" required
              value={item.amount} placeholder="100.00" onChange={e=>updateItem(item.id,{amount:e.target.value})}/>
          </label>
          <label className={label}>First consumption date
            <input className={input} type="date" required value={item.startDate}
              onChange={e=>updateItem(item.id,{startDate:e.target.value})}/>
          </label>
          <label className={label}>Lasts how many days?
            <input className={input} type="number" min={1} max={MAX_PURCHASE_DAYS}
              step={1} required inputMode="numeric" value={item.duration}
              onChange={e=>updateItem(item.id,{duration:e.target.value})}/>
          </label>
        </div>
      </div>)}
      <button type="button" className={pill+' inline-flex items-center gap-2'}
        onClick={addItem} disabled={draft.items.length>=100}>
        <Plus size={15}/> Add basket item</button>
      <p className="text-xs text-[var(--muted)]">
        Item amounts must sum exactly to the full paid amount, including cents.
        Each item can last a different number of days. No extra bank transactions are created.
      </p>
    </div>}
    {preview.error&&<p role="alert" className="text-xs font-semibold text-[var(--danger)]">
      Preview unavailable: {preview.error}
    </p>}
    {preview.value&&<div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-sm font-bold text-[var(--fg)]">Before you save</p>
      <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
        <div><dt className="text-[var(--muted)]">Full purchase / single deduction</dt>
          <dd className="mt-1 font-bold text-[var(--fg)]">{formatMoney(preview.value.totalMinor,'TWD')}</dd></div>
        <div><dt className="text-[var(--muted)]">Payment account</dt>
          <dd className="mt-1 font-bold text-[var(--fg)]">{paymentAccount||'Choose an account'}</dd></div>
        <div><dt className="text-[var(--muted)]">Consumption days</dt>
          <dd className="mt-1 font-bold text-[var(--fg)]">{days.length} unique days</dd></div>
        <div><dt className="text-[var(--muted)]">Last allocation date</dt>
          <dd className="mt-1 font-bold text-[var(--fg)]">
            {formatFinanceDate(preview.value.lastDate)}</dd></div>
      </dl>
      <div className="mt-4 space-y-1 text-sm">
        {days.slice(0,14).map(day=><div key={day.date}
          className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-2">
          <span className="text-[var(--muted)]">{formatFinanceDate(day.date)}</span>
          <strong className="text-[var(--fg)]">{formatMoney(day.amountMinor,'TWD')}</strong>
        </div>)}
        {days.length>14&&<p className="py-2 text-xs text-[var(--muted)]">
          Showing first 14 of {days.length} days. All days are saved exactly.
        </p>}
      </div>
      <p className="mt-3 text-xs font-semibold text-[var(--fg)]">
        The full amount is deducted from your selected account once.
        Daily allocations are used only for budget planning, never as additional payments.
      </p>
    </div>}
  </fieldset>;
}
