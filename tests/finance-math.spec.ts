import { test, expect } from '@playwright/test';
import { parseMoney, formatMoney, minorBigInt, parseManualTwdPerInr, convertInrMinorToTwd } from '../lib/finance/money';
import { allocatePurchase, shiftCalendarDay, assertISODate } from '../lib/finance/allocations';
import { daysInMonth, dailyBudgetPosition, dynamicRemainingAllowance, sumDailyAllocations } from '../lib/finance/budget';

test('TWD and INR amounts never use floating-point arithmetic', () => {
  expect(parseMoney('300')).toBe('30000');
  expect(parseMoney('0.01')).toBe('1');
  expect(parseMoney('1.20')).toBe('120');
  expect(formatMoney('30000','TWD')).toBe('NT$300.00');
  expect(formatMoney('-1234567','INR')).toBe('-₹12,345.67');
  expect(() => parseMoney('0.001')).toThrow();
  expect(() => parseMoney('1e3')).toThrow();
  expect(() => parseMoney('-3')).toThrow();
  expect(minorBigInt('1000000000000')).toBe(BigInt(1000000000000));
  expect(() => minorBigInt('9007199254740991')).toThrow();
});

test('manual INR/TWD conversion is fixed precision and half-up', () => {
  expect(parseManualTwdPerInr('0.50')).toBe('50000000');
  expect(convertInrMinorToTwd('10000','0.50')).toBe('5000');
  expect(convertInrMinorToTwd('1','0.50')).toBe('1');
  expect(convertInrMinorToTwd('1','0.49')).toBe('0');
  expect(() => parseManualTwdPerInr('1.000000001')).toThrow();
  expect(() => parseManualTwdPerInr('0')).toThrow();
});

test('three-day groceries deduct nothing additional and exactly allocate purchase', () => {
  const daily=allocatePurchase('tx-1','30000','2026-10-30',[
    {amountMinor:'30000',startDate:'2026-10-30',durationDays:3}
  ]);
  expect(daily.map(d=>[d.date,d.amountMinor])).toEqual([
    ['2026-10-30','10000'],['2026-10-31','10000'],['2026-11-01','10000']
  ]);
  expect(daily.reduce((n,d)=>n+BigInt(d.amountMinor),BigInt(0))).toBe(BigInt(30000));
  expect(sumDailyAllocations(daily,'2026-10-01','2026-11-01')).toBe('20000');
  expect(sumDailyAllocations(daily,'2026-11-01','2026-12-01')).toBe('10000');
});

test('remainder pennies allocate in stable order and never disappear', () => {
  const daily=allocatePurchase('tx-2','30100','2026-10-30',[
    {amountMinor:'30100',startDate:'2026-10-30',durationDays:3}
  ]);
  expect(daily.map(x=>x.amountMinor)).toEqual(['10034','10033','10033']);
  expect(daily.reduce((n,d)=>n+BigInt(d.amountMinor),BigInt(0))).toBe(BigInt(30100));
});

test('advanced grocery items have independent durations and dates', () => {
  const items=allocatePurchase('multi','50000','2026-10-30',[
    {amountMinor:'20000',startDate:'2026-10-30',durationDays:2},
    {amountMinor:'30000',startDate:'2026-10-31',durationDays:3}
  ]);
  expect(items.length).toBe(5);
  expect(items.reduce((n,d)=>n+BigInt(d.amountMinor),BigInt(0))).toBe(BigInt(50000));
  expect(() => allocatePurchase('bad','50000','2026-10-30',[
    {amountMinor:'10000',startDate:'2026-10-30',durationDays:2}
  ])).toThrow('sum');
});

test('normal expense has a single attribution date', () => {
  expect(allocatePurchase('ordinary','24900','2026-10-30',[])).toEqual([
    {date:'2026-10-30',amountMinor:'24900',transactionId:'ordinary',categoryId:null}
  ]);
});

test('calendar validates 28,29,30,31 days and exact leap dates', () => {
  expect(daysInMonth('2026-02-01')).toBe(28);
  expect(daysInMonth('2028-02-01')).toBe(29);
  expect(daysInMonth('2026-04-01')).toBe(30);
  expect(daysInMonth('2026-10-01')).toBe(31);
  expect(shiftCalendarDay('2028-02-28',1)).toBe('2028-02-29');
  expect(shiftCalendarDay('2028-02-28',2)).toBe('2028-03-01');
  expect(() => assertISODate('2026-02-29')).toThrow();
  expect(() => daysInMonth('2026-10-02')).toThrow();
});

test('standard daily target and dynamic future-commitment allowance differ', () => {
  const grocery=allocatePurchase('one','30000','2026-10-30',[
    {amountMinor:'30000',startDate:'2026-10-30',durationDays:3}
  ]);
  const today=dailyBudgetPosition('2026-10-30','60000',grocery);
  expect(today.allocatedMinor).toBe('10000');
  expect(today.standardAllowance).toEqual({numerator:'60000',denominator:31});
  expect(today.isOverStandard).toBe(true);
  expect(dynamicRemainingAllowance('2026-10-01','2026-10-30','60000','20000'))
    .toEqual({numerator:'40000',denominator:2});
  expect(dynamicRemainingAllowance('2026-10-01','2026-11-01','60000','20000')).toBeNull();
});
