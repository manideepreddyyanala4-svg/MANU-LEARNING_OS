'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Check, CircleAlert, Clock3,
  Pencil, Plus, RefreshCw, Search, Trash2, Wallet } from 'lucide-react';
import { Card, Empty } from '@/components/ui';
import { PurchaseAllocationEditor } from './purchase-allocation-editor';
import { allocationRulesForDraft, draftFromSavedRules,
  type PurchaseAllocationDraft } from '@/lib/finance/allocation-editor';
import { formatMoney, minorBigInt, parseMoney } from '@/lib/finance/money';
import { accountLedgerMatches } from '@/lib/finance/account-summary';
import { persistentFinanceOperationKey, clearConfirmedFinanceOperation } from '@/lib/finance/pending-intent';
import { todayInTaipei, formatFinanceDate, formatFinanceTimestamp } from '@/lib/finance/dates';
import { listFinanceAccounts, listAccountOverviews,
  listCategories, listFinanceHistory, listFinancePlans, listAllocationDefinitions, getFinanceTransaction,
  saveCategory, saveTransaction, voidTransaction, saveFinancePlan, saveAllocatedFinancePlan, postFinancePlan,
  type FinanceHistoryFilters, type PlannedFinanceEntry } from '@/lib/finance/repository';
import type { FinanceAccount, FinanceAccountOverview, FinanceCategory, FinanceTransaction } from '@/lib/finance/types';

const control='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const primary='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50';
const secondary='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] disabled:opacity-50';
const label='block space-y-1 text-xs font-semibold text-[var(--fg)]';
const PAGE_SIZE=15;
const QUICK_ACCOUNT='manuos.finance.lastAccount';
const QUICK_CATEGORY='manuos.finance.lastCategory';

type Mode='expense'|'income';
const INCOME_SOURCES=['Research Assistant stipend','Part-time salary','Family support','Refund','Other income'];
function errorText(e:unknown){return e instanceof Error?e.message:'Could not save the entry';}
function minorInput(minor:string){
  const n=minorBigInt(minor),minus=n<BigInt(0)?'-':'',a=n<BigInt(0)?-n:n;
  return minus+(a/BigInt(100)).toString()+'.'+(a%BigInt(100)).toString().padStart(2,'0');
}
function amountText(minor:string,kind:string){
  return (kind==='income'?'+':kind==='expense'?'-':'')+formatMoney(minor,'TWD');
}
function newKey(){return crypto.randomUUID();}
function safePreference(key:string):string|null{
 try{return typeof window==='undefined'?null:window.localStorage.getItem(key);}
 catch{return null;}
}
function dayIsFuture(date:string){return date>todayInTaipei();}
function accountLabel(id:string|null,accounts:FinanceAccount[]){
  return accounts.find(a=>a.accountId===id)?.name??'Unknown account';
}

export function FinanceTransactions(){
  const [accounts,setAccounts]=useState<FinanceAccount[]>([]);
  const [overviews,setOverviews]=useState<FinanceAccountOverview[]>([]);
  const [categories,setCategories]=useState<FinanceCategory[]>([]);
  const [rows,setRows]=useState<FinanceTransaction[]>([]);
  const [count,setCount]=useState(0);
  const [plans,setPlans]=useState<PlannedFinanceEntry[]>([]);
  const [planCount,setPlanCount]=useState(0);
  const [plansOffset,setPlansOffset]=useState(0);
  const [busy,setBusy]=useState(false);
  const busyLock=useRef(false);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [message,setMessage]=useState('');
  const [formOpen,setFormOpen]=useState(false);
  const [mode,setMode]=useState<Mode>('expense');
  const [editing,setEditing]=useState<FinanceTransaction|null>(null);
  const [editingPlan,setEditingPlan]=useState<PlannedFinanceEntry|null>(null);
  const [amount,setAmount]=useState('');
  const [accountId,setAccountId]=useState('');
  const [categoryId,setCategoryId]=useState('');
  const [newCategory,setNewCategory]=useState('');
  const [merchant,setMerchant]=useState('');
  const [note,setNote]=useState('');
  const [allocation,setAllocation]=useState<PurchaseAllocationDraft>({
    mode:'single',amountInput:'',purchaseDate:todayInTaipei(),
    startDate:todayInTaipei(),duration:'3',items:[]
  });
  const [allocationLoading,setAllocationLoading]=useState(false);
  const [allocationLoadError,setAllocationLoadError]=useState('');
  const allocationLoadToken=useRef(0);
  const [date,setDate]=useState(todayInTaipei);
  const [saveError,setSaveError]=useState('');
  const [query,setQuery]=useState('');
  const [kindFilter,setKindFilter]=useState('all');
  const [accountFilter,setAccountFilter]=useState('all');
  const [categoryFilter,setCategoryFilter]=useState('all');
  const [fromDate,setFromDate]=useState('');
  const [toDate,setToDate]=useState('');
  const [oldestFirst,setOldestFirst]=useState(false);
  const [offset,setOffset]=useState(0);
  const [filterVersion,setFilterVersion]=useState(0);
  const [historyError,setHistoryError]=useState('');
  const pendingKey=useRef<{fingerprint:string;key:string}|null>(null);
  const voidKeys=useRef<Record<string,string>>({});
  const postingKeys=useRef<Record<string,string>>({});
  const requestId=useRef(0);

  const filtered:FinanceHistoryFilters=useMemo(()=>({
    search:query,kind:kindFilter,accountId:accountFilter,categoryId:categoryFilter,
    fromDate,toDate,oldestFirst,offset,limit:PAGE_SIZE,
  }),[query,kindFilter,accountFilter,categoryFilter,fromDate,toDate,oldestFirst,offset]);

  const refresh=useCallback(async()=>{
    const token=++requestId.current;
    setLoading(true);
    try{
      const [a,o,c,h,p]=await Promise.all([
        listFinanceAccounts(),listAccountOverviews(),listCategories(),
        listFinanceHistory(filtered),listFinancePlans(plansOffset,PAGE_SIZE),
      ]);
      if(token!==requestId.current)return;
      setAccounts(a);setOverviews(o);setCategories(c);
      setRows(h.rows);setCount(h.count);setPlans(p.rows);setPlanCount(p.count);
      setLoadError('');setHistoryError('');
    }catch(e){
      if(token===requestId.current)setLoadError(errorText(e));
    }finally{if(token===requestId.current)setLoading(false);}
  },[filtered,plansOffset]);

  useEffect(()=>{
    let active=true;
    const handle=()=>{if(active)void refresh();};
    const start=window.setTimeout(handle,0);
    window.addEventListener('manuos:finance-changed',handle);
    const tracker=requestId;
    return ()=>{active=false;window.clearTimeout(start);
      window.removeEventListener('manuos:finance-changed',handle);tracker.current++;};
  },[refresh,filterVersion]);

  function resetToFirst(){
    setOffset(0);setPlansOffset(0);
  }
  function chooseMode(next:Mode,tx:FinanceTransaction|null=null,plan:PlannedFinanceEntry|null=null){
    setMode(next);setEditing(tx);setEditingPlan(plan);
    const record=tx??plan;
    const nextAmount=record?minorInput(record.amountMinor):'';
    setAmount(nextAmount);
    const nextDate=record?(tx?tx.txnDate:plan?.dueDate??todayInTaipei()):todayInTaipei();
    setAllocation({
      ...(plan?.kind==='expense'?
        draftFromSavedRules(plan.amountMinor,plan.dueDate,plan.allocationRules):
        {mode:'single' as const,startDate:nextDate,duration:'3',items:[]}),
      amountInput:nextAmount,purchaseDate:nextDate
    });
    setAllocationLoadError('');
    const token=++allocationLoadToken.current;
    if(tx?.kind==='expense'){
      setAllocationLoading(true);
      listAllocationDefinitions(tx.id)
        .then(rules=>{
          if(token!==allocationLoadToken.current)return;
          setAllocation({...draftFromSavedRules(tx.amountMinor,tx.txnDate,rules),
            amountInput:nextAmount,purchaseDate:nextDate});
        })
        .catch(e=>{if(token===allocationLoadToken.current)setAllocationLoadError(errorText(e));})
        .finally(()=>{if(token===allocationLoadToken.current)setAllocationLoading(false);});
    }else setAllocationLoading(false);
    const selected=tx?(next==='expense'?tx.sourceAccountId:tx.destinationAccountId):
      plan?.accountId??null;
    const preference=safePreference(QUICK_ACCOUNT);
    const chosen=selected??(accounts.some(a=>a.accountId===preference && a.isActive)?preference:
      accounts.find(a=>a.isActive)?.accountId??'');
    setAccountId(chosen??'');
    const cat=tx?.categoryId??plan?.categoryId??null;
    const lastCategory=safePreference(QUICK_CATEGORY);
    setCategoryId(cat??((categories.some(c=>c.id===lastCategory && !c.isArchived)?lastCategory:
      categories.find(c=>c.code==='other' && !c.isArchived)?.id??categories.find(c=>!c.isArchived)?.id)??''));
    setDate(record?(tx?tx.txnDate:plan?.dueDate??todayInTaipei()):todayInTaipei());
    setMerchant(record?.merchant??(next==='income'?'Research Assistant stipend':''));
    setNote(record?.note??'');setNewCategory('');setSaveError('');setFormOpen(true);
    pendingKey.current=null;
    requestAnimationFrame(()=>document.getElementById('quick-transaction')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  function closeForm(){
    if(busyLock.current)return;
    allocationLoadToken.current++;
    setFormOpen(false);setEditing(null);setEditingPlan(null);setSaveError('');
    pendingKey.current=null;
  }
  async function stableKey(fingerprint:string){
    const key=await persistentFinanceOperationKey(fingerprint);
    pendingKey.current={fingerprint,key};
    return key;
  }
  async function afterSave(text:string){
    setMessage(text);setSaveError('');
    allocationLoadToken.current++;
    setFormOpen(false);setEditing(null);setEditingPlan(null);resetToFirst();setFilterVersion(v=>v+1);
    window.dispatchEvent(new Event('manuos:finance-changed'));
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(busyLock.current)return;
    setSaveError('');
    try{
      if(loadError || accounts.some(a=>{
        const overview=overviews.find(o=>o.accountId===a.accountId);
        return !overview||!accountLedgerMatches(a,overview);
      }))throw new Error('Account balances need verification before recording more money. Refresh and review the account warning.');
      const amountMinor=parseMoney(amount);
      if(minorBigInt(amountMinor)<=BigInt(0))throw new Error('Enter an amount greater than zero');
      const a=accounts.find(a=>a.accountId===accountId && a.isActive);
      if(!a)throw new Error('Choose an active payment account');
      if(!overviews.find(o=>o.accountId===accountId)?.openingTransactionId)
        throw new Error('Set this account opening balance first, even if it is NT$0');
      const source=merchant.trim();
      if(!source)throw new Error(mode==='expense'?'Enter a merchant or description':'Choose an income source');
      if(source.length>200||note.length>2000)throw new Error('Description or notes are too long');
      const scheduled=dayIsFuture(date)||editingPlan!==null;
      if(editing && scheduled)throw new Error('To schedule a posted entry, void it and create a separate planned entry');
      if(editingPlan && !scheduled)throw new Error('Unexpected planned entry state');
      if(editing && editing.kind!==mode)throw new Error('Cannot change the type of an existing ledger entry');
      const categoryName=newCategory.trim();
      if(mode==='expense' && !categoryId && !categoryName)throw new Error('Choose an expense category');
      if(categoryName.length>80)throw new Error('Category name must be at most 80 characters');
      if(mode==='expense'&&(allocationLoading||allocationLoadError))
        throw new Error(allocationLoadError||'Existing grocery allocation details are still loading');
      const allocationRules=mode==='expense'?allocationRulesForDraft({
        ...allocation,amountInput:amount,purchaseDate:date
      }):[];
      const fingerprint=JSON.stringify({mode,amountMinor,accountId,categoryId,categoryName,source,note,date,
        scheduled,allocationRules,txId:editing?.id,revision:editing?.revision,planId:editingPlan?.id,
        planRevision:editingPlan?.revision});
      busyLock.current=true;setBusy(true);
      const key=await stableKey(fingerprint);
      let category=mode==='expense'?categoryId:null;
      if(mode==='expense'&&categoryName){
        // Reuse a category created by an earlier uncertain network attempt.
        const saved=await listCategories();
        const match=saved.find(c=>c.name.toLocaleLowerCase()===categoryName.toLocaleLowerCase());
        if(match){
          if(match.isArchived)throw new Error('That category is archived. Choose another name.');
          category=match.id;
        }else{
          try { category=await saveCategory(categoryName); }
          catch(e){
            const retryList=await listCategories();
            const created=retryList.find(c=>c.name.toLocaleLowerCase()===categoryName.toLocaleLowerCase() && !c.isArchived);
            if(!created)throw e;
            category=created.id;
          }
        }
      }
      if(scheduled){
        const request={
          idempotencyKey:key,kind:mode,amountMinor,dueDate:date,accountId,
          categoryId:category,merchant:source,note,
          planId:editingPlan?.id,expectedRevision:editingPlan?.revision,
        };
        if(mode==='expense'){
          await saveAllocatedFinancePlan({...request,kind:'expense',allocations:allocationRules});
        }else{
          await saveFinancePlan(request);
        }
      }else{
        await saveTransaction({
          idempotencyKey:key,kind:mode,amountMinor,txnDate:date,
          sourceAccountId:mode==='expense'?accountId:null,
          destinationAccountId:mode==='income'?accountId:null,
          categoryId:category,merchant:source,note,
          transactionId:editing?.id,expectedRevision:editing?.revision,
          allocations:mode==='expense'?allocationRules:[],
        });
      }
      // Browser preference storage must not misreport a completed ledger payment.
      try{
        window.localStorage.setItem(QUICK_ACCOUNT,accountId);
        if(mode==='expense'&&category)window.localStorage.setItem(QUICK_CATEGORY,category);
      }catch{}
      pendingKey.current=null;
      await clearConfirmedFinanceOperation(fingerprint);
      await afterSave(scheduled?
        'Scheduled entry saved. No balance or monthly spending was changed.':
        editing?'Transaction updated once; your bank balances were recalculated.':
        (mode==='expense'?'Expense saved and deducted from the chosen account.':
          'Income saved and added to the receiving account.'));
    }catch(err){
      const uncertain=/network|fetch|timeout|timed out|connection/i.test(errorText(err));
      setSaveError(errorText(err)+(uncertain?
        ' Server outcome may be uncertain. Refresh transaction history before retrying; identical form details reuse the original operation ID.':''));
    }
    finally{busyLock.current=false;setBusy(false);}
  }

  async function voidEntry(t:FinanceTransaction){
    if(busyLock.current||t.voidedAt||t.kind==='opening')return;
    if(!window.confirm('Void this '+t.kind+'? The ledger will reverse its effect and retain the audit history. This cannot be directly undone.'))return;
    const key=voidKeys.current[t.id]??newKey();voidKeys.current[t.id]=key;
    busyLock.current=true;setBusy(true);setSaveError('');
    try{
      await voidTransaction(t.id,t.revision,key);
      delete voidKeys.current[t.id];
      await afterSave('Transaction voided with a signed ledger reversal. Previous records remain auditable.');
    }catch(e){setSaveError(errorText(e));}
    finally{busyLock.current=false;setBusy(false);}
  }
  async function cancelPlan(plan:PlannedFinanceEntry){
    if(busyLock.current||plan.status!=='planned')return;
    if(!window.confirm('Cancel scheduled '+plan.kind+'? No bank balance will change.'))return;
    const key=voidKeys.current[plan.id]??newKey();voidKeys.current[plan.id]=key;
    busyLock.current=true;setBusy(true);
    try{
      await saveFinancePlan({
        idempotencyKey:key,kind:plan.kind,amountMinor:plan.amountMinor,
        dueDate:plan.dueDate,accountId:plan.accountId,categoryId:plan.categoryId,
        merchant:plan.merchant,note:plan.note,
        planId:plan.id,expectedRevision:plan.revision,cancel:true,
      });
      delete voidKeys.current[plan.id];await afterSave('Scheduled entry cancelled. No money was moved.');
    }catch(e){setSaveError(errorText(e));}
    finally{busyLock.current=false;setBusy(false);}
  }
  async function postPlan(plan:PlannedFinanceEntry){
    if(busyLock.current||plan.status!=='planned'||dayIsFuture(plan.dueDate))return;
    if(!window.confirm('Post this '+plan.kind+' to the actual bank ledger now? This will change your tracked balance.'))return;
    const key=postingKeys.current[plan.id]??newKey();postingKeys.current[plan.id]=key;
    busyLock.current=true;setBusy(true);
    try{
      await postFinancePlan(plan.id,plan.revision,key);
      delete postingKeys.current[plan.id];await afterSave('Scheduled entry posted once. Your bank ledger was updated.');
    }catch(e){setSaveError(errorText(e));}
    finally{busyLock.current=false;setBusy(false);}
  }

  useEffect(()=>{
    const open=()=>chooseMode('expense');
    const edit=(event:Event)=>{
      const id=(event as CustomEvent<{id:string}>).detail?.id;
      if(!id)return;
      getFinanceTransaction(id).then(t=>{
        if(t.kind!=='expense'||t.voidedAt)throw new Error('Only active paid expenses may be edited');
        chooseMode('expense',t);
      }).catch(e=>setSaveError(errorText(e)));
    };
    window.addEventListener('manuos:finance-open-expense',open);
    window.addEventListener('manuos:finance-edit-transaction',edit);
    return ()=>{
      window.removeEventListener('manuos:finance-open-expense',open);
      window.removeEventListener('manuos:finance-edit-transaction',edit);
    };
    // Calendar and quick launcher always reuse the Phase 4/6 editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[accounts,categories]);

  const recentMerchants=Array.from(new Set(rows.filter(r=>r.merchant.trim()).map(r=>r.merchant.trim()))).slice(0,12);
  const active=accounts.filter(a=>a.isActive);
  const noAccount=active.length===0;
  const historyPages=Math.max(1,Math.ceil(count/PAGE_SIZE));
  const currentPage=Math.floor(offset/PAGE_SIZE)+1;
  const planPages=Math.max(1,Math.ceil(planCount/PAGE_SIZE));
  const planPage=Math.floor(plansOffset/PAGE_SIZE)+1;

  return (
    <section id="finance-transactions" className="mt-8 space-y-6" aria-label="Financial transactions">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--fg)]">Money in and out</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Actual entries change your tracked balances. Future scheduled entries do not.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={primary} disabled={busy||loading||noAccount}
            onClick={()=>chooseMode('expense')}><Plus size={17}/> Add Expense</button>
          <button type="button" className={secondary} disabled={busy||loading||noAccount}
            onClick={()=>chooseMode('income')}><ArrowDownLeft size={17}/> Add Income</button>
        </div>
      </div>
      {message&&<p role="status" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--fg)]"><Check size={16} className="mr-2 inline text-emerald-600"/>{message}</p>}
      {loadError&&<p role="alert" className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--danger)]"><CircleAlert size={16} className="mr-2 inline"/>{loadError} <button type="button" className="underline" onClick={()=>void refresh()}>Retry</button></p>}
      {saveError&&!formOpen&&<p role="alert" className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--danger)]">{saveError}</p>}
      {formOpen&&(
        <Card className="scroll-mt-24" >
          <div id="quick-transaction" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[var(--fg)]">
                {editing?'Edit recorded '+mode:editingPlan?'Edit scheduled '+mode:'Add '+mode}
              </h3>
              <button type="button" className={secondary} disabled={busy} onClick={closeForm}>Close</button>
            </div>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <label className={label+' sm:col-span-2'}>Amount in NT$
                <input autoFocus type="text" inputMode="decimal" autoComplete="off" required
                  placeholder="0.00" className={control+' text-2xl font-extrabold'}
                  value={amount} onChange={e=>{setAmount(e.target.value);setAllocation(a=>({...a,amountInput:e.target.value}));}}
                  aria-label="Transaction amount"/>
              </label>
              <label className={label}>{mode==='expense'?'Payment account':'Receiving account'}
                <select required value={accountId} className={control}
                  onChange={e=>setAccountId(e.target.value)}>
                  <option value="">Choose account</option>
                  {active.map(a=><option key={a.accountId} value={a.accountId}>{a.name}</option>)}
                </select>
              </label>
              {mode==='expense'?(
                <label className={label}>Expense category
                  <select className={control} value={newCategory?'__custom':categoryId} required
                    onChange={e=>{if(e.target.value==='__custom'){setCategoryId('');setNewCategory(' ');}
                      else{setCategoryId(e.target.value);setNewCategory('');}}}>
                    <option value="">Choose category</option>
                    {categories.filter(c=>!c.isArchived).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="__custom">+ New category</option>
                  </select>
                  {newCategory!==''&&<input className={control} aria-label="New expense category"
                    value={newCategory} onChange={e=>setNewCategory(e.target.value)}
                    placeholder="Type new category name"/>}
                </label>
              ):(
                <label className={label}>Income source
                  <select className={control} value={INCOME_SOURCES.includes(merchant)?merchant:'Custom'}
                    onChange={e=>setMerchant(e.target.value==='Custom'?'':e.target.value)}>
                    {INCOME_SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
                    <option value="Custom">Custom income source</option>
                  </select>
                </label>
              )}
              <label className={label}>{mode==='expense'?'Merchant / description':'Source / description'}
                <input type="text" maxLength={200} required className={control} value={merchant}
                  list={mode==='expense'?'recent-finance-merchants':undefined}
                  onChange={e=>setMerchant(e.target.value)}
                  placeholder={mode==='expense'?'e.g. PX Mart':'e.g. RA stipend'}/>
                {mode==='expense'&&<datalist id="recent-finance-merchants">
                  {['PX Mart','FamilyMart','7-Eleven',...recentMerchants].filter((s,i,a)=>a.indexOf(s)===i)
                    .map(s=><option key={s} value={s}/>)}
                </datalist>}
              </label>
              <label className={label}>Transaction date (Taipei)
                <input required type="date" className={control} value={date}
                  onChange={e=>{
                    const value=e.target.value;
                    setDate(value);
                    setAllocation(a=>({
                      ...a,purchaseDate:value,startDate:a.startDate===date?value:a.startDate,
                      items:a.items.map(x=>({...x,startDate:x.startDate===date?value:x.startDate}))
                    }));
                  }}/>
              </label>
              {mode==='expense'&&(
                allocationLoading?
                  <p role="status" className="sm:col-span-2 text-sm text-[var(--muted)]">
                    Loading existing grocery allocation before editing…
                  </p>:
                allocationLoadError?
                  <p role="alert" className="sm:col-span-2 text-sm text-[var(--danger)]">
                    Cannot safely edit this purchase: {allocationLoadError}
                  </p>:
                  <PurchaseAllocationEditor draft={{...allocation,amountInput:amount,purchaseDate:date}}
                    onChange={setAllocation}
                    paymentAccount={accountLabel(accountId,accounts)}/>
              )}
              <label className={label+' sm:col-span-2'}>Notes (optional)
                <textarea className={control} rows={2} maxLength={2000}
                  value={note} onChange={e=>setNote(e.target.value)}/>
              </label>
              <div className="sm:col-span-2 text-sm text-[var(--muted)]">
                {dayIsFuture(date)||editingPlan?
                  <p><CalendarClock size={16} className="mr-1 inline"/> Scheduled only. The account balance and monthly actual spending will stay unchanged until you explicitly post it on or after its date.</p>:
                  <p><Wallet size={16} className="mr-1 inline"/> Saving an actual {mode} will {mode==='expense'?'subtract from':'add to'} the selected account after the server confirms the ledger write.</p>}
                {mode==='income'&&<p className="mt-1">Refund policy: refunds are separate income entries, not reversals of original expenses.</p>}
                {editing&&<p className="mt-1">Edits have revision checks. If this record predates an account reconciliation, a conflicting balance-changing edit is blocked.</p>}
              </div>
              {saveError&&<p role="alert" className="sm:col-span-2 text-sm text-[var(--danger)]">{saveError}</p>}
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button className={primary} type="submit" disabled={busy||allocationLoading||Boolean(allocationLoadError)}>
                  {busy?'Saving securely…':editing||editingPlan?'Save correction':dayIsFuture(date)?'Save schedule':'Save '+mode}
                </button>
                <button className={secondary} type="button" onClick={closeForm} disabled={busy}>Cancel</button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-lg font-bold text-[var(--fg)]">Transaction history</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">All recorded types, including transfers, adjustments and voids.</p></div>
          <button type="button" className={secondary} disabled={loading} onClick={()=>void refresh()} aria-label="Refresh transactions"><RefreshCw size={16}/></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className={label+' sm:col-span-2'}>Search merchant
            <div className="relative"><Search size={17} className="absolute left-3 top-3 text-[var(--muted)]"/>
              <input className={control+' pl-10'} value={query} onChange={e=>{setQuery(e.target.value);setOffset(0);}}
                placeholder="PX Mart, FamilyMart…" maxLength={100}/></div>
          </label>
          <label className={label}>Type
            <select className={control} value={kindFilter} onChange={e=>{setKindFilter(e.target.value);setOffset(0);}}>
              {['all','expense','income','transfer','adjustment','opening'].map(k=><option key={k} value={k}>{k==='all'?'All types':k}</option>)}
            </select>
          </label>
          <label className={label}>Account
            <select className={control} value={accountFilter} onChange={e=>{setAccountFilter(e.target.value);setOffset(0);}}>
              <option value="all">All accounts</option>
              {accounts.map(a=><option key={a.accountId} value={a.accountId}>{a.name}</option>)}
            </select>
          </label>
          <label className={label}>Category
            <select className={control} value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value);setOffset(0);}}>
              <option value="all">All categories</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className={label}>From
            <input type="date" className={control} value={fromDate}
              onChange={e=>{setFromDate(e.target.value);setOffset(0);}}/>
          </label>
          <label className={label}>To
            <input type="date" className={control} value={toDate}
              onChange={e=>{setToDate(e.target.value);setOffset(0);}}/>
          </label>
          <label className={label}>Sort
            <select className={control} value={oldestFirst?'oldest':'newest'}
              onChange={e=>{setOldestFirst(e.target.value==='oldest');setOffset(0);}}>
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
        {loading?<p role="status" className="mt-6 text-sm text-[var(--muted)]">Loading private transactions…</p>:
          rows.length===0?<div className="mt-5"><Empty title="No transactions in this view" description="Try another filter or add your first expense."/></div>:
          <div className="mt-5 divide-y divide-[var(--line)]">
            {rows.map(t=>{
              const a=t.kind==='income'?t.destinationAccountId:t.sourceAccountId;
              const category=categories.find(c=>c.id===t.categoryId)?.name??(t.kind==='income'?'Income':'—');
              return <div key={t.id} className={'flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between '+(t.voidedAt?'opacity-50':'')}>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
                    {t.kind==='income'?<ArrowDownLeft size={17}/>:t.kind==='expense'?<ArrowUpRight size={17}/>:<Clock3 size={17}/>}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-[var(--fg)]">{t.merchant||t.kind}
                      {t.voidedAt&&<span className="ml-2 text-xs font-normal">(Voided)</span>}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {formatFinanceDate(t.txnDate)} · {category} · {t.kind==='transfer'?
                        accountLabel(t.sourceAccountId,accounts)+' → '+accountLabel(t.destinationAccountId,accounts):
                        accountLabel(a,accounts)} · {t.kind}
                    </p>
                    {t.note&&<p className="mt-1 break-words text-xs text-[var(--muted)]">{t.note}</p>}
                    <details className="mt-1 text-xs text-[var(--muted)]">
                      <summary className="w-fit cursor-pointer underline">Audit details</summary>
                      <p className="mt-1">Recorded: {formatFinanceTimestamp(t.createdAt)}</p>
                      <p>Last updated: {formatFinanceTimestamp(t.updatedAt)} · Revision {t.revision}</p>
                      <p>Effective transaction date: {formatFinanceDate(t.txnDate)}</p>
                    </details>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-2">
                  <span className={'mr-auto whitespace-nowrap text-sm font-extrabold sm:mr-2 '+(t.kind==='income'?'text-emerald-600':'text-[var(--fg)]')}>
                    {amountText(t.amountMinor,t.kind)}
                  </span>
                  {!t.voidedAt&&(t.kind==='expense'||t.kind==='income')&&<>
                    <button type="button" className={secondary} aria-label={'Edit '+t.merchant} disabled={busy}
                      onClick={()=>chooseMode(t.kind as Mode,t)}><Pencil size={15}/></button>
                    <button type="button" className={secondary} aria-label={'Void '+t.merchant} disabled={busy}
                      onClick={()=>void voidEntry(t)}><Trash2 size={15}/></button>
                  </>}
                </div>
              </div>;
            })}
          </div>}
        {historyError&&<p role="alert" className="mt-3 text-xs text-[var(--danger)]">{historyError}</p>}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
          <span>Page {currentPage} of {historyPages} · {count} records</span>
          <div className="flex gap-2">
            <button type="button" className={secondary} disabled={loading||offset===0}
              onClick={()=>setOffset(v=>Math.max(0,v-PAGE_SIZE))}>Previous</button>
            <button type="button" className={secondary} disabled={loading||offset+PAGE_SIZE>=count}
              onClick={()=>setOffset(v=>v+PAGE_SIZE)}>Next</button>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div><h3 className="text-lg font-bold text-[var(--fg)]">Scheduled transactions</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              These are reminders, not money already spent. Tap Post only after the actual payment or receipt.
            </p></div>
          <CalendarClock className="shrink-0 text-[var(--muted)]" size={20}/>
        </div>
        {plans.length===0?<p className="mt-4 text-sm text-[var(--muted)]">
          Choose a future date in Add Expense or Add Income to save a scheduled entry.
        </p>:<div className="mt-3 divide-y divide-[var(--line)]">
          {plans.map(p=><div key={p.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
            <div><p className="break-words text-sm font-semibold text-[var(--fg)]">{p.merchant} · {formatMoney(p.amountMinor,'TWD')}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{formatFinanceDate(p.dueDate)} · {p.kind} · {accountLabel(p.accountId,accounts)} · {p.status}</p>
            </div>
            {p.status==='planned'&&<div className="flex flex-wrap gap-2">
              <button type="button" className={secondary} disabled={busy} onClick={()=>chooseMode(p.kind,null,p)}><Pencil size={15}/> Edit</button>
              <button type="button" className={secondary} disabled={busy} onClick={()=>void cancelPlan(p)}><Trash2 size={15}/> Cancel</button>
              {!dayIsFuture(p.dueDate)&&<button type="button" className={primary} disabled={busy}
                onClick={()=>void postPlan(p)}><Check size={15}/> Post</button>}
            </div>}
          </div>)}
        </div>}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
          <span>Page {planPage} of {planPages} · {planCount} scheduled entries</span>
          <div className="flex gap-2">
            <button type="button" className={secondary} disabled={loading||plansOffset===0}
              onClick={()=>setPlansOffset(v=>Math.max(0,v-PAGE_SIZE))}>Previous</button>
            <button type="button" className={secondary} disabled={loading||plansOffset+PAGE_SIZE>=planCount}
              onClick={()=>setPlansOffset(v=>v+PAGE_SIZE)}>Next</button>
          </div>
        </div>
      </Card>
    </section>
  );
}
