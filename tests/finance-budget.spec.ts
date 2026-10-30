import { test, expect } from '@playwright/test';
import {
  buildBudgetProjection, displayFraction, monthOffset, percentLabel,
  roundedFraction, standardDailyAmounts, todayInFinanceTimezone,
  utilizationBasisPoints, type BudgetDailyRow
} from '../lib/finance/budget-dashboard';
import { daysInMonth } from '../lib/finance/budget';
import { formatMoney, convertInrMinorToTwd } from '../lib/finance/money';

function daily(monthStart:string,patch:Record<string,{actual:string;allocated:string}>={}):BudgetDailyRow[]{
  const days=daysInMonth(monthStart);
  return Array.from({length:days},(_,idx)=>{
    const date=new Date(Date.UTC(Number(monthStart.slice(0,4)),
      Number(monthStart.slice(5,7))-1,idx+1)).toISOString().slice(0,10);
    return {date,actualMinor:patch[date]?.actual??'0',
      allocatedMinor:patch[date]?.allocated??'0'};
  });
}

test('standard allowance examples use correct calendar days and exact rational money',()=>{
  expect(daysInMonth('2026-04-01')).toBe(30);
  expect(daysInMonth('2026-01-01')).toBe(31);
  expect(daysInMonth('2027-02-01')).toBe(28);
  expect(daysInMonth('2028-02-01')).toBe(29);
  expect(displayFraction({numerator:'600000',denominator:30},'INR')).toBe('₹200.00');
  expect(displayFraction({numerator:'700000',denominator:31},'INR')).toBe('₹225.81');
  expect(roundedFraction('-1',2)).toBe('-1');
  const exact=standardDailyAmounts('700000',31);
  expect(exact.length).toBe(31);
  expect(exact.reduce((n,a)=>n+BigInt(a),BigInt(0))).toBe(BigInt(700000));
  expect(exact.slice(0,20)).toEqual(Array(20).fill('22581'));
  expect(exact.slice(20)).toEqual(Array(11).fill('22580'));
});

test('month navigation handles December and leap year boundaries',()=>{
  expect(monthOffset('2026-12-01',1)).toBe('2027-01-01');
  expect(monthOffset('2027-01-01',-1)).toBe('2026-12-01');
  expect(monthOffset('2028-02-01',1)).toBe('2028-03-01');
});
test('timezone is not guessed from the browser locale',()=>{
  expect(todayInFinanceTimezone('Asia/Taipei',new Date('2026-10-29T16:30:00Z')))
    .toBe('2026-10-30');
  expect(todayInFinanceTimezone('America/Los_Angeles',new Date('2026-10-29T16:30:00Z')))
    .toBe('2026-10-29');
});

test('remaining budget and dynamic average include today and never subtract income',()=>{
  const rows=daily('2026-10-01',{'2026-10-12':{actual:'150000',allocated:'150000'}});
  const p=buildBudgetProjection({
    monthStart:'2026-10-01',today:'2026-10-12',budgetTwdMinor:'600000',
    actualExpenseMinor:'150000',allocatedConsumptionMinor:'150000',daily:rows
  });
  expect(p.period).toBe('current');
  expect(p.actualRemainingMinor).toBe('450000');
  expect(p.remainingDaysInclusive).toBe(20);
  expect(displayFraction(p.dynamicAllowance!,'TWD')).toBe('NT$225.00');
  expect(p.dailyToday?.allocatedMinor).toBe('150000');
  expect(p.dailyToday?.isOverStandard).toBe(true);
});

test('budget edits recalculate remaining without changing spending input',()=>{
  const rows=daily('2026-11-01',{'2026-11-08':{actual:'100000',allocated:'100000'}});
  const calculate=(budget:string)=>buildBudgetProjection({
    monthStart:'2026-11-01',today:'2026-11-08',budgetTwdMinor:budget,
    actualExpenseMinor:'100000',allocatedConsumptionMinor:'100000',daily:rows});
  expect(calculate('600000').actualRemainingMinor).toBe('500000');
  expect(calculate('700000').actualRemainingMinor).toBe('600000');
  expect(calculate('700000').dailyActualTodayMinor).toBe('100000');
});

test('over-budget, 75 percent, 90 percent warnings and zero budget',()=>{
  const mk=(budget:string,actual:string)=>{
    const rows=daily('2026-10-01',{'2026-10-08':{actual,allocated:actual}});
    return buildBudgetProjection({monthStart:'2026-10-01',today:'2026-10-08',
      budgetTwdMinor:budget,actualExpenseMinor:actual,
      allocatedConsumptionMinor:actual,daily:rows});
  };
  expect(mk('100000','75000').warning).toBe('75');
  expect(mk('100000','90000').warning).toBe('90');
  expect(mk('100000','120000').warning).toBe('over');
  expect(mk('100000','120000').actualRemainingMinor).toBe('-20000');
  expect(mk('0','0').percentageBasisPoints).toBeNull();
  expect(mk('0','1000').warning).toBe('over');
  expect(percentLabel(utilizationBasisPoints('150000','600000'))).toBe('25.00%');
});

test('historical month has no remaining-days divisor, future month has planned target',()=>{
  const past=buildBudgetProjection({monthStart:'2026-09-01',today:'2026-10-30',
    budgetTwdMinor:'300000',actualExpenseMinor:'0',allocatedConsumptionMinor:'0',
    daily:daily('2026-09-01')});
  expect(past.dynamicAllowance).toBeNull();
  expect(past.remainingDaysInclusive).toBeNull();
  expect(past.period).toBe('past');
  const future=buildBudgetProjection({monthStart:'2026-11-01',today:'2026-10-30',
    budgetTwdMinor:'300000',actualExpenseMinor:'0',allocatedConsumptionMinor:'0',
    daily:daily('2026-11-01')});
  expect(future.remainingDaysInclusive).toBe(30);
  expect(displayFraction(future.dynamicAllowance!)).toBe('NT$100.00');
});

test('cross-month allocated consumption is not counted as an extra bank withdrawal',()=>{
  const oct=daily('2026-10-01',{
    '2026-10-30':{actual:'60000',allocated:'20000'},
    '2026-10-31':{actual:'0',allocated:'20000'}
  });
  const nov=daily('2026-11-01',{'2026-11-01':{actual:'0',allocated:'20000'}});
  const a=buildBudgetProjection({monthStart:'2026-10-01',today:'2026-10-30',
    budgetTwdMinor:'100000',actualExpenseMinor:'60000',
    allocatedConsumptionMinor:'40000',daily:oct});
  const b=buildBudgetProjection({monthStart:'2026-11-01',today:'2026-10-30',
    budgetTwdMinor:'100000',actualExpenseMinor:'0',
    allocatedConsumptionMinor:'20000',daily:nov});
  expect(a.actualRemainingMinor).toBe('40000');
  expect(a.allocatedRemainingMinor).toBe('60000');
  expect(b.actualRemainingMinor).toBe('100000');
  expect(b.allocatedRemainingMinor).toBe('80000');
});

test('rejects fake or inconsistent daily data instead of inventing budget results',()=>{
  expect(()=>buildBudgetProjection({monthStart:'2026-10-01',today:'2026-10-30',
    budgetTwdMinor:'10000',actualExpenseMinor:'5000',
    allocatedConsumptionMinor:'0',daily:daily('2026-10-01')})).toThrow(/disagree/);
  expect(()=>buildBudgetProjection({monthStart:'2026-10-01',today:'2026-10-30',
    budgetTwdMinor:'10000',actualExpenseMinor:'0',
    allocatedConsumptionMinor:'0',daily:daily('2026-10-01').slice(1)})).toThrow(/Missing/);
});
test('INR budget is converted once using an explicit manual rate snapshot',()=>{
  expect(convertInrMinorToTwd('600000','0.38500000')).toBe('231000');
  expect(formatMoney('231000','TWD')).toBe('NT$2,310.00');
  expect(()=>convertInrMinorToTwd('600000','0')).toThrow();
});
