import { minorBigInt } from './money';
import { assertISODate } from './allocations';

export const FINANCE_EXPORT_TABLES = [
  'preferences','accounts','categories','fxRates','monthlyBudgets',
  'transactions','allocations','ledgerEvents','postings','auditEvents',
  'plannedEntries','planOperations',
] as const;
type TableName = typeof FINANCE_EXPORT_TABLES[number];
type Row = Record<string, unknown>;

export type FinanceExportSnapshot = {
  format: 'manuos-finance-backup';
  version: 2;
  exportedAt: string;
  ownerId: string;
  manuallyTracked: boolean;
  currency: 'TWD';
  integrity: { recordCounts: Record<TableName, number>; snapshotBytes: number };
  data: Record<TableName, Row[]>;
};
export type FinanceCsvRow = {
  id:string;date:string;time:string;type:string;amountMinor:string;currency:string;
  sourceAccountId:string|null;sourceAccount:string|null;
  destinationAccountId:string|null;destinationAccount:string|null;
  categoryId:string|null;category:string|null;merchant:string;description:string;
  status:string;revision:number;
};
function object(value:unknown):value is Row{
  return value!==null&&typeof value==='object'&&!Array.isArray(value);
}
function safeText(value:unknown):string{
  return value===null||value===undefined?'':String(value);
}
export function validateFinanceExport(raw:unknown):FinanceExportSnapshot {
  if(!object(raw)||raw.format!=='manuos-finance-backup'||raw.version!==2||
    raw.manuallyTracked!==true||raw.currency!=='TWD'||
    typeof raw.ownerId!=='string'||typeof raw.exportedAt!=='string'||
    !object(raw.integrity)||!object(raw.data))
    throw new Error('Unexpected finance backup schema; no file was created');
  const owner=raw.ownerId;
  const counts=raw.integrity.recordCounts;
  if(!object(counts))throw new Error('Backup counts are missing');
  const data=raw.data;
  for(const table of FINANCE_EXPORT_TABLES){
    const list=data[table];
    if(!Array.isArray(list)||!Number.isSafeInteger(counts[table])||
      counts[table]!==list.length||list.some(x=>!object(x)||x.user_id!==owner))
      throw new Error('Backup incomplete or ownership mismatch in '+table);
  }
  const ids=(table:TableName)=>new Set((data[table] as Row[]).map(x=>safeText(x.id)));
  const accounts=ids('accounts'),categories=ids('categories'),transactions=ids('transactions');
  const rates=ids('fxRates'),events=ids('ledgerEvents');
  const nullable=(value:unknown,known:Set<string>)=>value==null||known.has(safeText(value));
  const needs=(value:unknown,known:Set<string>,table:string)=>{
    if(!known.has(safeText(value)))throw new Error('Backup broken reference in '+table);
  };
  const validMoney=(value:unknown)=>{
    if(typeof value!=='string')throw new Error('Backup money must be an exact string');
    return minorBigInt(value);
  };
  const expected=new Map<string,bigint>(),actual=new Map<string,bigint>();
  for(const row of data.accounts as Row[]){
    expected.set(safeText(row.id),0n);actual.set(safeText(row.id),0n);
  }
  for(const row of data.transactions as Row[]){
    const kind=safeText(row.kind),amount=validMoney(row.amount_minor);
    if(!nullable(row.source_account_id,accounts)||
       !nullable(row.destination_account_id,accounts)||
       !nullable(row.category_id,categories))throw new Error('Transaction refers to another account/category');
    if(row.voided_at!==null)continue;
    const src=safeText(row.source_account_id),dst=safeText(row.destination_account_id);
    const add=(id:string,n:bigint)=>{
      if(!expected.has(id))throw new Error('Active transaction references a missing account');
      expected.set(id,(expected.get(id)??0n)+n);
    };
    if(kind==='opening'||kind==='income')add(dst,amount);
    else if(kind==='expense')add(src,-amount);
    else if(kind==='transfer'){add(src,-amount);add(dst,amount);}
    else if(kind==='adjustment')add(src,amount);
    else throw new Error('Unknown active transaction kind');
  }
  for(const row of data.monthlyBudgets as Row[]){
    validMoney(row.budget_minor);validMoney(row.resolved_twd_minor);
    if(!nullable(row.fx_rate_id,rates))throw new Error('Budget references missing FX setting');
  }
  for(const row of data.allocations as Row[]){
    validMoney(row.amount_minor);needs(row.transaction_id,transactions,'allocations');
    if(!nullable(row.category_id,categories))throw new Error('Invalid allocated category');
  }
  const allocated=new Map<string,bigint>();
  for(const row of data.allocations as Row[]){
    const id=safeText(row.transaction_id);
    allocated.set(id,(allocated.get(id)??0n)+validMoney(row.amount_minor));
  }
  for(const row of data.transactions as Row[]){
    const sum=allocated.get(safeText(row.id));
    if(row.voided_at===null&&sum!==undefined&&sum!==validMoney(row.amount_minor))
      throw new Error('Grocery allocations do not equal paid amount');
    if(row.voided_at!==null&&sum!==undefined)
      throw new Error('Voided transaction retains active grocery allocations');
  }
  for(const row of data.ledgerEvents as Row[]){
    needs(row.transaction_id,transactions,'ledger events');
  }
  for(const row of data.postings as Row[]){
    needs(row.ledger_event_id,events,'postings');
    needs(row.account_id,accounts,'postings');
    const amount=validMoney(row.delta_minor),id=safeText(row.account_id);
    actual.set(id,(actual.get(id)??0n)+amount);
  }
  for(const id of expected.keys()){
    if(expected.get(id)!==actual.get(id))
      throw new Error('Export ledger balance mismatch; no backup file was created');
  }
  for(const row of data.plannedEntries as Row[]){
    validMoney(row.amount_minor);
    needs(row.account_id,accounts,'planned entries');
    if(!nullable(row.category_id,categories)||
      !nullable(row.posted_transaction_id,transactions))
      throw new Error('Scheduled entry references an unknown record');
  }
  const planIds=ids('plannedEntries');
  for(const row of data.planOperations as Row[]){
    needs(row.plan_id,planIds,'planned operation');
  }
  return raw as FinanceExportSnapshot;
}
/** Every text field is prefixed when Excel/Sheets might interpret it as a formula. */
export function csvSafeCell(value:unknown):string {
  let text=safeText(value);
  if(/^[\s\u0000-\u001f]*[=+@-]/u.test(text)||
     /^[\t\r\n]/u.test(text))text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}
export function minorAsDecimal(minor:string):string{
  const n=minorBigInt(minor);
  const negative=n<0n,abs=negative?-n:n;
  return (negative?'-':'')+(abs/100n).toString()+'.'+
    (abs%100n).toString().padStart(2,'0');
}
export function transactionsCsv(rows:FinanceCsvRow[]):string{
  const header=['Transaction ID','Date','Time','Type','Amount','Currency',
    'Source account ID','Source account','Destination account ID','Destination account',
    'Category ID','Category','Merchant','Description','Status','Revision'];
  const lines=[header.map(csvSafeCell).join(',')];
  for(const r of rows){
    if(!r.id||!['opening','income','expense','transfer','adjustment'].includes(r.type)||
      !['active','voided'].includes(r.status)||r.currency!=='TWD'||
      !Number.isSafeInteger(r.revision)||r.revision<1)
      throw new Error('Export contains invalid transaction fields');
    assertISODate(r.date);
    const amount=minorAsDecimal(r.amountMinor);
    lines.push([
      r.id,r.date,r.time,r.type,amount,r.currency,
      r.sourceAccountId,r.sourceAccount,r.destinationAccountId,r.destinationAccount,
      r.categoryId,r.category,r.merchant,r.description,r.status,r.revision
    ].map((value,i)=>i===4?amount:csvSafeCell(value)).join(','));
  }
  return '\uFEFF'+lines.join('\r\n')+'\r\n';
}
export async function backupJsonWithHash(backup:FinanceExportSnapshot):Promise<string>{
  validateFinanceExport(backup);
  if(typeof crypto==='undefined'||!crypto.subtle)
    throw new Error('Secure browser hashing unavailable; use an HTTPS connection');
  const payload=JSON.stringify(backup);
  const bytes=new TextEncoder().encode(payload);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const sha256=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
  return JSON.stringify({sha256,algorithm:'SHA-256',payload:backup},null,2)+'\n';
}
export function downloadFinanceFile(content:string,name:string,type:string):void{
  if(typeof document==='undefined')throw new Error('Browser download unavailable');
  const url=URL.createObjectURL(new Blob([content],{type}));
  try{
    const link=document.createElement('a');
    link.href=url;link.download=name;link.rel='noopener';
    document.body.appendChild(link);link.click();link.remove();
  }finally{setTimeout(()=>URL.revokeObjectURL(url),1500);}
}
