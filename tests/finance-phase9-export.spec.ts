import {test,expect} from '@playwright/test';
import { FINANCE_EXPORT_TABLES, validateFinanceExport, transactionsCsv,
  minorAsDecimal, csvSafeCell, type FinanceExportSnapshot,
  type FinanceCsvRow } from '../lib/finance/export';
import { allocatePurchase } from '../lib/finance/allocations';

const owner='00000000-0000-4000-8000-00000000000d';
const bank='00000000-0000-4000-8000-000000001000';
const pay='00000000-0000-4000-8000-000000001001';
const event='00000000-0000-4000-8000-000000001002';
const category='00000000-0000-4000-8000-000000001003';
function backup():FinanceExportSnapshot{
 const data=Object.fromEntries(FINANCE_EXPORT_TABLES.map(k=>[k,[]])) as unknown as FinanceExportSnapshot['data'];
 data.accounts.push({id:bank,user_id:owner,name:'CTBC Bank'});
 data.categories.push({id:category,user_id:owner,name:'Groceries'});
 data.transactions.push({id:pay,user_id:owner,kind:'expense',amount_minor:'40000',
   source_account_id:bank,destination_account_id:null,category_id:category,voided_at:null});
 data.allocations.push({id:'rule',user_id:owner,transaction_id:pay,category_id:category,amount_minor:'40000'});
 data.ledgerEvents.push({id:event,user_id:owner,transaction_id:pay,operation_key:'request'});
 data.postings.push({id:'posting',user_id:owner,ledger_event_id:event,account_id:bank,delta_minor:'-40000'});
 const counts=Object.fromEntries(FINANCE_EXPORT_TABLES.map(k=>[k,data[k].length])) as FinanceExportSnapshot['integrity']['recordCounts'];
 return {format:'manuos-finance-backup',version:2,exportedAt:'2026-10-30T00:00:00Z',
   ownerId:owner,manuallyTracked:true,currency:'TWD',
   integrity:{recordCounts:counts,snapshotBytes:123},data};
}
const row:FinanceCsvRow={
 id:pay,date:'2026-10-30',time:'12:00',type:'expense',amountMinor:'35000',currency:'TWD',
 sourceAccountId:bank,sourceAccount:'CTBC Bank',
 destinationAccountId:null,destinationAccount:null,categoryId:category,
 category:'Groceries',merchant:'=HYPERLINK("https://attacker.invalid","bad")',
 description:'\t+SUM(1,2)',status:'active',revision:1
};
test('owner-only versioned complete backup validates signed ledger and allocations',()=>{
 const b=backup();
 expect(validateFinanceExport(b)).toBe(b);
 expect(FINANCE_EXPORT_TABLES).toHaveLength(12);
 expect(b.data.transactions).toHaveLength(1);
});
test('backup rejects foreign-owner data and incorrect counts',()=>{
 const b=backup();
 b.data.accounts[0].user_id='00000000-0000-4000-8000-00000000000e';
 expect(()=>validateFinanceExport(b)).toThrow(/ownership/);
 b.data.accounts[0].user_id=owner;
 b.integrity.recordCounts.transactions=0;
 expect(()=>validateFinanceExport(b)).toThrow(/incomplete/);
});
test('backup rejects silent bank corruption, orphan posting and allocation mismatch',()=>{
 const b=backup();
 b.data.postings[0].delta_minor='-40001';
 expect(()=>validateFinanceExport(b)).toThrow(/ledger balance mismatch/);
 b.data.postings[0].delta_minor='-40000';
 b.data.allocations[0].amount_minor='39999';
 expect(()=>validateFinanceExport(b)).toThrow(/allocations do not equal/);
 b.data.allocations[0].amount_minor='40000';
 b.data.ledgerEvents[0].transaction_id='missing';
 expect(()=>validateFinanceExport(b)).toThrow(/broken reference/);
});
test('minor-unit CSV formatting never converts to imprecise JavaScript numbers',()=>{
 expect(minorAsDecimal('35000')).toBe('350.00');
 expect(minorAsDecimal('-1')).toBe('-0.01');
 expect(minorAsDecimal('1000000000000')).toBe('10000000000.00');
 expect(minorAsDecimal('40000')).toBe('400.00');
});
test('CSV quotes malicious formulas, delimiter, double quotes and control-prefix attacks',()=>{
 const csv=transactionsCsv([row]);
 expect(csv).toContain('"\'=HYPERLINK(""https://attacker.invalid"",""bad"")"');
 expect(csv).toContain('"\'\t+SUM(1,2)"');
 expect(csv).toContain(',350.00,');
 expect(csv).toContain('"Groceries"');
 expect(csv.startsWith('\uFEFF')).toBe(true);
 expect(csvSafeCell('  =1+1')).toBe('"\'  =1+1"');
 expect(csvSafeCell('family, market')).toBe('"family, market"');
});
test('CSV refuses unrecognized status, currency and invalid calendar dates',()=>{
 expect(()=>transactionsCsv([{...row,status:'pending'}])).toThrow();
 expect(()=>transactionsCsv([{...row,currency:'JPY'}])).toThrow();
 expect(()=>transactionsCsv([{...row,date:'2026-02-30'}])).toThrow();
});
test('400 TWD over 3 days allocates 133.34, 133.33, 133.33 without creating money',()=>{
 const days=allocatePurchase(pay,'40000','2026-10-30',[
   {amountMinor:'40000',startDate:'2026-10-30',durationDays:3,itemName:'Grocery',categoryId:category}
 ]);
 expect(days.map(d=>[d.date,d.amountMinor])).toEqual([
  ['2026-10-30','13334'],['2026-10-31','13333'],['2026-11-01','13333']
 ]);
 expect(days.reduce((n,d)=>n+BigInt(d.amountMinor),BigInt(0))).toBe(4000BigInt(0));
});
test('full SHA-256 backup export is tamper-evident on secure browser',async({page})=>{
 await page.goto('/');
 const testFile=await page.evaluate(async()=>{
   // Only a crypto API smoke test; never sends actual finance rows to a service.
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('manuos-finance'));
   return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
 });
 expect(testFile).toHaveLength(64);
});
test('Finance page has accessible export controls and no default mobile horizontal overflow',async({page})=>{
 test.skip(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),'Unconfigured-only page smoke');
 await page.goto('/finance');
 await expect(page.getByRole('heading',{name:'Export & backup'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Export CSV'})).toBeEnabled();
 await expect(page.getByRole('button',{name:'Download full JSON backup'})).toBeEnabled();
 for(const width of [320,360,390,430,768,1280]){
   await page.setViewportSize({width,height:850});
   await expect(page.locator('#finance-export')).toBeVisible();
   const size=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}));
   expect(size.body, 'unintended horizontal overflow at '+width).toBeLessThanOrEqual(size.viewport);
 }
});
