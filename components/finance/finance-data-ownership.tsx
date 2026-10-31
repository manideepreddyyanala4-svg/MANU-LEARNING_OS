'use client';

import { useEffect,useRef,useState } from 'react';
import { AlertTriangle,CheckCircle2,Download,FileJson,FileSpreadsheet,LockKeyhole,RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui';
import { financeExportSnapshot,financeIntegrityReport } from '@/lib/finance/repository';
import { financeTransactionsCsv,packageFinanceBackup,validateBackupAgainstReport,
  validateFinanceBackup,type FinanceIntegrityReport } from '@/lib/finance/backup';

const button='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-50';
const input='min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)]';
const errorMessage=(e:unknown)=>e instanceof Error?e.message:'Secure finance export unavailable';

function download(fileName:string,content:string,type:string){
 const blob=new Blob([content],{type});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),15000);
}
export function FinanceDataOwnership(){
 const [from,setFrom]=useState(''),[to,setTo]=useState('');
 const [busy,setBusy]=useState(false);
 const [diagnostic,setDiagnostic]=useState<FinanceIntegrityReport|null>(null);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const lock=useRef(false);
 const [confirmExport,setConfirmExport]=useState(false);

 async function audit(){
   if(lock.current)return;
   lock.current=true;setBusy(true);setError('');setNotice('');
   try{
     const report=await financeIntegrityReport();
     setDiagnostic(report);
     if(!report.healthy)throw new Error(
       'Ledger reconciliation detected a discrepancy. Exports should not be treated as verified until repaired.');
     setNotice('Ledger audit passed. No finance records were changed.');
   }catch(e){setError(errorMessage(e));}
   finally{lock.current=false;setBusy(false);}
 }
 async function save(kind:'csv'|'json'){
   if(lock.current)return;
   lock.current=true;setBusy(true);setError('');setNotice('');
   try{
     if(from&&to&&from>to)throw new Error('CSV start date must be before end date');
     // Read a single consistent MVCC snapshot instead of an arbitrarily truncated
     // page. Confirm it still matches an independent owner-only ledger audit.
     const snapshot=await financeExportSnapshot();
     const {backup,check}=validateFinanceBackup(snapshot);
     const report=await financeIntegrityReport();
     setDiagnostic(report);
     validateBackupAgainstReport(check,report,backup.ownerId);
     const stamp=new Date().toISOString().slice(0,10);
     if(kind==='csv'){
       const csv=financeTransactionsCsv(backup,from||undefined,to||undefined);
       download('manuos-finance-transactions-'+stamp+'.csv',csv,'text/csv;charset=utf-8');
       setNotice('Your CSV was prepared from the complete verified finance ledger. Keep it private.');
     }else{
       if(!confirmExport)throw new Error('Confirm that this complete private backup will be saved to your device.');
       const archive=await packageFinanceBackup(backup,check);
       download('manuos-finance-full-backup-'+stamp+'.json',archive.json,'application/json;charset=utf-8');
       setNotice('Complete JSON backup prepared with a SHA-256 integrity checksum. Store it securely. This is not an automatic cloud backup.');
       setConfirmExport(false);
     }
   }catch(e){setError(errorMessage(e));}
   finally{lock.current=false;setBusy(false);}
 }
 return <section id="finance-data" className="mt-8 space-y-4 scroll-mt-24" aria-label="Finance data ownership and export">
   <div>
     <h2 className="text-xl font-extrabold text-[var(--fg)]">Finance data and backups</h2>
     <p className="mt-2 text-sm text-[var(--muted)]">
       You own your manually entered transactions. The account balances shown in ManuOS
       are ledger estimates, not live bank balances or confirmations from CTBC or Post Bank.
     </p>
   </div>
   <Card>
     <div className="flex items-center gap-3">
       <LockKeyhole size={20} className="shrink-0 text-[var(--accent)]"/>
       <div>
         <h3 className="text-base font-bold text-[var(--fg)]">Read-only ledger check</h3>
         <p className="mt-1 text-xs text-[var(--muted)]">
           Checks postings, ownership references, balanced transfers and grocery rules.
           No accounts or transactions are edited.
         </p>
       </div>
     </div>
     <button type="button" className={button+' mt-4'} disabled={busy} onClick={()=>void audit()}>
       <RefreshCw size={15}/> Run ledger integrity check
     </button>
     {diagnostic&&<div className="mt-4 rounded-xl border border-[var(--line)] p-4 text-sm">
       <p className="flex items-center gap-2 font-semibold text-[var(--fg)]">
         {diagnostic.healthy?<CheckCircle2 size={18}/>:<AlertTriangle size={18}/>}
         {diagnostic.healthy?'Ledger invariants passed':'Ledger discrepancy detected'}
       </p>
       <p className="mt-2 text-xs text-[var(--muted)]">
         {diagnostic.transactionCount} transactions · {diagnostic.ledgerEventCount}
         {' '}ledger revisions · {diagnostic.postingCount} postings
       </p>
       <p className="mt-1 text-xs text-[var(--muted)]">
         Account mismatches: {diagnostic.accountMismatchCount}. Allocation mismatches:
         {' '}{diagnostic.allocationMismatchCount}. Orphan postings: {diagnostic.orphanPostingCount}.
         Duplicate operation keys: {diagnostic.duplicateOperationKeyCount}.
       </p>
     </div>}
   </Card>
   <div className="grid gap-4 lg:grid-cols-2">
     <Card>
       <div className="flex items-center gap-2">
         <FileSpreadsheet size={20} className="text-[var(--accent)]"/>
         <h3 className="text-base font-bold text-[var(--fg)]">Export transactions (CSV)</h3>
       </div>
       <p className="mt-2 text-xs text-[var(--muted)]">
         All active and voided transactions, including transfers, income and adjustments.
         Optional date range applies to the CSV rows.
         Text fields are escaped to prevent spreadsheet formulas running.
       </p>
       <div className="mt-4 grid grid-cols-2 gap-2">
         <label className="space-y-1 text-xs font-semibold text-[var(--fg)]">From (optional)
           <input type="date" className={input} value={from} onChange={e=>setFrom(e.target.value)}/></label>
         <label className="space-y-1 text-xs font-semibold text-[var(--fg)]">To (optional)
           <input type="date" className={input} value={to} onChange={e=>setTo(e.target.value)}/></label>
       </div>
       <button type="button" disabled={busy} className={button+' mt-4 w-full'}
         onClick={()=>void save('csv')}><Download size={16}/> Export verified CSV</button>
     </Card>
     <Card>
       <div className="flex items-center gap-2">
         <FileJson size={20} className="text-[var(--accent)]"/>
         <h3 className="text-base font-bold text-[var(--fg)]">Complete backup (JSON)</h3>
       </div>
       <p className="mt-2 text-xs text-[var(--muted)]">
         Preserves stable transaction IDs, account and category definitions, opening balances,
         original edits/voids, ledger postings, audit history, FX snapshots, monthly budgets,
         grocery rules and scheduled entries.
       </p>
       <label className="mt-4 flex items-start gap-2 text-sm text-[var(--fg)]">
         <input className="mt-1 h-5 w-5 accent-[var(--accent)]" type="checkbox"
           checked={confirmExport} onChange={e=>setConfirmExport(e.target.checked)}/>
         I understand this download contains my private financial information, and I will store it securely.
       </label>
       <button type="button" disabled={busy||!confirmExport}
         className={button+' mt-4 w-full'} onClick={()=>void save('json')}>
         <Download size={16}/> Download complete verified backup
       </button>
       <p className="mt-3 text-xs text-[var(--muted)]">
         The file includes a SHA-256 corruption check, not an authenticated digital signature.
         Downloads are stored by your browser and are not automatically backed up elsewhere.
       </p>
     </Card>
   </div>
   <Card>
     <h3 className="text-sm font-bold text-[var(--fg)]">Restoring data safely</h3>
     <p className="mt-2 text-sm text-[var(--muted)]">
       Automatic restore is intentionally unavailable: importing ledger and audit rows into an
       existing account without a transactional, identity-verified reconciliation process can
       duplicate payments or overwrite records. Keep the JSON file for an administrator-assisted,
       verified restore to an isolated database. No existing records will be overwritten here.
     </p>
   </Card>
   {busy&&<p role="status" className="text-sm font-semibold text-[var(--muted)]">
     Verifying the owner-scoped ledger and preparing your file… Do not close this page before your download begins.</p>}
   {error&&<p role="alert" className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--danger)]">{error}</p>}
   {notice&&<p role="status" className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--fg)]">{notice}</p>}
   <p className="text-xs text-[var(--muted)]">
     No bank login, bank password, advertising analytics or paid AI service is used by Finance exports.
     The archive is generated in your browser from your authenticated Supabase owner records.
   </p>
 </section>;
}
