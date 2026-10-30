import { assertISODate } from './allocations';
import { minorBigInt } from './money';
import type { DailyAllocation, ISODate, MoneyMinor } from './types';

export function daysInMonth(monthStart: ISODate): number {
  assertISODate(monthStart);
  const [year,month,day] = monthStart.split('-').map(Number);
  if (day!==1) throw new Error('Month must start on day 1');
  return new Date(Date.UTC(year,month,0)).getUTCDate();
}

export function sumDailyAllocations(
  allocations: DailyAllocation[],
  fromInclusive: ISODate,
  toExclusive: ISODate
): MoneyMinor {
  assertISODate(fromInclusive);
  assertISODate(toExclusive);
  return allocations.reduce((sum,item) =>
    sum + (item.date>=fromInclusive && item.date<toExclusive ? minorBigInt(item.amountMinor) : 0n),0n
  ).toString();
}

/** Exact fraction; rounding is a display decision, not hidden arithmetic. */
export type RatioMinor = { numerator: string; denominator: number };

export interface DailyBudgetPosition {
  date: ISODate;
  allocatedMinor: MoneyMinor;
  standardAllowance: RatioMinor;
  standardRemaining: RatioMinor;
  isOverStandard: boolean;
}

export function dailyBudgetPosition(
  date: ISODate, budgetMinor: MoneyMinor, allocations: DailyAllocation[]
): DailyBudgetPosition {
  assertISODate(date);
  const month = date.slice(0,7) + '-01';
  const days = daysInMonth(month);
  const spent = allocations.reduce((sum,a) =>
    a.date===date ? sum + minorBigInt(a.amountMinor) : sum, 0n);
  const budget = minorBigInt(budgetMinor);
  const remainingNumerator = budget - spent * BigInt(days);
  return {
    date,
    allocatedMinor: spent.toString(),
    standardAllowance: {numerator:budget.toString(),denominator:days},
    standardRemaining: {numerator:remainingNumerator.toString(),denominator:days},
    isOverStandard: remainingNumerator<0n,
  };
}

/** Commitment-aware additional discretionary target, NOT today's old cost. */
export function dynamicRemainingAllowance(
  monthStart: ISODate,
  today: ISODate,
  budgetMinor: MoneyMinor,
  allAllocatedInMonthMinor: MoneyMinor
): RatioMinor | null {
  const days = daysInMonth(monthStart);
  assertISODate(today);
  if (today < monthStart) return {
    numerator:(minorBigInt(budgetMinor)-minorBigInt(allAllocatedInMonthMinor)).toString(),
    denominator:days
  };
  if (today.slice(0,7) !== monthStart.slice(0,7)) return null;
  const day = Number(today.slice(-2));
  const remainingDaysInclusive = days-day+1;
  return {
    numerator:(minorBigInt(budgetMinor)-minorBigInt(allAllocatedInMonthMinor)).toString(),
    denominator:remainingDaysInclusive
  };
}
