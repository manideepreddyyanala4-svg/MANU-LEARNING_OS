'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRightLeft, Check, CircleAlert, PenLine, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { formatMoney, minorBigInt, parseMoney } from '@/lib/finance/money';
import { todayInTaipei } from '@/lib/finance/dates';
import type { FinanceAccount, FinanceAccountOverview, OpeningBalanceEntry } from '@/lib/finance/types';

const inputStyle='mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)] min-h-11';
const labelStyle='block text-xs font-bold text-[var(--fg)]';
const buttonStyle='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50';
const mainButton=buttonStyle+' bg-[var(--accent)] text-white hover:opacity-90';
const secondaryButton=buttonStyle+' border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]';

function failMessage(error:unknown):string{
  return error instanceof Error ? error.message : 'Unable to save. Nothing has been confirmed.';
}
function usableMoney(value:string,canBeNegative=false){
  return parseMoney(value,canBeNegative);
}

export function OpeningSetup({
  missing,onSave,
}:{
  missing:FinanceAccount[];
  onSave:(entries:OpeningBalanceEntry[])=>Promise<void>;
}){
  const [values,setValues]=useState<Record<string,string>>({});
  const [date,setDate]=useState(todayInTaipei);
  const [pending,setPending]=useState(false);
  const busy=useRef(false);
  const keys=useRef<Record<string,{fingerprint:string;key:string}>>({});
  const [error,setError]=useState('');

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(busy.current)return;
    setError('');
    try{
      const selected=missing.filter(a=>values[a.accountId]?.trim() !== undefined &&
        values[a.accountId]?.trim() !== '');
      if(!selected.length)throw new Error('Enter at least one observed account balance. Use 0 for an empty account.');
      // Cash is optional; unentered bank accounts are not silently set to zero.
      const entries=selected.map(a=>{
        const amountMinor=usableMoney(values[a.accountId]);
        const fingerprint=a.accountId+'|'+date+'|'+amountMinor;
        if(keys.current[a.accountId]?.fingerprint!==fingerprint){
          keys.current[a.accountId]={fingerprint,key:crypto.randomUUID()};
        }
        return {accountId:a.accountId,amountMinor,effectiveDate:date,
          operationKey:keys.current[a.accountId].key};
      });
      busy.current=true;setPending(true);
      await onSave(entries);
      keys.current={};
      setValues({});
    }catch(e){setError(failMessage(e));}
    finally{busy.current=false;setPending(false);}
  }
  return (
    <section aria-labelledby="finance-setup-title"
      className="rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/30 p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
          <ShieldCheck size={21}/>
        </div>
        <div>
          <h2 id="finance-setup-title" className="text-lg font-black text-[var(--fg)]">Set up your real opening balances</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Enter the amount you personally checked. Blank means not configured; 0 means an intentionally empty account.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {missing.map(a=>(
            <label className={labelStyle} key={a.accountId}>
              {a.name} <span className="font-normal text-[var(--muted)]">(NT$)</span>
              <input type="text" inputMode="decimal" autoComplete="off"
                value={values[a.accountId]??''}
                onChange={e=>setValues(v=>({...v,[a.accountId]:e.target.value}))}
                placeholder="e.g. 3000.00" className={inputStyle}
                aria-label={a.name+' opening balance'}/>
            </label>
          ))}
        </div>
        <label className={labelStyle}>
          Date balance was observed
          <input type="date" required value={date} max={todayInTaipei()}
            onChange={e=>setDate(e.target.value)} className={inputStyle+' sm:max-w-xs'}/>
        </label>
        {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button className={mainButton} type="submit" disabled={pending}>
            <Save size={17}/> {pending?'Saving opening balances…':'Save observed balances'}
          </button>
          <p className="max-w-md text-xs text-[var(--muted)]">
            Saved together in one database operation. No bank connection is made.
          </p>
        </div>
      </form>
    </section>
  );
}

export type AccountFormMode='transfer'|'reconcile'|'opening'|'manage';
export type FinanceAccountAction =
  | {kind:'transfer';fromId:string;toId:string;amountMinor:string;date:string;note:string;idempotencyKey:string}
  | {kind:'reconcile';accountId:string;targetMinor:string;date:string;reason:string;idempotencyKey:string}
  | {kind:'opening';accountId:string;amountMinor:string;date:string;transactionId:string;expectedRevision:number;idempotencyKey:string}
  | {kind:'manage';accountId:string;name:string;active:boolean};

export function AccountActionForm({
  mode,account,accounts,overview,openingRevision,onCancel,onExecute,
}:{
  mode:AccountFormMode;account:FinanceAccount;accounts:FinanceAccount[];
  overview:FinanceAccountOverview;openingRevision:number|null;
  onCancel:()=>void;onExecute:(action:FinanceAccountAction)=>Promise<void>;
}){
  const [amount,setAmount]=useState(
    mode==='opening' ? (BigInt(overview.openingMinor)/BigInt(100)).toString()+'.'+
      (BigInt(overview.openingMinor)%BigInt(100)).toString().padStart(2,'0') : ''
  );
  const [date,setDate]=useState(mode==='opening' ? (overview.openingDate??todayInTaipei()) : todayInTaipei);
  const [toId,setToId]=useState(accounts.find(a=>a.accountId!==account.accountId && a.isActive)?.accountId??'');
  const [name,setName]=useState(account.name);
  const [active,setActive]=useState(account.isActive);
  const [reason,setReason]=useState('');
  const [reviewed,setReviewed]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const busyRef=useRef(false);
  const keyRef=useRef<{fingerprint:string;key:string}|null>(null);
  const [error,setError]=useState('');

  const to=accounts.find(a=>a.accountId===toId);
  const title={
    transfer:'Transfer between accounts',
    reconcile:'Match an observed balance',
    opening:'Correct the opening balance',
    manage:'Manage account details'
  }[mode];

  const clearReview=()=>{setReviewed(null);setError('');};
  function stableKey(fingerprint:string){
    if(keyRef.current?.fingerprint!==fingerprint)keyRef.current={fingerprint,key:crypto.randomUUID()};
    return keyRef.current.key;
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();if(busyRef.current)return;
    setError('');
    try{
      let action:FinanceAccountAction;
      if(mode==='manage'){
        if(!name.trim())throw new Error('Account name is required.');
        action={kind:'manage',accountId:account.accountId,name:name.trim(),active};
      }else if(mode==='opening'){
        if(!overview.openingTransactionId || openingRevision===null)
          throw new Error('An opening record is required before editing.');
        const amountMinor=usableMoney(amount);
        const fingerprint=JSON.stringify({mode,accountId:account.accountId,amountMinor,date,openingRevision});
        action={kind:'opening',accountId:account.accountId,amountMinor,date,
          transactionId:overview.openingTransactionId,expectedRevision:openingRevision,
          idempotencyKey:stableKey(fingerprint)};
      }else if(mode==='reconcile'){
        const targetMinor=usableMoney(amount,true);
        const difference=(minorBigInt(targetMinor)-minorBigInt(account.balanceMinor)).toString();
        if(difference==='0')throw new Error('The manually tracked balance already matches that amount.');
        const note=reason.trim() || 'Manual balance check';
        const fingerprint=JSON.stringify({mode,accountId:account.accountId,targetMinor,date,note});
        action={kind:'reconcile',accountId:account.accountId,targetMinor,date,reason:note,
          idempotencyKey:stableKey(fingerprint)};
      }else{
        const amountMinor=usableMoney(amount);
        if(minorBigInt(amountMinor)<=BigInt(0))throw new Error('Transfer amount must be greater than zero.');
        if(!to || !to.isActive || to.accountId===account.accountId)
          throw new Error('Choose a different active destination account.');
        if(to.currency!==account.currency)
          throw new Error('Only same-currency transfers are supported.');
        const fingerprint=JSON.stringify({mode,accountId:account.accountId,toId,amountMinor,date,note:reason.trim()});
        action={kind:'transfer',fromId:account.accountId,toId,amountMinor,date,
          note:reason.trim(),idempotencyKey:stableKey(fingerprint)};
      }
      const signature=JSON.stringify(action);
      if(mode!=='manage' && reviewed!==signature){setReviewed(signature);return;}
      busyRef.current=true;setBusy(true);
      await onExecute(action);
      keyRef.current=null;
      setReviewed(null);
    }catch(e){setError(failMessage(e));}
    finally{busyRef.current=false;setBusy(false);}
  }

  let previewAmount:string|null=null;
  try {previewAmount=amount?usableMoney(amount,mode==='reconcile'):null;}catch{}
  const previewDifference=previewAmount!==null && mode==='reconcile'
    ? (minorBigInt(previewAmount)-minorBigInt(account.balanceMinor)).toString() : null;

  return (
    <section id="finance-action" aria-label={title}
      className="rounded-3xl border border-[var(--accent-border)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Account action</p>
          <h2 className="mt-1 text-lg font-black">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{account.name}</p>
        </div>
        <button type="button" onClick={onCancel} className={secondaryButton} disabled={busy}>
          <ArrowLeft size={16}/> Back
        </button>
      </div>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        {mode==='manage' ? (
          <>
            <label className={labelStyle}>Account display name
              <input className={inputStyle} value={name} maxLength={100} required
                onChange={e=>{setName(e.target.value);clearReview();}}/>
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={active}
                onChange={e=>{setActive(e.target.checked);clearReview();}} className="h-5 w-5"/>
              Account is active
            </label>
            <p className="text-xs text-[var(--muted)]">
              Accounts with non-zero tracked balances cannot be archived. Archiving never deletes their history.
            </p>
          </>
        ) : (
          <>
            {mode==='transfer' && (
              <label className={labelStyle}>Transfer to
                <select required className={inputStyle} value={toId} onChange={e=>{setToId(e.target.value);clearReview();}}>
                  <option value="">Choose destination account</option>
                  {accounts.filter(a=>a.accountId!==account.accountId && a.isActive).map(a=>(
                    <option key={a.accountId} value={a.accountId}>{a.name} ({a.currency})</option>
                  ))}
                </select>
              </label>
            )}
            <label className={labelStyle}>
              {mode==='reconcile'?'Observed current balance (NT$)':mode==='opening'?'Correct opening balance (NT$)':'Amount to transfer (NT$)'}
              <input type="text" inputMode="decimal" required autoComplete="off"
                className={inputStyle} placeholder="0.00" value={amount}
                onChange={e=>{setAmount(e.target.value);clearReview();}}/>
            </label>
            <label className={labelStyle}>
              {mode==='opening'?'Opening effective date':'Transaction date'}
              <input type="date" required max={todayInTaipei()} value={date} className={inputStyle}
                onChange={e=>{setDate(e.target.value);clearReview();}}/>
            </label>
            {(mode==='transfer'||mode==='reconcile') && (
              <label className={labelStyle}>
                {mode==='reconcile'?'Reason (optional)':'Description (optional)'}
                <input className={inputStyle} value={reason} maxLength={mode==='reconcile'?200:500}
                  onChange={e=>{setReason(e.target.value);clearReview();}}
                  placeholder={mode==='reconcile'?'Manual balance check':'e.g. cash withdrawal'}/>
              </label>
            )}
            {mode==='opening' && (
              <p className="rounded-xl bg-[var(--accent-subtle)] p-3 text-xs text-[var(--fg)]">
                This corrects the original starting amount only. It does not reconcile money missing due to later transactions.
              </p>
            )}
            {mode==='transfer' && (
              <p className="rounded-xl bg-[var(--accent-subtle)] p-3 text-xs text-[var(--fg)]">
                A transfer moves TWD between your tracked accounts. It never counts as income or monthly spending.
                Overdraft balances are allowed; check the real bank before transferring.
              </p>
            )}
            {mode==='reconcile' && previewDifference!==null && (
              <p className="rounded-xl bg-[var(--accent-subtle)] p-3 text-sm">
                Currently tracked: <strong>{formatMoney(account.balanceMinor,'TWD')}</strong>
                {' · '}Adjustment: <strong>{formatMoney(previewDifference,'TWD')}</strong>
                {' · '}After saving: <strong>{formatMoney(previewAmount!,'TWD')}</strong>
              </p>
            )}
          </>
        )}
        {reviewed && (
          <div role="status" className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-3 text-sm text-[var(--fg)]">
            <div className="flex items-center gap-2 font-bold"><CircleAlert size={17}/> Confirm your changes</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {mode==='transfer' ? 'Both account balances change atomically; your total money remains unchanged.' :
                mode==='reconcile' ? 'An adjustment will be recorded with an audit trail; past expenses remain untouched.' :
                'The original opening is updated with an auditable revision.'}
            </p>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
        <button className={mainButton} type="submit" disabled={busy}>
          {mode==='transfer'?<ArrowRightLeft size={17}/>:mode==='reconcile'?<RefreshCw size={17}/>:mode==='opening'?<PenLine size={17}/>:<Check size={17}/>}
          {busy?'Saving…':mode==='manage'?'Save account':reviewed?'Confirm and save':'Review '+(mode==='transfer'?'transfer':mode==='opening'?'opening correction':'balance correction')}
        </button>
      </form>
    </section>
  );
}
