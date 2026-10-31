import { test, expect } from '@playwright/test';
import { allocatePurchase, shiftCalendarDay } from '../lib/finance/allocations';
import { minorBigInt } from '../lib/finance/money';
import { allocationRulesForDraft, aggregateDailyCost, purchasePreview,
  draftFromSavedRules, type PurchaseAllocationDraft } from '../lib/finance/allocation-editor';
import { dailyBudgetPosition, daysInMonth } from '../lib/finance/budget';

function draft(amount:string,mode:'single'|'whole'|'items',date='2026-10-30',
 duration='3'):PurchaseAllocationDraft {
  return {mode,amountInput:amount,purchaseDate:date,startDate:date,duration,items:[]};
}
const amounts=(d:PurchaseAllocationDraft)=>aggregateDailyCost(purchasePreview(d).daily).map(x=>x.amountMinor);

test('NT$300/3, NT$800/4 and NT$500/5 remain exact in cents',()=>{
  expect(amounts(draft('300','whole'))).toEqual(['10000','10000','10000']);
  expect(amounts(draft('800','whole','2026-10-30','4'))).toEqual(['20000','20000','20000','20000']);
  expect(amounts(draft('500','whole','2026-10-30','5'))).toEqual(['10000','10000','10000','10000','10000']);
});

test('NT$400/3 assigns the extra cent to day one with no drift',()=>{
  const days=purchasePreview(draft('400','whole'));
  expect(days.daily.map(x=>x.amountMinor)).toEqual(['13334','13333','13333']);
  expect(days.daily.reduce((n,r)=>n+minorBigInt(r.amountMinor),BigInt(0))).toBe(BigInt(40000));
  expect(days.lastDate).toBe('2026-11-01');
});

test('October 30 purchase NT$450/3 costs October 300 and November 150',()=>{
  const p=purchasePreview(draft('450','whole'));
  expect(p.daily.map(x=>x.date)).toEqual(['2026-10-30','2026-10-31','2026-11-01']);
  const october=p.daily.filter(x=>x.date.startsWith('2026-10')).reduce((sum,r)=>sum+minorBigInt(r.amountMinor),BigInt(0));
  const november=p.daily.filter(x=>x.date.startsWith('2026-11')).reduce((sum,r)=>sum+minorBigInt(r.amountMinor),BigInt(0));
  expect(october).toBe(BigInt(30000));expect(november).toBe(BigInt(15000));
});

test('overlapping whole-basket and ordinary expenses aggregate without overwriting',()=>{
  const chicken=allocatePurchase('chicken','30000','2026-10-30',
    [{amountMinor:'30000',startDate:'2026-10-30',durationDays:3}]);
  const veg=allocatePurchase('veg','12000','2026-10-30',
    [{amountMinor:'12000',startDate:'2026-10-30',durationDays:3}]);
  const rice=allocatePurchase('rice','20000','2026-10-30',
    [{amountMinor:'20000',startDate:'2026-10-30',durationDays:5}]);
  const drink=allocatePurchase('drink','4000','2026-10-31',[]);
  const daily=aggregateDailyCost([...chicken,...veg,...rice,...drink]);
  expect(daily[0].amountMinor).toBe('18000');
  expect(daily[1].amountMinor).toBe('22000');
  const pos=dailyBudgetPosition('2026-10-31','775000',[
    ...chicken,...veg,...rice,...drink
  ]);
  // 775,000 cents over 31 days is exactly 25,000 cents standard per day.
  expect(pos.standardRemaining.numerator).toBe('93000');
});

test('one whole purchase with mixed item durations still has one exact total',()=>{
  const d=draft('520','items');
  d.items=[
    {id:'1',name:'Chicken',amount:'300',startDate:d.purchaseDate,duration:'3'},
    {id:'2',name:'Vegetables',amount:'120',startDate:d.purchaseDate,duration:'4'},
    {id:'3',name:'Eggs',amount:'100',startDate:d.purchaseDate,duration:'5'}
  ];
  const p=purchasePreview(d);
  expect(p.rules.length).toBe(3);
  expect(p.daily.reduce((sum,r)=>sum+minorBigInt(r.amountMinor),BigInt(0))).toBe(BigInt(52000));
  expect(aggregateDailyCost(p.daily)[0].amountMinor).toBe('15000');
  expect(p.lastDate).toBe('2026-11-03');
});

test('item total mismatch and invalid duration are rejected before bank save',()=>{
  const d=draft('520','items');
  d.items=[{id:'1',name:'Chicken',amount:'300',startDate:d.purchaseDate,duration:'3'}];
  expect(()=>allocationRulesForDraft(d)).toThrow(/exact paid amount/);
  expect(()=>allocationRulesForDraft({...d,items:[{...d.items[0],amount:'520',duration:'0'}]})).toThrow(/days/);
  expect(()=>allocationRulesForDraft(draft('450','whole','2026-10-30','366'))).toThrow(/days/);
  expect(()=>allocationRulesForDraft(draft('-1','whole'))).toThrow();
});

test('edits recalculate 600/3 -> 500/5, do not stack old rules',()=>{
  const original=purchasePreview(draft('600','whole'));
  const corrected=purchasePreview(draft('500','whole','2026-10-30','5'));
  expect(original.daily.length).toBe(3);
  expect(corrected.daily.length).toBe(5);
  expect(corrected.daily.map(d=>d.amountMinor)).toEqual(Array(5).fill('10000'));
  expect(corrected.daily.reduce((sum,r)=>sum+minorBigInt(r.amountMinor),BigInt(0)))
    .toBe(BigInt(50000));
});

test('saved rules restore the right mode and dates for transaction editing',()=>{
  const existing=[{itemName:'',amountMinor:'45000',startDate:'2026-10-30',durationDays:3}];
  const p=draftFromSavedRules('45000','2026-10-30',existing);
  expect(p.mode).toBe('whole');
  expect(p.startDate).toBe('2026-10-30');
  expect(p.duration).toBe('3');
  expect(draftFromSavedRules('45000','2026-10-30',[]).mode).toBe('single');
});

test('calendar allocations span leap February and year boundaries',()=>{
  expect(shiftCalendarDay('2028-02-28',2)).toBe('2028-03-01');
  expect(shiftCalendarDay('2026-12-31',1)).toBe('2027-01-01');
  expect(daysInMonth('2028-02-01')).toBe(29);
  const p=purchasePreview(draft('300','whole','2026-12-31','3'));
  expect(p.daily.map(r=>r.date)).toEqual(['2026-12-31','2027-01-01','2027-01-02']);
});

test('single-day mode attributes whole purchase to transaction date',()=>{
  const p=purchasePreview(draft('90','single'));
  expect(p.rules).toEqual([]);
  expect(p.daily.map(x=>x.amountMinor)).toEqual(['9000']);
  expect(p.daily[0].date).toBe('2026-10-30');
});
