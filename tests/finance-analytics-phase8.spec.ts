import {test,expect} from '@playwright/test';
import { analyticsRange,averageActualPerDay,netCashFlow,budgetComparison,
  sharesForGroups,sumGroupMoney,monthlyChangePercent,validateOverview,monthEndProjection,
  monthStatus,analyticsInsights,type AnalyticsOverview } from '../lib/finance/analytics-model';
import { convertInrMinorToTwd } from '../lib/finance/money';

function sample():AnalyticsOverview{
 return {
   from:'2025-10-01',to:'2025-10-31',expenseMinor:'300000',incomeMinor:'100000',
   expenseCount:4,largestMinor:'200000',firstTracked:'2025-09-29',
   categories:[
     {id:'a',code:'groceries',name:'Groceries',amountMinor:'200000',count:1},
     {id:'b',code:'outside-food',name:'Outside Food',amountMinor:'50000',count:1},
     {id:'c',code:'transportation',name:'Transport',amountMinor:'30000',count:1},
     {id:'d',code:'other',name:'Other',amountMinor:'20000',count:1}
   ],
   merchants:[
     {name:'PX Mart',amountMinor:'200000',count:1},
     {name:'FamilyMart',amountMinor:'50000',count:1},
     {name:'Bus',amountMinor:'30000',count:1},
     {name:null,amountMinor:'20000',count:1}
   ],
   accounts:[
     {id:'ctbc',name:'CTBC',amountMinor:'200000',count:1},
     {id:'cash',name:'Cash',amountMinor:'70000',count:2},
     {id:'post',name:'Post',amountMinor:'30000',count:1}
   ]
 };
}
test('3000 TWD actual, 6000 TWD budget: 3000 left, 50.00% used, groceries 66.67%',()=>{
 const o=sample();expect(()=>validateOverview(o)).not.toThrow();
 expect(sumGroupMoney(o.categories)).toBe('300000');
 expect(budgetComparison(o.expenseMinor,'600000')).toEqual({
   remainingMinor:'300000',utilization:'50.00%'
 });
 expect(sharesForGroups(o.categories,o.expenseMinor)[0]).toBe('66.67%');
 expect(sharesForGroups(o.categories,o.expenseMinor)).toEqual([
   '66.67%','16.67%','10.00%','6.66%'
 ]);
});
test('income, refunds and net cash flow keep gross expenses separate',()=>{
 expect(netCashFlow('300000','100000')).toBe('-200000');
 expect(netCashFlow('300000','105000')).toBe('-195000');
 expect(netCashFlow('300000',null)).toBeNull();
});
test('overspending remains negative and can exceed 100 percent utilization',()=>{
 expect(budgetComparison('670000','600000')).toEqual({
   remainingMinor:'-70000',utilization:'111.67%'
 });
});
test('daily averages use elapsed day count or full historical calendar days',()=>{
 const current=analyticsRange('current','2026-10-15');
 expect(current.denominatorDays).toBe(15);
 expect(averageActualPerDay('300000',current.denominatorDays)).toBe('20000');
 const previous=analyticsRange('previous','2026-10-15');
 expect(previous.denominatorDays).toBe(30);
 expect(previous.fullSingleMonth).toBe(true);
 expect(averageActualPerDay('300000',previous.denominatorDays)).toBe('10000');
});
test('last 3/6/12 months are partial through today without assuming future payments',()=>{
 expect(analyticsRange('three','2026-10-30')).toMatchObject({
   from:'2026-08-01',to:'2026-10-30',partial:true
 });
 expect(analyticsRange('six','2026-10-30').from).toBe('2026-05-01');
 expect(analyticsRange('twelve','2026-10-30').from).toBe('2025-11-01');
});
test('custom range requires dates and correct daily denominator',()=>{
 const r=analyticsRange('custom','2026-10-30','2026-10-04','2026-10-11');
 expect(r.denominatorDays).toBe(8);
 expect(r.fullSingleMonth).toBe(false);
 expect(()=>analyticsRange('custom','2026-10-30','2026-10-31','2026-10-01')).toThrow();
 expect(()=>analyticsRange('custom','2026-10-30',undefined,'2026-10-20')).toThrow();
});
test('no budget and no rows do not invent money or percentages',()=>{
 const empty={...sample(),expenseMinor:'0',expenseCount:0,largestMinor:'0',
   categories:[],merchants:[],accounts:[]};
 expect(()=>validateOverview(empty)).not.toThrow();
 expect(sharesForGroups([],empty.expenseMinor)).toEqual([]);
 expect(budgetComparison('0',null)).toMatchObject({remainingMinor:null,utilization:null});
 expect(analyticsInsights(empty,null,analyticsRange('previous','2025-11-20')))
   .toContain('No expense transactions recorded for this selection.');
});
test('group totals must reconcile; percentages allocated deterministically to exactly 100%',()=>{
 const o=sample();o.categories[0].amountMinor='200001';
 expect(()=>validateOverview(o)).toThrow(/reconcile/);
 const rows=[{amountMinor:'1'},{amountMinor:'1'},{amountMinor:'1'}];
 expect(sharesForGroups(rows,'3')).toEqual(['33.34%','33.33%','33.33%']);
});
test('INR saved manual rate maps only the budget; expense money stays TWD',()=>{
 expect(convertInrMinorToTwd('100000','4.25')).toBe('425000');
 expect(()=>convertInrMinorToTwd('100000','not a rate')).toThrow();
});
test('projection requires 7 days and genuine already-started month coverage',()=>{
 expect(monthEndProjection({monthStart:'2026-10-01',today:'2026-10-15',
   firstTracked:'2026-09-29',actualMinor:'300000'})).toBe('620000');
 expect(monthEndProjection({monthStart:'2026-10-01',today:'2026-10-06',
   firstTracked:'2026-09-29',actualMinor:'100000'})).toBeNull();
 expect(monthEndProjection({monthStart:'2026-10-01',today:'2026-10-20',
   firstTracked:'2026-10-12',actualMinor:'100000'})).toBeNull();
});
test('unknown, first-start partial and historical completed months are differentiated',()=>{
 const template={monthStart:'2025-10-01',expenseMinor:'0',incomeMinor:'0',
   budgetMinor:null,originalBudgetMinor:null,budgetCurrency:null,expenseCount:0};
 expect(monthStatus({...template,coverage:'unknown'},'2026-10-30')).toContain('unknown');
 expect(monthStatus({...template,coverage:'partial-start'},'2026-10-30')).toContain('partway');
 expect(monthStatus({...template,coverage:'recorded'},'2026-10-30')).toContain('Recorded month');
 expect(monthStatus({...template,coverage:'future'},'2026-10-30')).toContain('Future month');
});
test('hundreds of category rows reconcile without floating point addition',()=>{
 const categories=Array.from({length:500},(_,i)=>({
   id:String(i),name:'Category '+i,amountMinor:'199',count:1
 }));
 const total=sumGroupMoney(categories);
 expect(total).toBe('99500');
 expect(sharesForGroups(categories,total)).toHaveLength(500);
 expect(sharesForGroups(categories,total).reduce((s,x)=>s+BigInt(x.replace('.','').replace('%','')),BigInt(0)))
   .toBe(BigInt(10000));
});

test('month-to-month change uses exact cents, signs and safe zero-baseline handling',()=>{
 expect(monthlyChangePercent('580000','520000')).toBe('+11.54%');
 expect(monthlyChangePercent('450000','490000')).toBe('-8.16%');
 expect(monthlyChangePercent('0','0')).toBeNull();
 expect(monthlyChangePercent('50000','0')).toBeNull();
});
