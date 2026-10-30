import { minorBigInt, formatMoney } from './money';
import type { ISODate } from './types';
import { assertISODate } from './allocations';

export const FINANCE_BACKUP_FORMAT='manuos-finance-full-backup' as const;
export const FINANCE_BACKUP_VERSION=2 as const;
export const FINANCE_BACKUP_COLLECTIONS=[
  'accounts','categories','fxRates','monthlyBudgets','transactions','allocations',
  'ledgerEvents','postings','auditEvents','plannedEntries','planOperations'
] as const;
export type FinanceBackupCollection=typeof FINANCE_BACKUP_COLLECTIONS[number];
export type FinanceBackup=Record<FinanceBackupCollection,Record<string,unknown>[]> & {
  format:typeof FINANCE_BACKUP_FORMAT;version:2;exportedAt:string;ownerId:string;
  source:string;preferences:Record<string,unknown>;
};
export type FinanceIntegrityReport={
  checkedAt:string;ownerId:string;transactionCount:number;ledgerEventCount:number;
  postingCount:number;accountMismatchCount:number;allocationMismatchCount:number;
  orphanPostingCount:number;duplicateOperationKeyCount:number;healthy:boolean;
};
export type FinanceBackupCheck={
  counts:Record<FinanceBackupCollection,number>;
  transactionCount:number;totalActiveExpenseMinor:string;
  missingOwners:number;brokenReferences:number;allocationErrors:number;
};

function record(value:unknown,label:string):Record<string,unknown>{
 if(value===null||typeof value!=='object'||Array.isArray(value))
   throw new Error('Invalid finance backup '+label);
 return value as Record<string,unknown>;
}
function nonemptyId(row:Record<string,unknown>,field:string):string {
 const id=row[field];if(typeof id!=='string'||!id)
   throw new Error('Finance backup missing '+field);
 return id;
}
function rawMinor(value:unknown):bigint{
 if(typeof value!=='string')throw new Error('Backup amount is not a precision-safe string');
 return minorBigInt(value);
}

/** All financial relationships remain intact; reject a partial/truncated export.
 * PostgreSQL reads all collections in ONE consistent MVCC statement. */
export function validateFinanceBackup(value:unknown):{backup:FinanceBackup;check:FinanceBackupCheck}{
 const source=record(value,'root');
 if(source.format!==FINANCE_BACKUP_FORMAT||source.version!==FINANCE_BACKUP_VERSION)
   throw new Error('Unsupported finance backup format');
 const ownerId=nonemptyId(source,'ownerId');
 if(typeof source.exportedAt!=='string'||Number.isNaN(Date.parse(source.exportedAt)))
   throw new Error('Invalid backup timestamp');
 const preferences=record(source.preferences,'preferences');
 if(preferences.user_id!==ownerId)throw new Error('Finance preferences do not belong to owner');
 const counts={} as Record<FinanceBackupCollection,number>;
 const tables={} as Record<FinanceBackupCollection,Record<string,unknown>[]>;
 let missingOwners=0;
 for(const key of FINANCE_BACKUP_COLLECTIONS){
   const raw=source[key];
   if(!Array.isArray(raw))throw new Error('Incomplete finance backup: '+key);
   tables[key]=raw.map((v,i)=>record(v,key+' '+i));
   counts[key]=raw.length;
   for(const row of tables[key]){
     if(row.user_id!==ownerId)missingOwners++;
   }
 }
 if(missingOwners)throw new Error('Backup includes data belonging to another user');
 const accountIds=new Set(tables.accounts.map(r=>nonemptyId(r,'id')));
 const categoryIds=new Set(tables.categories.map(r=>nonemptyId(r,'id')));
 const txIds=new Set(tables.transactions.map(r=>nonemptyId(r,'id')));
 const eventIds=new Set(tables.ledgerEvents.map(r=>nonemptyId(r,'id')));
 const planIds=new Set(tables.plannedEntries.map(r=>nonemptyId(r,'id')));
 const fxIds=new Set(tables.fxRates.map(r=>nonemptyId(r,'id')));
 let brokenReferences=0,allocationErrors=0,totalActiveExpense=BigInt(0);
 const allocationSums=new Map<string,bigint>();
 const ref=(id:unknown,ids:Set<string>)=>{
   if(id!=null&&!ids.has(String(id)))brokenReferences++;
 };
 for(const t of tables.transactions){
   const amount=rawMinor(t.amount_minor);
   if(t.kind==='expense'&&t.voided_at==null)totalActiveExpense+=amount;
   ref(t.source_account_id,accountIds);ref(t.destination_account_id,accountIds);
   ref(t.category_id,categoryIds);
 }
 for(const r of tables.allocations){
   const id=nonemptyId(r,'transaction_id');
   if(!txIds.has(id))brokenReferences++;
   ref(r.category_id,categoryIds);
   const amount=rawMinor(r.amount_minor);
   const days=Number(r.duration_days);
   if(amount<=BigInt(0)||!Number.isInteger(days)||days<1||days>3650)
     allocationErrors++;
   allocationSums.set(id,(allocationSums.get(id)??BigInt(0))+amount);
 }
 for(const t of tables.transactions){
   const sum=allocationSums.get(nonemptyId(t,'id'));
   if(sum!==undefined&&(t.kind!=='expense'||sum!==rawMinor(t.amount_minor)))
     allocationErrors++;
 }
 for(const e of tables.ledgerEvents)ref(e.transaction_id,txIds);
 for(const p of tables.postings){
   ref(p.ledger_event_id,eventIds);ref(p.account_id,accountIds);
   rawMinor(p.delta_minor);
 }
 for(const b of tables.monthlyBudgets){
   rawMinor(b.budget_minor);rawMinor(b.resolved_twd_minor);
   ref(b.fx_rate_id,fxIds);
 }
 for(const p of tables.plannedEntries){
   rawMinor(p.amount_minor);ref(p.account_id,accountIds);ref(p.category_id,categoryIds);
   ref(p.posted_transaction_id,txIds);
 }
 for(const o of tables.planOperations)ref(o.plan_id,planIds);
 if(brokenReferences||allocationErrors)
   throw new Error('Backup validation found broken finance relationships or allocations');
 const check:FinanceBackupCheck={
   counts,transactionCount:tables.transactions.length,
   totalActiveExpenseMinor:totalActiveExpense.toString(),
   missingOwners,brokenReferences,allocationErrors
 };
 return {backup:source as FinanceBackup,check};
}

export function validateIntegrityReport(value:unknown):FinanceIntegrityReport{
 const v=record(value,'integrity');
 const keys=['transactionCount','ledgerEventCount','postingCount',
   'accountMismatchCount','allocationMismatchCount','orphanPostingCount',
   'duplicateOperationKeyCount'] as const;
 for(const k of keys){
   if(typeof v[k]!=='number'||!Number.isSafeInteger(v[k])||(v[k] as number)<0)
     throw new Error('Invalid finance integrity result: '+k);
 }
 if(typeof v.healthy!=='boolean')throw new Error('Invalid finance integrity state');
 return v as FinanceIntegrityReport;
}
export function validateBackupAgainstReport(
 check:FinanceBackupCheck,report:FinanceIntegrityReport,ownerId:string
){
 if(report.ownerId!==ownerId||check.counts.transactions!==report.transactionCount||
   check.counts.ledgerEvents!==report.ledgerEventCount||
   check.counts.postings!==report.postingCount)
   throw new Error('Finance records changed while exporting. Refresh and export again.');
 if(!report.healthy)throw new Error(
   'Ledger integrity check found a discrepancy. No verified backup will be generated.');
}

export type CsvFinanceRow={
 id:string;date:ISODate;kind:string;amountMinor:string;currency:string;
 fromAccount:string;toAccount:string;category:string;merchant:string;
 note:string;status:string;revision:number;
};
export function safeCsvCell(value:unknown):string{
 // Quoting is not enough to stop Excel/Sheets formula evaluation.
 const s=String(value??'').replaceAll('\u0000','');
 // Neutralize a formula prefix both at the start of a cell and after every
 // embedded newline; some spreadsheet importers treat multiline data loosely.
 const neutral=s.replace(/(^|[\r\n])([\t ]*)(?=[=+@-])/g,
   (_match,breakChar:string,indent:string)=>breakChar+"'"+indent);
 return '"'+neutral.replaceAll('"','""')+'"';
}
export function financeTransactionsCsv(backup:FinanceBackup,from?:string,to?:string):string{
 if(from)assertISODate(from);
 if(to)assertISODate(to);
 if(from&&to&&from>to)throw new Error('CSV start date follows end date');
 const accounts=new Map(backup.accounts.map(r=>[String(r.id),String(r.name??'')]));
 const categories=new Map(backup.categories.map(r=>[String(r.id),String(r.name??'')]));
 const headers=['Transaction ID','Date','Type','Amount (TWD)',
   'Currency','From account','To account','Category','Merchant',
   'Description','Status','Revision'];
 const data=[headers.map(safeCsvCell).join(',')];
 for(const t of backup.transactions){
   const date=String(t.txn_date??'');
   if(from&&date<from||to&&date>to)continue;
   assertISODate(date);
   const amount=formatMoney(rawMinor(t.amount_minor).toString(),'TWD');
   const values=[
     t.id,date,t.kind,amount,t.currency,
     t.source_account_id?accounts.get(String(t.source_account_id))??'': '',
     t.destination_account_id?accounts.get(String(t.destination_account_id))??'':'',
     t.category_id?categories.get(String(t.category_id))??'':'',
     t.merchant,t.note,t.voided_at?'Voided':'Recorded',t.revision
   ];
   data.push(values.map(safeCsvCell).join(','));
 }
 return '\uFEFF'+data.join('\r\n')+'\r\n';
}
export async function packageFinanceBackup(backup:FinanceBackup,check:FinanceBackupCheck):
 Promise<{json:string;sha256:string}>{
 const document={
   format:'manuos-finance-portable-archive',version:1,
   counts:check.counts,
   backup
 };
 const serialized=JSON.stringify(document);
 const encoded=new TextEncoder().encode(serialized);
 if(encoded.length>33554432)throw new Error('Backup too large for a single browser file');
 const digest=await crypto.subtle.digest('SHA-256',encoded);
 const sha256=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
 return {
   sha256,
   json:JSON.stringify({...document,integrity:{algorithm:'SHA-256',
      payloadSha256:sha256,description:'Accidental-corruption check, not a digital signature'}})
 };
}
