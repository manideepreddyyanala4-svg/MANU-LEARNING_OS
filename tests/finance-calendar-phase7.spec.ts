import { test, expect } from '@playwright/test';
import { allocatePurchase } from '../lib/finance/allocations';
import { buildFinanceCalendar,assertCalendarMatchesLedger,
  nextSevenGroceryDays,monthForDay } from '../lib/finance/calendar-view';
import { daysInMonth } from '../lib/finance/budget';
import { shiftCalendarDay } from '../lib/finance/allocations';
import type { FinanceCalendarDay } from '../lib/finance/repository';
import type { BudgetDailyRow } from '../lib/finance/budget-dashboard';

function monthRows(month:string){
  const days=daysInMonth(month);
  const dates=Array.from({length:days},(_,i)=>shiftCalendarDay(month,i));
  const baseline:BudgetDailyRow[]=dates.map(date=>({date,actualMinor:'0',allocatedMinor:'0'}));
  const filtered:FinanceCalendarDay[]=dates.map(date=>({
    date,cashMinor:'0',consumptionMinor:'0',groceryMinor:'0',ordinaryMinor:'0',allocationCount:0
  }));
  return {baseline,filtered};
}
test('November budget NT$7,500 has 30 exactly NT$250 days, 150 groceries + 40 coffee leaves 60',()=>{
  const {baseline,filtered}=monthRows('2026-11-01');
  baseline[0].allocatedMinor='19000';
  baseline[0].actualMinor='4000';
  filtered[0]={...filtered[0],cashMinor:'4000',consumptionMinor:'19000',
    groceryMinor:'15000',ordinaryMinor:'4000',allocationCount:1};
  assertCalendarMatchesLedger(baseline,filtered);
  const c=buildFinanceCalendar('2026-11-01','2026-11-01',baseline,filtered,'750000');
  expect(c.cells.length).toBe(30);
  expect(c.cells[0].standardDayMinor).toBe('25000');
  expect(c.cells[0].dailyRemainingMinor).toBe('6000');
  expect(c.cells[0].status).toBe('under');
  expect(c.cells[0].allocationCount).toBe(1);
  expect(c.cells.slice(1).every(d=>d.standardDayMinor==='25000')).toBe(true);
  expect(c.cells.reduce((n,d)=>n+BigInt(d.standardDayMinor!),BigInt(0))).toBe(BigInt(750000));
});
test('cross-month grocery payment is separate from November consumption',()=>{
  const rows=monthRows('2026-11-01');
  const purchase=allocatePurchase('purchase','45000','2026-10-30',[
    {amountMinor:'45000',startDate:'2026-10-30',durationDays:3}
  ]);
  expect(purchase[2]).toMatchObject({date:'2026-11-01',amountMinor:'15000'});
  rows.baseline[0].allocatedMinor='15000';
  rows.filtered[0]={...rows.filtered[0],groceryMinor:'15000',consumptionMinor:'15000',allocationCount:1};
  const c=buildFinanceCalendar('2026-11-01','2026-10-30',
    rows.baseline,rows.filtered,'750000');
  expect(c.cells[0].cashMinor).toBe('0');
  expect(c.cells[0].consumptionMinor).toBe('15000');
  expect(c.cells[0].dailyRemainingMinor).toBe('10000');
});
test('multiple grocery purchases overlap and ordinary expenses are attributed once',()=>{
  const {baseline,filtered}=monthRows('2026-11-01');
  baseline[0].actualMinor='3000';baseline[0].allocatedMinor='21000';
  filtered[0]={...filtered[0],cashMinor:'3000',consumptionMinor:'21000',
    groceryMinor:'18000',ordinaryMinor:'3000',allocationCount:3};
  const c=buildFinanceCalendar('2026-11-01','2026-11-01',baseline,filtered,'750000');
  expect(c.cells[0].dailyRemainingMinor).toBe('4000');
  expect(c.cells[0].status).toBe('near');
});
test('overspending is negative, not clamped or masked by filtering',()=>{
  const {baseline,filtered}=monthRows('2026-11-01');
  baseline[0].allocatedMinor='30000';baseline[0].actualMinor='30000';
  filtered[0]={...filtered[0],cashMinor:'4000',consumptionMinor:'4000',ordinaryMinor:'4000'};
  const c=buildFinanceCalendar('2026-11-01','2026-11-01',baseline,filtered,'750000');
  expect(c.cells[0].dailyRemainingMinor).toBe('-5000');
  expect(c.cells[0].status).toBe('over');
  expect(c.cells[0].consumptionMinor).toBe('4000'); // partial filtered total
});
test('not configured and empty months cannot fabricate a budget',()=>{
  const rows=monthRows('2027-02-01');
  const c=buildFinanceCalendar('2027-02-01','2026-10-30',
    rows.baseline,rows.filtered,null);
  expect(c.cells).toHaveLength(28);
  expect(c.cells.every(d=>d.status==='no-budget'&&d.dailyRemainingMinor===null)).toBe(true);
});
test('2028 leap-year month and 2026 year rollover render accurate slots',()=>{
  const leap=monthRows('2028-02-01');
  const c=buildFinanceCalendar('2028-02-01','2028-02-01',leap.baseline,leap.filtered,'2900');
  expect(c.cells).toHaveLength(29);
  expect(c.grid.length%7).toBe(0);
  expect(monthForDay('2026-12-31')).toBe('2026-12-01');
  expect(monthForDay(shiftCalendarDay('2026-12-31',1))).toBe('2027-01-01');
});
test('daily cent allowances remain deterministic when the budget does not divide evenly',()=>{
  const r=monthRows('2026-11-01');
  const c=buildFinanceCalendar('2026-11-01','2026-11-01',r.baseline,r.filtered,'40000');
  expect(c.cells[0].standardDayMinor).toBe('1334');
  expect(c.cells[10].standardDayMinor).toBe('1334');
  expect(c.cells[29].standardDayMinor).toBe('1333');
  expect(c.cells.reduce((n,d)=>n+BigInt(d.standardDayMinor!),BigInt(0))).toBe(BigInt(40000));
});
test('unfiltered numbers must match authoritative ledger, never silently estimate',()=>{
  const r=monthRows('2026-11-01');
  r.baseline[0].allocatedMinor='15000';
  expect(()=>assertCalendarMatchesLedger(r.baseline,r.filtered)).toThrow(/disagrees/);
  r.filtered[0].consumptionMinor='15000';
  expect(()=>assertCalendarMatchesLedger(r.baseline,r.filtered)).not.toThrow();
  r.filtered[0].consumptionMinor='15001';
  expect(()=>buildFinanceCalendar('2026-11-01','2026-11-01',r.baseline,r.filtered,'750000')).toThrow(/exceed/);
});
test('upcoming seven days include only saved grocery allocations, including next month',()=>{
  const r=monthRows('2026-11-01');
  r.filtered[0].groceryMinor='15000';r.filtered[1].groceryMinor='3000';
  const prev=monthRows('2026-10-01');
  const upcoming=nextSevenGroceryDays('2026-10-30',[...prev.filtered,...r.filtered]);
  expect(upcoming).toHaveLength(7);
  expect(upcoming[1]).toEqual({date:'2026-11-01',amountMinor:'15000'});
  expect(upcoming[2]).toEqual({date:'2026-11-02',amountMinor:'3000'});
});
test('account/category-filtered spending remains a subset of the full daily budget',()=>{
  const r=monthRows('2026-11-01');
  r.baseline[0].actualMinor='45000';r.baseline[0].allocatedMinor='19000';
  r.filtered[0]={...r.filtered[0],cashMinor:'0',consumptionMinor:'15000',
    groceryMinor:'15000',allocationCount:1};
  const c=buildFinanceCalendar('2026-11-01','2026-11-01',r.baseline,r.filtered,'750000');
  expect(c.cells[0].consumptionMinor).toBe('15000');
  expect(c.cells[0].dailyRemainingMinor).toBe('6000');
});
