'use client';
import { useEffect,useRef,useState } from 'react';
import { FinanceAccountsWorkspace } from './accounts-workspace';
import { FinanceBudgetWorkspace } from './budget-workspace';
import { FinanceTransactions } from './transactions-workspace';
import { FinanceCalendar } from './finance-calendar';
import { FinanceAnalytics } from './finance-analytics';
import { FinanceDataOwnership } from './finance-data-ownership';
import { FinanceOverviewSnapshot } from './overview-snapshot';

type Section='overview'|'accounts'|'transactions'|'budget'|'calendar'|'analytics'|'data';
const sections:{id:Section;label:string}[]=[
 {id:'overview',label:'Overview'},{id:'accounts',label:'Accounts'},
 {id:'transactions',label:'Transactions'},{id:'budget',label:'Budget'},
 {id:'calendar',label:'Calendar'},{id:'analytics',label:'Analytics'},
 {id:'data',label:'Data & backups'}
];
type PendingAction={kind:'open'|'edit';id?:string;token:number};
function sectionFromHash():Section {
 if(typeof window==='undefined')return 'overview';
 const hash=window.location.hash.replace(/^#/,'');
 if(hash==='finance-transactions'||hash==='quick-transaction')return 'transactions';
 if(hash==='finance-budget')return 'budget';
 if(hash==='finance-calendar')return 'calendar';
 if(hash==='finance-analytics')return 'analytics';
 if(hash==='finance-data')return 'data';
 if(hash==='finance-accounts-heading')return 'accounts';
 return sections.find(s=>s.id===hash)?.id??'overview';
}

/** Only mount the visible finance workspace; the previous Finance page launched
 * five data-hungry workspaces in parallel even when only one was needed. */
export function FinanceModule(){
 const [section,setSection]=useState<Section>('overview');
 const [pending,setPending]=useState<PendingAction|null>(null);
 const sequence=useRef(0);
 useEffect(()=>{
   const update=()=>setSection(sectionFromHash());
   const timer=window.setTimeout(update,0);
   window.addEventListener('hashchange',update);
   return ()=>{window.clearTimeout(timer);window.removeEventListener('hashchange',update);};
 },[]);
 useEffect(()=>{
   const open=()=>{
     if(section==='transactions')return;
     setPending({kind:'open',token:++sequence.current});
     setSection('transactions');
     window.history.replaceState(null,'','#transactions');
   };
   const edit=(event:Event)=>{
     const id=(event as CustomEvent<{id:string}>).detail?.id;
     if(!id||section==='transactions')return;
     setPending({kind:'edit',id,token:++sequence.current});
     setSection('transactions');
     window.history.replaceState(null,'','#transactions');
   };
   window.addEventListener('manuos:finance-open-expense',open);
   window.addEventListener('manuos:finance-edit-transaction',edit);
   return ()=>{
     window.removeEventListener('manuos:finance-open-expense',open);
     window.removeEventListener('manuos:finance-edit-transaction',edit);
   };
 },[section]);
 useEffect(()=>{
   if(section!=='transactions'||!pending)return;
   const frame=window.requestAnimationFrame(()=>{
     if(pending.kind==='open')
       window.dispatchEvent(new Event('manuos:finance-open-expense'));
     else window.dispatchEvent(new CustomEvent('manuos:finance-edit-transaction',{
       detail:{id:pending.id}
     }));
     setPending(null);
   });
   return ()=>window.cancelAnimationFrame(frame);
 },[section,pending]);

 function go(next:Section){
   setSection(next);setPending(null);
   window.history.replaceState(null,'','#'+next);
   window.requestAnimationFrame(()=>document.getElementById('finance-workspaces')?.
     scrollIntoView({behavior:'smooth',block:'start'}));
 }
 return <>
   <nav aria-label="Finance sections" className="rounded-2xl border border-[var(--line)] p-2">
     <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
       {sections.map(s=><button key={s.id} type="button"
         aria-current={section===s.id?'page':undefined}
         onClick={()=>go(s.id)}
         className={'min-h-11 min-w-0 rounded-xl border px-2 py-2 text-xs font-bold leading-snug sm:px-4 sm:text-sm '+
           (section===s.id?'border-[var(--accent)] bg-[var(--accent)] text-white':
             'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]')}>
         {s.label}
       </button>)}
     </div>
     <p className="mt-2 px-1 text-xs text-[var(--muted)]">
       Sections load only when opened. Changes are saved to your authenticated ledger, not to this device.
     </p>
   </nav>
   <div id="finance-workspaces" className="scroll-mt-24 min-w-0">
     {section==='overview'&&<><FinanceAccountsWorkspace/><FinanceOverviewSnapshot/></>}
     {section==='accounts'&&<FinanceAccountsWorkspace/>}
     {section==='transactions'&&<FinanceTransactions/>}
     {section==='budget'&&<FinanceBudgetWorkspace/>}
     {section==='calendar'&&<FinanceCalendar/>}
     {section==='analytics'&&<FinanceAnalytics/>}
     {section==='data'&&<FinanceDataOwnership/>}
   </div>
 </>;
}
