'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, Clock3, RefreshCw, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getBudgetForMonth, getMonthlySummary } from '@/lib/finance/repository';
import { formatMoney } from '@/lib/finance/money';
import { todayInFinanceTimezone } from '@/lib/finance/budget-dashboard';

type PendingPayment = {
  id: string;
  entry_key: string;
  budget_month: string;
  spend_date: string | null;
  description: string;
  category_hint: string;
  amount_minor: number | string;
  status: 'needs_account' | 'posted';
  linked_transaction_id: string | null;
};

type Snapshot = {
  entries: PendingPayment[];
  totalBudgetMinor: bigint;
  ledgerExpenseMinor: bigint;
};

function money(minor: bigint) {
  return formatMoney(minor.toString(), 'TWD');
}

export function FinanceReportedPayments() {
  const currentMonth = todayInFinanceTimezone('Asia/Taipei').slice(0, 7) + '-01';
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const client = createClient();
      if (!client) throw new Error('Private finance storage is unavailable.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to view your own reported payments.');

      const [query, budget, summary] = await Promise.all([
        client.from('finance_unassigned_payments')
          .select('id,entry_key,budget_month,spend_date,description,category_hint,amount_minor,status,linked_transaction_id')
          .eq('user_id', user.id)
          .eq('budget_month', currentMonth)
          .order('entry_key', { ascending: true }),
        getBudgetForMonth(currentMonth),
        getMonthlySummary(currentMonth),
      ]);
      if (query.error) throw query.error;
      setSnapshot({
        entries: (query.data ?? []) as PendingPayment[],
        totalBudgetMinor: BigInt(budget?.resolvedTwdMinor ?? '0'),
        ledgerExpenseMinor: BigInt(summary.actualExpenseMinor),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load reported payments.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    const starter = window.setTimeout(() => { void load(); }, 0);
    const onChange = () => { void load(); };
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('manuos:finance-changed', onChange);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(starter);
      window.removeEventListener('manuos:finance-changed', onChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const pending = snapshot?.entries.filter((entry) => entry.status === 'needs_account') ?? [];
  const gym = snapshot?.entries.filter((entry) => entry.category_hint === 'Gym/Health') ?? [];
  const other = snapshot?.entries.filter((entry) => entry.category_hint !== 'Gym/Health') ?? [];
  const totalPending = pending.reduce((sum, entry) => sum + BigInt(entry.amount_minor), 0n);
  const gymReported = gym.reduce((sum, entry) => sum + BigInt(entry.amount_minor), 0n);
  const otherReported = other.reduce((sum, entry) => sum + BigInt(entry.amount_minor), 0n);
  const totalBudget = snapshot?.totalBudgetMinor ?? 0n;
  const ledgerExpense = snapshot?.ledgerExpenseMinor ?? 0n;
  const available = totalBudget - ledgerExpense - totalPending;

  if (loading && !snapshot) return (
    <section aria-label="Reported payments" className="mb-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <p role="status" className="text-sm text-[var(--muted)]">Loading reported gym and daily expenses…</p>
    </section>
  );

  if (!snapshot && error) return (
    <section aria-label="Reported payments" className="mb-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>
      <button type="button" onClick={() => void load()} className="mt-2 text-sm font-bold text-[var(--accent)]">Retry</button>
    </section>
  );

  if (!snapshot || snapshot.entries.length === 0) return null;

  return (
    <section aria-label="Reported paid expenses awaiting account reconciliation"
      className="mb-5 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">November 2026 · your reported payments</p>
          <h2 className="mt-1.5 flex items-center gap-2 text-lg font-extrabold text-[var(--fg)]">
            <Wallet size={19} className="text-[var(--accent)]"/> Gym already paid · everyday spending
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Money you confirmed was spent, kept separate until you specify the payment accounts.
          </p>
        </div>
        <button type="button" disabled={loading} onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)] disabled:opacity-40">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
          <p className="text-xs font-semibold text-[var(--muted)]">Monthly limit</p>
          <p className="mt-1 text-xl font-black tabular-nums text-[var(--fg)]">{money(totalBudget)}</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
          <p className="text-xs font-semibold text-[var(--muted)]">Gym · paid</p>
          <p className="mt-1 text-xl font-black tabular-nums text-[var(--fg)]">{money(gymReported)}</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
          <p className="text-xs font-semibold text-[var(--muted)]">Other reported spending</p>
          <p className="mt-1 text-xl font-black tabular-nums text-[var(--fg)]">{money(otherReported)}</p>
        </div>
        <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent-subtle)] p-3">
          <p className="text-xs font-bold text-[var(--accent)]">Available after reported spending</p>
          <p className="mt-1 text-xl font-black tabular-nums text-[var(--fg)]">{money(available)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-[var(--fg)]">Food and daily necessities envelope</p>
          <p className="text-sm font-extrabold tabular-nums text-[var(--fg)]">{money(totalBudget - gymReported)} limit</p>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
          At a {money((totalBudget - gymReported) / 30n)} average daily target across 30 days.
          Gym is already included in the monthly limit, not an extra NT$1,000 to spend.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">Saved payment details</p>
        <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
          {snapshot.entries.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-start justify-between gap-3 bg-[var(--bg)] px-3 py-3">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                {entry.status === 'posted'
                  ? <CheckCircle2 size={17} className="mt-1 shrink-0 text-emerald-500"/>
                  : <Clock3 size={17} className="mt-1 shrink-0 text-[var(--muted)]"/>}
                <div>
                  <p className="text-sm font-semibold leading-5 text-[var(--fg)]">{entry.description}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {entry.spend_date ?? 'Date not yet confirmed'} · {entry.category_hint} ·
                    {entry.status === 'posted' ? ' matched to account ledger' : ' payment account not yet assigned'}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-mono text-sm font-extrabold tabular-nums text-[var(--fg)]">{money(BigInt(entry.amount_minor))}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs leading-5 text-[var(--muted)]">
        <CircleAlert className="mr-1 inline" size={15}/>
        Provisional planning total = monthly budget minus account-posted spending ({money(ledgerExpense)})
        and unmatched reported payments ({money(totalPending)}). This is NOT a bank balance.
        The reported payments have not been deducted from CTBC, Post Bank or Cash Wallet.
        Match them with their payment accounts before posting to avoid counting them twice.
      </p>
      {error && <p role="alert" className="text-xs text-[var(--danger)]">{error}</p>}
    </section>
  );
}
