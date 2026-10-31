import { test,expect } from '@playwright/test';
import { validateFinanceBackup,financeTransactionsCsv,packageFinanceBackup,
 validateIntegrityReport,validateBackupAgainstReport } from '../lib/finance/backup';

const owner='00000000-0000-4000-8000-00000000000d';
function mock(){
 const account='00000000-0000-4000-8000-000000000010';
 const category='00000000-0000-4000-8000-000000000011';
 const transaction='00000000-0000-4000-8000-000000000012';
 const event='00000000-0000-4000-8000-000000000013';
 return {
   format:'manuos-finance-full-backup',version:2,exportedAt:'2026-10-30T01:00:00Z',
   ownerId:owner,source:'manual',preferences:{user_id:owner,timezone:'Asia/Taipei'},
   accounts:[{id:account,user_id:owner,name:'CTBC',code:'ctbc'}],
   categories:[{id:category,user_id:owner,name:'Groceries'}],
   fxRates:[],monthlyBudgets:[],
   transactions:[{id:transaction,user_id:owner,kind:'expense',amount_minor:'40000',
     txn_date:'2025-10-30',source_account_id:account,destination_account_id:null,
     category_id:category,currency:'TWD',merchant:'=HYPERLINK("evil")',
     note:'"memo",\n+SUM(1,2)',voided_at:null,revision:1}],
   allocations:[{id:'r',user_id:owner,transaction_id:transaction,
     amount_minor:'40000',duration_days:3,category_id:category,
     start_date:'2025-10-30',item_name:'Veg'}],
   ledgerEvents:[{id:event,user_id:owner,transaction_id:transaction}],
   postings:[{user_id:owner,ledger_event_id:event,account_id:account,delta_minor:'-40000'}],
   auditEvents:[],plannedEntries:[],planOperations:[]
 };
}
test('complete backup validates every collection and original relationship',()=>{
 const {check}=validateFinanceBackup(mock());
 expect(check.counts.transactions).toBe(1);
 expect(check.counts.allocations).toBe(1);
 expect(check.counts.postings).toBe(1);
 expect(check.totalActiveExpenseMinor).toBe('40000');
});
test('backup rejects truncated data, foreign owner and broken references',()=>{
 const a=mock() as Record<string,unknown>;
 delete a.ledgerEvents;
 expect(()=>validateFinanceBackup(a)).toThrow(/Incomplete finance backup/);
 const b=mock();b.transactions[0].user_id='another-owner';
 expect(()=>validateFinanceBackup(b)).toThrow(/another user/);
 const c=mock();c.postings[0].account_id='missing';
 expect(()=>validateFinanceBackup(c)).toThrow(/broken finance relationships/);
 const d=mock();d.allocations[0].amount_minor='39999';
 expect(()=>validateFinanceBackup(d)).toThrow(/broken finance relationships/);
});
test('CSV protects both merchant and note spreadsheet injection, and safely quotes fields',()=>{
 const {backup}=validateFinanceBackup(mock());
 const csv=financeTransactionsCsv(backup);
 expect(csv).toContain("'=HYPERLINK");
 expect(csv).toContain("'+SUM(1,2)");
 expect(csv).toContain('""memo""');
 expect(csv).toContain('NT$400.00');
 expect(csv).toContain('Recorded');
 expect(financeTransactionsCsv(backup,'2025-11-01','2025-11-30').split('\r\n').length).toBe(2);
 expect(()=>financeTransactionsCsv(backup,'2025-11-02','2025-11-01')).toThrow();
});
test('full backup SHA256 envelope is generated without remote analytics service',async()=>{
 const {backup,check}=validateFinanceBackup(mock());
 const {json,sha256}=await packageFinanceBackup(backup,check);
 expect(sha256).toMatch(/^[0-9a-f]{64}$/);
 const outer=JSON.parse(json);
 expect(outer.backup.ownerId).toBe(owner);
 expect(outer.counts.transactions).toBe(1);
 expect(outer.integrity.payloadSha256).toBe(sha256);
});
test('integrity report compares owner counts to prevent inconsistent export snapshot',()=>{
 const {check}=validateFinanceBackup(mock());
 const r=validateIntegrityReport({
   ownerId:owner,checkedAt:'2026-10-30T01:00:00Z',
   transactionCount:1,ledgerEventCount:1,postingCount:1,
   accountMismatchCount:0,allocationMismatchCount:0,
   orphanPostingCount:0,duplicateOperationKeyCount:0,healthy:true
 });
 expect(()=>validateBackupAgainstReport(check,r,owner)).not.toThrow();
 expect(()=>validateBackupAgainstReport(check,{...r,transactionCount:2},owner))
   .toThrow(/changed while exporting/);
 expect(()=>validateBackupAgainstReport(check,{...r,healthy:false},owner))
   .toThrow(/discrepancy/);
});

test('Finance navigation and export are responsive at 320, 360, 390 and 430 CSS pixels',async({page})=>{
 test.skip(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),'Authenticated browser device testing requires Supabase staging');
 await page.goto('/finance');
 await expect(page.getByRole('heading',{name:'Your money, clearly.'})).toBeVisible();
 for(const width of [320,360,390,430]){
   await page.setViewportSize({width,height:740});
   await expect(page.getByRole('navigation',{name:'Finance sections'})).toBeVisible();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
   expect(overflow, 'horizontal overflow at '+width+' CSS pixels').toBe(false);
 }
 await page.getByRole('button',{name:'Data & backups'}).click();
 await expect(page.getByRole('heading',{name:'Finance data and backups'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Download complete verified backup'})).toBeDisabled();
 await page.getByRole('button',{name:'Transactions',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Money in and out'})).toBeVisible();
});


test('transfer and expense retry keys survive refresh semantics without storing original money details',async()=>{
 const {persistentFinanceOperationKey,clearConfirmedFinanceOperation}=
   await import('../lib/finance/pending-intent');
 const data=new Map<string,string>();
 const fakeStorage={
   getItem:(key:string)=>data.get(key)??null,
   setItem:(key:string,value:string)=>{data.set(key,value);},
   removeItem:(key:string)=>{data.delete(key);}
 };
 const original=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{
   configurable:true,value:{sessionStorage:fakeStorage}
 });
 try{
   const input='{"amount":"12345","merchant":"private grocery store"}';
   const first=await persistentFinanceOperationKey(input,'account');
   const replay=await persistentFinanceOperationKey(input,'account');
   const separate=await persistentFinanceOperationKey(input,'transaction');
   expect(replay).toBe(first);
   expect(separate).not.toBe(first);
   expect([...data.values()].join(' ')).not.toContain('private grocery store');
   expect([...data.values()].join(' ')).not.toContain('12345');
   await clearConfirmedFinanceOperation(input,'account');
   expect(await persistentFinanceOperationKey(input,'account')).not.toBe(first);
 }finally{
   if(original)Object.defineProperty(globalThis,'window',original);
   else Reflect.deleteProperty(globalThis,'window');
 }
});

test('multiple unresolved financial intents retain independent retry UUIDs',async()=>{
 const {persistentFinanceOperationKey,clearConfirmedFinanceOperation}=
   await import('../lib/finance/pending-intent');
 const data=new Map<string,string>();
 const fakeStorage={
   getItem:(key:string)=>data.get(key)??null,
   setItem:(key:string,value:string)=>{data.set(key,value);},
   removeItem:(key:string)=>{data.delete(key);}
 };
 const original=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{
   configurable:true,value:{sessionStorage:fakeStorage}
 });
 try{
   const a=JSON.stringify({account:'ctbc',amount:'45000',merchant:'Private grocery'});
   const b=JSON.stringify({account:'post',amount:'2500',merchant:'Private lunch'});
   const keyA=await persistentFinanceOperationKey(a);
   const keyB=await persistentFinanceOperationKey(b);
   expect(keyB).not.toBe(keyA);
   expect(await persistentFinanceOperationKey(a)).toBe(keyA);
   expect(await persistentFinanceOperationKey(b)).toBe(keyB);
   expect([...data.values()].join(' ')).not.toContain('Private grocery');
   expect([...data.values()].join(' ')).not.toContain('Private lunch');
   expect([...data.values()].join(' ')).not.toContain('45000');
   await clearConfirmedFinanceOperation(b);
   expect(await persistentFinanceOperationKey(a)).toBe(keyA);
   expect(await persistentFinanceOperationKey(b)).not.toBe(keyB);
   // Existing Phase 9 sessionStorage contents are upgraded without a duplicate.
   const digest=(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(a)));
   const hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
   data.set('manuos.finance.unconfirmedOperation.v1.account',JSON.stringify({digest:hash,key:keyA}));
   expect(await persistentFinanceOperationKey(a,'account')).toBe(keyA);
 }finally{
   if(original)Object.defineProperty(globalThis,'window',original);
   else Reflect.deleteProperty(globalThis,'window');
 }
});
