'use client';

import { useState } from 'react';
import { CheckCircle2, CircleAlert, Download, FileJson, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui';
import { financeExportSnapshot, financeExportTransactionRows } from '@/lib/finance/repository';
import { backupJsonWithHash, downloadFinanceFile, transactionsCsv } from '@/lib/finance/export';
import { assertISODate } from '@/lib/finance/allocations';

const control='min-h-11 w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';
const button='inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:w-auto';
function readable(error:unknown){return error instanceof Error?error.message:'Unable to export finance data';}
function safeTime(){return new Date().toISOString().replace(/[:.]/g,'-');}

export function FinanceDataExport(){
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [busy,setBusy]=useState<'csv'|'json'|null>(null);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');

  async function run(kind:'csv'|'json'){
    if(busy)return;
    setBusy(kind);setError('');setNotice('');
    try{
      if(kind==='csv'){
        if(from)assertISODate(from);
        if(to)assertISODate(to);
        if(from&&to&&from>to)throw new Error('Choose a valid inclusive date range');
        const rows=await financeExportTransactionRows(from||null,to||null);
        const csv=transactionsCsv(rows);
        downloadFinanceFile(csv,'manuos-finance-transactions-'+safeTime()+'.csv','text/csv;charset=utf-8');
        setNotice('CSV download started: '+rows.length+' recorded transactions, including voided history. Check your Downloads folder.');
      }else{
        const snapshot=await financeExportSnapshot();
        const file=await backupJsonWithHash(snapshot);
        downloadFinanceFile(file,'manuos-finance-backup-'+safeTime()+'.json','application/json;charset=utf-8');
        const total=Object.values(snapshot.integrity.recordCounts).reduce((a,b)=>a+b,0);
        setNotice('Full backup download started: '+total+' owner-scoped records across 12 tables. Check your Downloads folder and store the file privately.');
      }
    }catch(e){setError(readable(e));}
    finally{setBusy(null);}
  }

  return (
    <section id="finance-export" className="mt-8 scroll-mt-24 space-y-4" aria-labelledby="finance-export-heading">
      <div>
        <h2 id="finance-export-heading" className="text-xl font-extrabold text-[var(--fg)]">Export & backup</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Take a private copy of your manually tracked finances, without sharing bank credentials or using a third-party finance service.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-[var(--accent)]"/>
            <h3 className="text-base font-bold">Transaction CSV</h3>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Download individual entries with account and category names. Includes income, expenses, transfers, reconciliations, opening records and voided transactions. Dates are inclusive.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[var(--fg)]">From (optional)
              <input type="date" className={'mt-1 '+control} value={from} max={to||undefined} onChange={e=>setFrom(e.target.value)}/>
            </label>
            <label className="text-xs font-semibold text-[var(--fg)]">To (optional)
              <input type="date" className={'mt-1 '+control} value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/>
            </label>
          </div>
          <button type="button" disabled={busy!==null} className={button+' mt-4'} onClick={()=>void run('csv')}>
            <Download size={17}/>{busy==='csv'?'Preparing CSV…':'Export CSV'}
          </button>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Spreadsheet formula protection is applied to all text columns. Amounts remain exact decimal TWD; this is not a bank statement.
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <FileJson size={20} className="text-[var(--accent)]"/>
            <h3 className="text-base font-bold">Complete finance backup (JSON)</h3>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            One authenticated database snapshot containing accounts, full transaction and journal history, corrections, budgets, rates, categories, allocations, scheduled entries, preferences, and audit trails.
          </p>
          <div className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)]">
            <ShieldCheck size={18} className="shrink-0 text-[var(--success)]"/>
            <span>Ownership, record counts, account ledger totals and allocation sums are checked before download. The file includes a SHA-256 integrity hash.</span>
          </div>
          <button type="button" disabled={busy!==null} className={button+' mt-4'} onClick={()=>void run('json')}>
            <Download size={17}/>{busy==='json'?'Verifying backup…':'Download full JSON backup'}
          </button>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Keep this sensitive file in a private, encrypted location. Safe automatic restore is not enabled; importing requires a separately audited recovery process.
          </p>
        </Card>
      </div>
      {error&&<p role="alert" className="flex gap-2 rounded-xl border border-[var(--danger)]/40 p-3 text-sm text-[var(--danger)]">
        <CircleAlert size={18} className="shrink-0"/><span>{error}. Nothing was downloaded as a verified backup.</span>
      </p>}
      {notice&&<p role="status" className="flex gap-2 rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--fg)]">
        <CheckCircle2 size={18} className="shrink-0 text-[var(--success)]"/><span>{notice}</span>
      </p>}
    </section>
  );
}
