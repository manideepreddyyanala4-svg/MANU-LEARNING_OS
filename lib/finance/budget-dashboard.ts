import { assertISODate } from './allocations';
import { daysInMonth, dailyBudgetPosition, type RatioMinor } from './budget';
import { formatMoney, minorBigInt } from './money';
import type { ISODate, MoneyMinor } from './types';

export type BudgetDailyRow = {
  date: ISODate;
  actualMinor: MoneyMinor;
  allocatedMinor: MoneyMinor;
};
export type BudgetPeriod = 'past' | 'current' | 'future';
export type BudgetProjection = {
  period: BudgetPeriod;
  monthStart: ISODate;
  daysInMonth: number;
  remainingDaysInclusive: number | null;
  actualRemainingMinor: MoneyMinor;
  allocatedRemainingMinor: MoneyMinor;
  dailyStandard: RatioMinor;
  dailyToday: ReturnType<typeof dailyBudgetPosition> | null;
  dailyActualTodayMinor: MoneyMinor | null;
  dynamicAllowance: RatioMinor | null;
  percentageBasisPoints: string | null;
  warning: 'none' | '75' | '90' | 'over';
};

export function monthOffset(monthStart: ISODate, delta: number): ISODate {
  const days = daysInMonth(monthStart);
  if (days < 28 || !Number.isSafeInteger(delta) || Math.abs(delta) > 1200)
    throw new Error('Month offset outside supported range');
  const [year,month] = monthStart.split('-').map(Number);
  const shifted = new Date(Date.UTC(year,month-1+delta,1));
  const result = shifted.toISOString().slice(0,10);
  assertISODate(result);
  return result;
}

export function todayInFinanceTimezone(timezone: string, clock = new Date()): ISODate {
  const pieces = new Intl.DateTimeFormat('en-US',{
    timeZone: timezone, year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(clock);
  const part = (name: string)=>pieces.find(p=>p.type===name)?.value;
  const result = [part('year'),part('month'),part('day')].join('-');
  assertISODate(result);
  return result;
}

/** Round only the display or a final minor-unit share. Never round intermediate ratios. */
export function roundedFraction(numerator: string, denominator: number): MoneyMinor {
  if(!Number.isSafeInteger(denominator)||denominator<1)throw new Error('Invalid divisor');
  const n=BigInt(numerator),d=BigInt(denominator);
  const abs=n<BigInt(0)?-n:n;
  const rounded=(abs+d/BigInt(2))/d;
  return (n<BigInt(0)?-rounded:rounded).toString();
}

export function displayFraction(value: RatioMinor, currency:'TWD'|'INR'='TWD'):string {
  return formatMoney(roundedFraction(value.numerator,value.denominator),currency);
}

/** Deterministic exact minor-unit schedule (first remainder days receive +1 cent). */
export function standardDailyAmounts(budgetMinor: MoneyMinor, dayCount: number):MoneyMinor[] {
  if(!Number.isSafeInteger(dayCount)||dayCount<1||dayCount>366)throw new Error('Invalid month day count');
  const b=minorBigInt(budgetMinor);
  if(b<BigInt(0))throw new Error('Monthly budget cannot be negative');
  const n=BigInt(dayCount),q=b/n,r=b%n;
  return Array.from({length:dayCount},(_,i)=>(q+(BigInt(i)<r?BigInt(1):BigInt(0))).toString());
}

/** Percentage as integer basis points, 10,000 = 100%; null when budget is zero. */
export function utilizationBasisPoints(spentMinor: MoneyMinor,budgetMinor:MoneyMinor):string|null {
  const budget=minorBigInt(budgetMinor), spent=minorBigInt(spentMinor);
  if(budget<BigInt(0) || spent<BigInt(0))throw new Error('Invalid budget or spending');
  if(budget===BigInt(0))return null;
  return ((spent*BigInt(10000)+budget/BigInt(2))/budget).toString();
}
export function percentLabel(basisPoints:string|null):string {
  if(basisPoints===null)return 'Not applicable';
  const n=BigInt(basisPoints);
  return (n/BigInt(100)).toString()+'.'+(n%BigInt(100)).toString().padStart(2,'0')+'%';
}

export function buildBudgetProjection(args:{
  monthStart:ISODate;
  today:ISODate;
  budgetTwdMinor:MoneyMinor;
  actualExpenseMinor:MoneyMinor;
  allocatedConsumptionMinor:MoneyMinor;
  daily:BudgetDailyRow[];
}):BudgetProjection {
  const {monthStart,today,budgetTwdMinor,actualExpenseMinor,allocatedConsumptionMinor,daily}=args;
  const days=daysInMonth(monthStart);
  assertISODate(today);
  const end=monthOffset(monthStart,1);
  const budget=minorBigInt(budgetTwdMinor), actual=minorBigInt(actualExpenseMinor);
  const allocated=minorBigInt(allocatedConsumptionMinor);
  if(budget<BigInt(0)||actual<BigInt(0)||allocated<BigInt(0))throw new Error('Budget or expenses must not be negative');
  if(daily.length!==days)throw new Error('Missing daily budget breakdown');
  const seen=new Set<string>();
  let actualTotal=BigInt(0), allocatedTotal=BigInt(0);
  for(const row of daily){
    assertISODate(row.date);
    if(row.date<monthStart||row.date>=end||seen.has(row.date))
      throw new Error('Duplicate or invalid daily date');
    seen.add(row.date);
    const spent=minorBigInt(row.actualMinor), consumed=minorBigInt(row.allocatedMinor);
    if(spent<BigInt(0)||consumed<BigInt(0))throw new Error('Negative daily spending');
    actualTotal+=spent;allocatedTotal+=consumed;
  }
  if(actualTotal!==actual||allocatedTotal!==allocated)
    throw new Error('Daily totals disagree with authoritative monthly summary');
  const period:BudgetPeriod=today<monthStart?'future':today>=end?'past':'current';
  const remainingDaysInclusive=period==='past'?null:
    period==='future'?days:days-Number(today.slice(-2))+1;
  const todayRow=period==='current'?daily.find(x=>x.date===today):null;
  const allocationRows=daily.map(d=>({
    date:d.date,amountMinor:d.allocatedMinor,transactionId:'derived-day',categoryId:null
  }));
  const dailyToday=todayRow?dailyBudgetPosition(today,budgetTwdMinor,allocationRows):null;
  const percentageBasisPoints=utilizationBasisPoints(actualExpenseMinor,budgetTwdMinor);
  const percentage=percentageBasisPoints===null?null:BigInt(percentageBasisPoints);
  const warning=actual>budget?'over':percentage!==null && percentage>=BigInt(9000)?'90':
    percentage!==null && percentage>=BigInt(7500)?'75':'none';
  // Current month dynamic average is actual cash-flow remaining / calendar days left.
  // Allocated consumption is a distinct planning metric and never another bank debit.
  const dynamicAllowance=remainingDaysInclusive===null?null:{
    numerator:(budget-actual).toString(),denominator:remainingDaysInclusive
  };
  return {
    period,monthStart,daysInMonth:days,remainingDaysInclusive,
    actualRemainingMinor:(budget-actual).toString(),
    allocatedRemainingMinor:(budget-allocated).toString(),
    dailyStandard:{numerator:budget.toString(),denominator:days},
    dailyToday,dailyActualTodayMinor:todayRow?.actualMinor??null,
    dynamicAllowance,percentageBasisPoints,warning
  };
}
