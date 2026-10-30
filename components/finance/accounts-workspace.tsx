'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Banknote, CheckCircle2,
  CircleAlert, Clock3, Landmark, Pencil, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { Card, Empty } from '@/components/ui';
import { AccountActionForm, OpeningSetup,
  type AccountFormMode, type FinanceAccountAction } from './account-forms';
import { formatMoney, minorBigInt } from '@/lib/finance/money';
import { accountActivityLabel, accountLedgerMatches, expectedBalanceFromOverview,
  sumActiveAccountBalances, transactionEffectOnAccount } from '@/lib/finance/account-summary';
import { formatFinanceDate, formatFinanceTimestamp } from '@/lib/finance/dates';
import { initializeFinance, initializeOpeningBalances, listFinanceAccounts,
  listAccountOverviews, listAccountActivity, reconcileAccount, saveTransaction,
  updateFinanceAccount, voidTransaction } from '@/lib/finance/repository';
import type { AccountHistoryPage, FinanceAccount, FinanceAccountOverview,
  FinanceTransaction, OpeningBalanceEntry } from '@/lib/finance/types';

const actionButton='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-bold text-[var(--fg)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] disabled:opacity-50';
const primaryButton='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50';
type LoadState='loading'|'ready'|'error';

function AccountIcon({kind,code}:{kind:FinanceAccount['kind'];code:string}){
  if(kind==='cash')return <Wallet size={22}/>;
  return code==='post'?<Landmark size={22}/>:<Banknote size={22}/>;
}
function readableError(e:unknown):string {
  return e instanceof Error ? e.message : 'Unable to access the financial database.';
}
function transactionDate(tx:FinanceTransaction){
  return formatFinanceDate(tx.txnDate);
}
function signedMoney(value:string){
  return (minorBigInt(value)>BigInt(0)?'+':'')+formatMoney(value,'TWD');
}

export function FinanceAccountsWorkspace(){
  const [accounts,setAccounts]=useState<FinanceAccount[]>([]);
  const [overviews,setOverviews]=useState<FinanceAccountOverview[]>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [status,setStatus]=useState<LoadState>('loading');
  const [loadingMore,setLoadingMore]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const [loadError,setLoadError]=useState('');
  const [notice,setNotice]=useState('');
  const [form,setForm]=useState<AccountFormMode|null>(null);
  const [lastRefreshed,setLastRefreshed]=useState<string|null>(null);
  const [recent,setRecent]=useState<Record<string,FinanceTransaction[]>>({});
  const [history,setHistory]=useState<AccountHistoryPage>({rows:[],count:0});
  const [historyOffset,setHistoryOffset]=useState(0);
  const [historyError,setHistoryError]=useState('');
  const [historyVersion,setHistoryVersion]=useState(0);
  const loadId=useRef(0);
  const reverseKeys=useRef<Record<string,string>>({});

  const refresh=useCallback(async (bootstrap=false)=>{
    const token=++loadId.current;
    setRefreshing(true);
    try{
      if(bootstrap)await initializeFinance();
      const [accountRows,overviewRows]=await Promise.all([
        listFinanceAccounts(),listAccountOverviews()
      ]);
      const recentPairs=await Promise.all(accountRows.map(async a=>{
        const page=await listAccountActivity(a.accountId,0,2);
        return [a.accountId,page.rows] as const;
      }));
      if(token!==loadId.current)return false;
      setAccounts(accountRows);
      setOverviews(overviewRows);
      setRecent(Object.fromEntries(recentPairs));
      setSelectedId(id=>accountRows.find(a=>a.accountId===id)?.accountId
        ??accountRows.find(a=>a.code==='post')?.accountId
        ??accountRows.find(a=>a.isActive)?.accountId
        ??accountRows[0]?.accountId??null);
      setHistoryVersion(v=>v+1);
      setLastRefreshed(new Date().toISOString());
      setLoadError('');
      setStatus('ready');
      return true;
    }catch(e){
      if(token!==loadId.current)return false;
      setLoadError(readableError(e));
      if(bootstrap||status!=='ready')setStatus('error');
      // Existing displayed balances remain clearly stale if reload fails.
      return false;
    }finally{
      if(token===loadId.current)setRefreshing(false);
    }
  },[status]);

  useEffect(()=>{
    // Schedule bootstrap outside the synchronous body of the effect.
    const start=window.setTimeout(()=>{void refresh(true);},0);
    const onVisibility=()=>{
      if(document.visibilityState==='visible')void refresh();
    };
    const requestTracker=loadId;
    document.addEventListener('visibilitychange',onVisibility);
    return ()=>{
      window.clearTimeout(start);
      requestTracker.current++;
      document.removeEventListener('visibilitychange',onVisibility);
    };
    // Initial bootstrap once per mount. Subsequent refreshes are explicit or visibility-triggered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    const reload=()=>{void refresh();};
    window.addEventListener('manuos:finance-changed',reload);
    return ()=>window.removeEventListener('manuos:finance-changed',reload);
  },[refresh]);

  const overviewByAccount=useMemo(()=>new Map(overviews.map(o=>[o.accountId,o])),[overviews]);
  const selected=accounts.find(a=>a.accountId===selectedId)??accounts[0];
  const selectedOverview=selected?overviewByAccount.get(selected.accountId):undefined;
  const mismatches=accounts.filter(a=>{
    const overview=overviewByAccount.get(a.accountId);
    return !overview||!accountLedgerMatches(a,overview);
  });
  const safeToWrite=status==='ready' && !refreshing && mismatches.length===0 && !loadError;
  const total=useMemo(()=>sumActiveAccountBalances(accounts),[accounts]);
  const missing=accounts.filter(a=>a.isActive && !overviewByAccount.get(a.accountId)?.openingTransactionId);
  const archived=accounts.filter(a=>!a.isActive);

  useEffect(()=>{
    if(!selected?.accountId)return;
    let current=true;
    const accountId=selected.accountId;
    const start=window.setTimeout(()=>{
      if(!current)return;
      setHistoryError('');
      setLoadingMore(true);
      listAccountActivity(accountId,historyOffset,20)
        .then(data=>{if(current)setHistory(data);})
        .catch(e=>{if(current)setHistoryError(readableError(e));})
        .finally(()=>{if(current)setLoadingMore(false);});
    },0);
    return ()=>{current=false;window.clearTimeout(start);};
  },[selected?.accountId,historyOffset,historyVersion]);

  function pickAccount(id:string){
    setSelectedId(id);setHistoryOffset(0);setForm(null);setNotice('');
  }
  function openForm(mode:AccountFormMode,accountId:string){
    setSelectedId(accountId);setHistoryOffset(0);setForm(mode);setNotice('');
    requestAnimationFrame(()=>document.getElementById('finance-action')?.scrollIntoView({
      behavior:'smooth',block:'start'
    }));
  }

  async function refreshAfterWrite(message:string){
    setNotice(message);
    setForm(null);
    window.dispatchEvent(new Event('manuos:finance-changed'));
    const reloaded=await refresh();
    if(!reloaded) {
      // A confirmed save is not retried because refreshing the screen failed.
      setNotice(message+' The latest account totals could not be reloaded; refresh before making another change.');
    }
  }

  async function saveOpeningBalances(entries:OpeningBalanceEntry[]){
    await initializeOpeningBalances(entries);
    await refreshAfterWrite('Opening balances were saved to your private finance ledger.');
  }

  async function executeAccountAction(action:FinanceAccountAction){
    switch(action.kind){
      case 'transfer':
        await saveTransaction({
          idempotencyKey:action.idempotencyKey,kind:'transfer',
          amountMinor:action.amountMinor,txnDate:action.date,
          sourceAccountId:action.fromId,destinationAccountId:action.toId,
          note:action.note,merchant:'Account transfer',
        });
        await refreshAfterWrite('Transfer recorded in both accounts. Total money is unchanged.');
        return;
      case 'reconcile':
        await reconcileAccount(action.accountId,action.targetMinor,action.reason,
          action.date,action.idempotencyKey);
        await refreshAfterWrite('Reconciliation saved. Previous expenses remain unchanged.');
        return;
      case 'opening':
        await saveTransaction({
          idempotencyKey:action.idempotencyKey,kind:'opening',
          amountMinor:action.amountMinor,txnDate:action.date,
          destinationAccountId:action.accountId,
          note:'Corrected opening balance',merchant:'Opening balance',
          transactionId:action.transactionId,expectedRevision:action.expectedRevision,
        });
        await refreshAfterWrite('Opening balance corrected with a revision history.');
        return;
      case 'manage':
        await updateFinanceAccount(action.accountId,action.name,action.active);
        await refreshAfterWrite('Account settings updated.');
        return;
    }
  }

  async function reverseAdjustment(t:FinanceTransaction){
    if(t.kind!=='adjustment'||t.voidedAt||!safeToWrite)return;
    if(!window.confirm(
      'Reverse this balance adjustment? This does not delete the record. '+
      'Your tracked account balance will change by the opposite amount.'
    ))return;
    const key=reverseKeys.current[t.id]??crypto.randomUUID();
    reverseKeys.current[t.id]=key;
    try{
      await voidTransaction(t.id,t.revision,key);
      delete reverseKeys.current[t.id];
      await refreshAfterWrite('Adjustment reversed. An auditable void was recorded.');
    }catch(e){setLoadError(readableError(e));}
  }

  if(status==='loading')return (
    <div aria-live="polite" className="space-y-4">
      <div className="h-36 animate-pulse rounded-3xl bg-[var(--line-subtle)]"/>
      <div className="grid gap-4 lg:grid-cols-3">
        {[0,1,2].map(i=><div key={i} className="h-48 animate-pulse rounded-2xl bg-[var(--line-subtle)]"/>)}
      </div>
      <p className="text-sm text-[var(--muted)]">Loading authenticated balances…</p>
    </div>
  );

  if(status==='error')return (
    <Card>
      <div role="alert" className="space-y-3">
        <div className="flex items-center gap-3 text-[var(--danger)]">
          <CircleAlert size={22}/><h2 className="text-lg font-black">Finance is not available yet</h2>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Your account data could not be loaded. The finance migrations may not have been
          applied to this Supabase project, or the connection or sign-in may be unavailable.
          No placeholder money is shown.
        </p>
        <p className="break-words text-xs text-[var(--danger)]">{loadError}</p>
        <button className={actionButton} type="button" onClick={()=>void refresh(true)}>
          <RefreshCw size={16}/> Retry secure connection
        </button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <section id="finance-overview" aria-label="Finance overview and manually tracked total" className="scroll-mt-24 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
              <ShieldCheck size={15} className="text-[var(--accent)]"/> Manually tracked • TWD
            </p>
            <h2 className="mt-3 text-sm font-semibold text-[var(--muted)]">Total available money</h2>
            <p className="mt-1 break-words text-4xl font-black tracking-tight text-[var(--fg)] sm:text-5xl"
              aria-label={'Total tracked money '+formatMoney(total,'TWD')}>
              {formatMoney(total,'TWD')}
            </p>
            <p className="mt-3 max-w-xl text-xs leading-5 text-[var(--muted)]">
              Sum of all active TWD accounts. Estimates based only on transactions you record.
              This is <strong>not verified by any bank.</strong> An account may show a balance
              before its opening balance is entered; complete setup to make totals meaningful.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <button type="button" className={actionButton} disabled={refreshing}
              onClick={()=>void refresh()}><RefreshCw size={16} className={refreshing?'animate-spin':''}/>
              Refresh balances
            </button>
            <p className="text-xs text-[var(--muted)]">
              {lastRefreshed?'Updated '+formatFinanceTimestamp(lastRefreshed):'Not loaded'}
            </p>
          </div>
        </div>
      </section>

      {loadError && <div role="alert" className="rounded-xl border border-[var(--danger)]/30 bg-[var(--surface)] p-4 text-sm text-[var(--danger)]">
        Refresh failed: {loadError}. Do not trust displayed amounts until refreshed.
      </div>}
      {mismatches.length>0 && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-[var(--danger)]/40 p-4 text-sm text-[var(--danger)]">
          <CircleAlert size={20} className="shrink-0"/>
          The account breakdown disagrees with the ledger for {mismatches.map(a=>a.name).join(', ')}.
          Financial edits are paused until the discrepancy is investigated.
        </div>
      )}
      {notice && <div role="status"
        className="flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--fg)]">
        <CheckCircle2 size={18} className="shrink-0 text-[var(--success)]"/>{notice}
      </div>}

      <section aria-labelledby="finance-accounts-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="finance-accounts-heading" className="text-xl font-black">Your accounts</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Select an account to inspect its activity and correct balances.</p>
          </div>
          <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
            {accounts.filter(a=>a.isActive).length} active accounts
          </span>
        </div>
        {accounts.length===0?(
          <Empty title="No financial accounts" description="Your private account setup was not returned. Refresh or contact the database administrator."/>
        ):(
          <div className="grid gap-4 lg:grid-cols-3">
            {accounts.filter(a=>a.isActive).map(a=>{
              const overview=overviewByAccount.get(a.accountId);
              const chosen=selected?.accountId===a.accountId;
              const items=recent[a.accountId]??[];
              return (
                <article key={a.accountId} className={'rounded-2xl border bg-[var(--surface)] p-5 shadow-2xs sm:p-6 '+
                  (chosen?'border-[var(--accent)] ring-1 ring-[var(--accent-border)]':'border-[var(--line)]')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                      <AccountIcon kind={a.kind} code={a.code}/>
                    </div>
                    <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted)]">
                      {a.currency}
                    </span>
                  </div>
                  <h3 className="mt-4 min-h-10 text-sm font-bold text-[var(--fg)]">{a.name}</h3>
                  <p className="mt-1 break-all text-2xl font-black tracking-tight">{formatMoney(a.balanceMinor,'TWD')}</p>
                  <div className="mt-2 text-xs text-[var(--muted)]">
                    {overview?.openingTransactionId ? 'Opening recorded' : 'Opening balance not set'}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <Clock3 size={12}/>{formatFinanceTimestamp(overview?.lastActivityAt??null)}
                  </p>
                  <div className="mt-4 min-h-14 space-y-1 border-t border-[var(--line)] pt-3">
                    {items.length ? items.map(t=>(
                      <div key={t.id} className="flex justify-between gap-3 text-[11px]">
                        <span className="min-w-0 truncate text-[var(--muted)]">{accountActivityLabel(t,a.accountId)}</span>
                        <span className="shrink-0 font-bold">{t.voidedAt?'Voided':signedMoney(transactionEffectOnAccount(t,a.accountId))}</span>
                      </div>
                    )) : <p className="text-xs text-[var(--muted)]">No transactions recorded yet.</p>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={()=>pickAccount(a.accountId)}
                      aria-pressed={chosen} className={actionButton}>View details</button>
                    <button type="button" onClick={()=>openForm('manage',a.accountId)}
                      disabled={!safeToWrite} className={actionButton}><Pencil size={15}/> Manage</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {missing.length>0 && safeToWrite && <OpeningSetup missing={missing} onSave={saveOpeningBalances}/>}

      {selected && selectedOverview && (
        <>
          <section aria-label={'Details for '+selected.name} className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">Account breakdown</p>
                  <h2 className="mt-1 text-xl font-black">{selected.name}</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    All values are calculated from saved transactions, not manually overwritten.
                  </p>
                </div>
                {accountLedgerMatches(selected,selectedOverview) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--success)]">
                    <CheckCircle2 size={16}/> Ledger matches
                  </span>
                ):(
                  <span className="text-xs font-bold text-[var(--danger)]">Mismatch</span>
                )}
              </div>
              <dl className="mt-5 space-y-3">
                {[
                  ['Opening balance',selectedOverview.openingTransactionId?selectedOverview.openingMinor:null],
                  ['Recorded income',selectedOverview.incomeMinor],
                  ['Recorded spending',(-minorBigInt(selectedOverview.expenseMinor)).toString()],
                  ['Net transfers',selectedOverview.netTransferMinor],
                  ['Balance adjustments',selectedOverview.adjustmentMinor],
                ].map(([label,value])=>(
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-[var(--line-subtle)] pb-2 text-sm">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd className="font-bold tabular-nums">{value===null?'Not set':formatMoney(value,'TWD')}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 pt-1 text-sm font-black">
                  <dt>Calculated balance</dt><dd>{formatMoney(expectedBalanceFromOverview(selectedOverview),'TWD')}</dd>
                </div>
              </dl>
              <div className="mt-4 space-y-1 text-xs text-[var(--muted)]">
                <p>Opening date: {selectedOverview.openingDate?formatFinanceDate(selectedOverview.openingDate):'Not set'}</p>
                <p>Last reconciliation: {formatFinanceTimestamp(selectedOverview.lastReconciledAt)}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedOverview.openingTransactionId && (
                  <button type="button" className={actionButton} disabled={!safeToWrite}
                    onClick={()=>openForm('opening',selected.accountId)}><Pencil size={16}/> Edit opening</button>
                )}
                <button type="button" className={actionButton} disabled={!safeToWrite||!selected.isActive}
                  onClick={()=>openForm('reconcile',selected.accountId)}><RefreshCw size={16}/> Reconcile</button>
                <button type="button" className={primaryButton} disabled={!safeToWrite||!selected.isActive}
                  onClick={()=>openForm('transfer',selected.accountId)}><ArrowRightLeft size={16}/> Transfer</button>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-black">How to keep this accurate</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Check your balance in your actual bank app or wallet occasionally.
                If the number is different, use <strong>Reconcile</strong> to record the difference
                while keeping all old entries. Only choose <strong>Edit opening</strong> if you entered
                the starting amount incorrectly.
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex gap-3 text-sm">
                  <ArrowRightLeft className="shrink-0 text-[var(--accent)]" size={18}/>
                  <span>Cash withdrawal → transfer from bank to Cash Wallet.</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <ArrowDownLeft className="shrink-0 text-[var(--accent)]" size={18}/>
                  <span>A bank-to-bank transfer changes two accounts, not total wealth.</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <ShieldCheck className="shrink-0 text-[var(--accent)]" size={18}/>
                  <span>All balances shown are manual estimates, not bank-verified.</span>
                </div>
              </div>
            </Card>
          </section>

          {form && (
            <AccountActionForm
              key={form+':'+selected.accountId+':'+(selectedOverview.openingRevision??'none')}
              mode={form} account={selected} accounts={accounts}
              overview={selectedOverview}
              openingRevision={selectedOverview.openingRevision}
              onCancel={()=>setForm(null)}
              onExecute={executeAccountAction}
            />
          )}

          <section aria-labelledby="finance-history-title">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 id="finance-history-title" className="text-xl font-black">Account history</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Includes previous corrections and voided entries for audit context.</p>
              </div>
              <span className="text-xs font-medium text-[var(--muted)]">{history.count} records</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              {historyError && <p role="alert" className="p-4 text-sm text-[var(--danger)]">{historyError}</p>}
              {loadingMore && <p className="p-4 text-xs text-[var(--muted)]">Loading account history…</p>}
              {!loadingMore && !historyError && history.rows.length===0 && (
                <p className="p-6 text-sm text-[var(--muted)]">No transactions for this account yet.</p>
              )}
              {!loadingMore && history.rows.map(t=>{
                const effect=transactionEffectOnAccount(t,selected.accountId);
                return (
                  <article key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-subtle)] px-4 py-4 last:border-b-0 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
                        {minorBigInt(effect)<BigInt(0)?<ArrowUpRight size={17}/>:<ArrowDownLeft size={17}/>}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{accountActivityLabel(t,selected.accountId)}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {transactionDate(t)} · {t.kind.replace('_',' ')}
                          {t.voidedAt?' · Voided':''}
                        </p>
                        {t.note && <p className="mt-1 max-w-xl truncate text-xs text-[var(--muted)]" title={t.note}>{t.note}</p>}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <p className={'whitespace-nowrap text-sm font-black tabular-nums '+(t.voidedAt?'text-[var(--muted)]':'text-[var(--fg)]')}>
                        {t.voidedAt?'Voided':signedMoney(effect)}
                      </p>
                      {t.kind==='adjustment' && !t.voidedAt && (
                        <button type="button" className={actionButton} disabled={!safeToWrite}
                          onClick={()=>void reverseAdjustment(t)} title="Append an audited reversal, keep history">
                          Reverse
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {history.count>20 && <div className="mt-4 flex items-center justify-between gap-2">
              <button type="button" className={actionButton} disabled={historyOffset===0||loadingMore}
                onClick={()=>setHistoryOffset(v=>Math.max(v-20,0))}>Previous</button>
              <span className="text-xs text-[var(--muted)]">
                {historyOffset+1}–{Math.min(historyOffset+20,history.count)} of {history.count}
              </span>
              <button type="button" className={actionButton}
                disabled={historyOffset+20>=history.count||loadingMore}
                onClick={()=>setHistoryOffset(v=>v+20)}>Next</button>
            </div>}
          </section>
        </>
      )}

      {archived.length>0 && (
        <section className="rounded-2xl border border-[var(--line)] p-4 sm:p-5">
          <h2 className="font-bold">Archived accounts</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Archived accounts are excluded from the available-money total, but their history is retained.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {archived.map(a=>(
              <button className={actionButton} key={a.accountId} type="button"
                onClick={()=>openForm('manage',a.accountId)}>{a.name} · Reactivate</button>
            ))}
          </div>
        </section>
      )}
      <p className="text-center text-xs text-[var(--muted)]">
        Phase 3 • Account management only. Expense and income entry will be added in Phase 4.
      </p>
    </div>
  );
}
