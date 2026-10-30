import { minorBigInt } from './money';
import type { DailyAllocation, GroceryRule, ISODate, MoneyMinor } from './types';

export function assertISODate(value: ISODate): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Expected YYYY-MM-DD');
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1000 || year > 9999) throw new Error('Year outside supported range');
  const date = new Date(Date.UTC(year,month - 1,day));
  if (date.toISOString().slice(0,10) !== value) throw new Error('Invalid calendar date');
}

export function shiftCalendarDay(date: ISODate, offset: number): ISODate {
  assertISODate(date);
  if (!Number.isSafeInteger(offset)) throw new Error('Invalid day offset');
  const [year,month,day] = date.split('-').map(Number);
  return new Date(Date.UTC(year,month - 1,day + offset)).toISOString().slice(0,10);
}

/** A deterministic planning projection. This function never mutates the ledger. */
export function allocateGrocery(
  transactionId: string,
  rule: GroceryRule,
  fallbackCategoryId: string | null = null
): DailyAllocation[] {
  assertISODate(rule.startDate);
  if (!Number.isInteger(rule.durationDays) || rule.durationDays < 1 || rule.durationDays > 3650) {
    throw new Error('Duration must be between 1 and 3650 days');
  }
  const amount = minorBigInt(rule.amountMinor);
  if (amount <= 0n) throw new Error('Allocation amount must be positive');
  const n = BigInt(rule.durationDays);
  const quotient = amount / n;
  const remainder = amount % n;
  return Array.from({length: rule.durationDays}, (_, i) => ({
    date: shiftCalendarDay(rule.startDate, i),
    amountMinor: (quotient + (BigInt(i) < remainder ? 1n : 0n)).toString(),
    transactionId,
    categoryId: rule.categoryId ?? fallbackCategoryId,
  }));
}

export function allocatePurchase(
  transactionId: string,
  expenseMinor: MoneyMinor,
  txnDate: ISODate,
  rules: GroceryRule[],
  categoryId: string | null = null
): DailyAllocation[] {
  assertISODate(txnDate);
  const expense = minorBigInt(expenseMinor);
  if (expense <= 0n) throw new Error('Expense must be positive');
  if (!rules.length) return [{date:txnDate, amountMinor:expense.toString(),transactionId,categoryId}];
  if (rules.length > 100) throw new Error('Too many grocery rules');
  const sum = rules.reduce((acc,rule) => acc + minorBigInt(rule.amountMinor),0n);
  if (sum !== expense) throw new Error('Item allocations must sum to the paid amount');
  return rules.flatMap((rule) => allocateGrocery(transactionId,rule,categoryId));
}
