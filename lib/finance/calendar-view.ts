import { assertISODate, shiftCalendarDay } from './allocations';
import { daysInMonth } from './budget';
import { minorBigInt } from './money';
import { monthOffset, standardDailyAmounts, type BudgetDailyRow } from './budget-dashboard';
import type { FinanceCalendarDay } from './repository';
import type { MoneyMinor } from './types';

export type CalendarSpendingView='consumption'|'cash';
export type FinanceCalendarCell={
  date:string;day:number;cashMinor:MoneyMinor;consumptionMinor:MoneyMinor;
  groceryMinor:MoneyMinor;ordinaryMinor:MoneyMinor;allocationCount:number;
  standardDayMinor:MoneyMinor|null;dailyRemainingMinor:MoneyMinor|null;
  status:'no-budget'|'under'|'near'|'over';isToday:boolean;
};
export type CalendarGridEntry={date:string|null;cell:FinanceCalendarCell|null};

/** Daily totals from an owner-scoped, single monthly aggregate RPC.
 * Do not combine actual ledger payments with attributed costs.
 * Exact daily cent allocations come from Phase 5; their sum is the budget.
 */
export function buildFinanceCalendar(
 monthStart:string,today:string,
 authoritative:BudgetDailyRow[],filtered:FinanceCalendarDay[],
 budgetTwdMinor:MoneyMinor|null
):{cells:FinanceCalendarCell[];grid:CalendarGridEntry[]}{
  assertISODate(monthStart);assertISODate(today);
  const count=daysInMonth(monthStart);
  if(authoritative.length!==count||filtered.length!==count)
    throw new Error('Calendar data incomplete; cannot show estimated totals');
  const budgetDays=budgetTwdMinor==null?null:standardDailyAmounts(budgetTwdMinor,count);
  const result:FinanceCalendarCell[]=[];
  const usedDates=new Set<string>();
  const baseline=new Map(authoritative.map(d=>[d.date,d]));
  for(let i=0;i<count;i++){
    const d=shiftCalendarDay(monthStart,i);
    const r=filtered[i],overall=baseline.get(d);
    if(!overall||!r||r.date!==d||usedDates.has(r.date))
      throw new Error('Calendar dates disagree with budget data');
    usedDates.add(d);
    if(r.allocationCount<0||!Number.isSafeInteger(r.allocationCount))
      throw new Error('Invalid allocation count');
    const cash=minorBigInt(r.cashMinor),consumption=minorBigInt(r.consumptionMinor);
    const grocery=minorBigInt(r.groceryMinor),ordinary=minorBigInt(r.ordinaryMinor);
    const actual=minorBigInt(overall.actualMinor),attributed=minorBigInt(overall.allocatedMinor);
    if([cash,consumption,grocery,ordinary,actual,attributed].some(n=>n<BigInt(0)))
      throw new Error('Negative spending in calendar data');
    if(cash>actual||consumption>attributed||grocery>consumption||ordinary>consumption)
      throw new Error('Filtered finance metrics exceed authoritative totals');
    const standardDayMinor=budgetDays?.[i]??null;
    const left=standardDayMinor===null?null:
      (minorBigInt(standardDayMinor)-attributed).toString();
    const standard=standardDayMinor==null?null:minorBigInt(standardDayMinor);
    const status=standard===null?'no-budget':
      attributed>standard?'over':
      (standard===BigInt(0)?'under':
        attributed*BigInt(100)>=standard*BigInt(80)?'near':'under');
    result.push({
      date:d,day:i+1,cashMinor:r.cashMinor,consumptionMinor:r.consumptionMinor,
      groceryMinor:r.groceryMinor,ordinaryMinor:r.ordinaryMinor,
      allocationCount:r.allocationCount,standardDayMinor,dailyRemainingMinor:left,
      status,isToday:d===today
    });
  }
  const first=new Date(monthStart+'T12:00:00Z');
  const mondayOffset=(first.getUTCDay()+6)%7;
  const grid:CalendarGridEntry[]=Array.from({length:mondayOffset},()=>({date:null,cell:null}));
  result.forEach(cell=>grid.push({date:cell.date,cell}));
  while(grid.length%7!==0)grid.push({date:null,cell:null});
  return {cells:result,grid};
}

export function assertCalendarMatchesLedger(
 authoritative:BudgetDailyRow[],unfiltered:FinanceCalendarDay[]
):void {
  if(authoritative.length!==unfiltered.length)
    throw new Error('Ledger calendar is incomplete');
  const original=new Map(authoritative.map(d=>[d.date,d]));
  for(const day of unfiltered){
    const row=original.get(day.date);
    if(!row || minorBigInt(day.cashMinor)!==minorBigInt(row.actualMinor)
      ||minorBigInt(day.consumptionMinor)!==minorBigInt(row.allocatedMinor))
      throw new Error('Calendar disagrees with the actual financial ledger');
  }
}

/** Already-paid grocery allocations only. Not scheduled bills or bank deductions. */
export function nextSevenGroceryDays(
 today:string,rows:FinanceCalendarDay[]
):{date:string;amountMinor:MoneyMinor}[]{
  assertISODate(today);
  const found=new Map(rows.map(r=>[r.date,r.groceryMinor]));
  return Array.from({length:7},(_,i)=>{
    const date=shiftCalendarDay(today,i+1);
    return {date,amountMinor:found.get(date)??'0'};
  });
}
export function monthForDay(date:string):string {
  assertISODate(date);
  return date.slice(0,7)+'-01';
}
export function previousOrNext(monthStart:string,step:-1|1):string {
  return monthOffset(monthStart,step);
}
