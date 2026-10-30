import { test, expect } from '@playwright/test';
import { accountActivityLabel, accountLedgerMatches, expectedBalanceFromOverview,
  sumActiveAccountBalances, transactionEffectOnAccount } from '../lib/finance/account-summary';
import { todayInTaipei, formatFinanceDate } from '../lib/finance/dates';
import type { FinanceAccount, FinanceAccountOverview, FinanceTransaction } from '../lib/finance/types';

function account(accountId:string,balanceMinor:string,code='test'):FinanceAccount {
  return {accountId,code,name:code,kind:'bank',currency:'TWD',balanceMinor,isActive:true};
}
function overview(accountId:string,values:Partial<FinanceAccountOverview>):FinanceAccountOverview {
  return {
    accountId,openingTransactionId:'opening-tx',openingRevision:1,openingDate:'2026-10-30',
    openingMinor:'0',incomeMinor:'0',expenseMinor:'0',
    netTransferMinor:'0',adjustmentMinor:'0',lastActivityAt:null,lastReconciledAt:null,...values
  };
}
function tx(kind:FinanceTransaction['kind'],amountMinor:string,
  sourceAccountId:string|null,destinationAccountId:string|null):FinanceTransaction {
  return {
    id:'tx',kind,amountMinor,currency:'TWD',txnDate:'2026-10-30',txnTime:'12:00',
    sourceAccountId,destinationAccountId,categoryId:null,merchant:'',note:'',
    revision:1,voidedAt:null,createdAt:'2026-10-30T00:00:00Z',
    updatedAt:'2026-10-30T00:00:00Z'
  };
}

test('account total matches 3k + 3k + 500 and transfer preserves it',()=>{
  const initial=[account('post','300000'),account('ctbc','300000'),account('cash','50000')];
  expect(sumActiveAccountBalances(initial)).toBe('650000');
  const afterFirst=[account('post','350000'),account('ctbc','250000'),account('cash','50000')];
  expect(sumActiveAccountBalances(afterFirst)).toBe('650000');
  const afterCash=[account('post','330000'),account('ctbc','250000'),account('cash','70000')];
  expect(sumActiveAccountBalances(afterCash)).toBe('650000');
  expect(sumActiveAccountBalances([account('post','325000'),account('ctbc','250000'),account('cash','70000')]))
    .toBe('645000');
});

test('account overview is consistent with all five real money event types',()=>{
  const o=overview('post',{openingMinor:'300000',incomeMinor:'5000',
    expenseMinor:'1000',netTransferMinor:'20000',adjustmentMinor:'-5000'});
  expect(expectedBalanceFromOverview(o)).toBe('319000');
  expect(accountLedgerMatches(account('post','319000'),o)).toBe(true);
  expect(accountLedgerMatches(account('post','300000'),o)).toBe(false);
});

test('transfer effects are opposite but neither counts as expense',()=>{
  const t=tx('transfer','50000','ctbc','post');
  expect(transactionEffectOnAccount(t,'ctbc')).toBe('-50000');
  expect(transactionEffectOnAccount(t,'post')).toBe('50000');
  expect(accountActivityLabel(t,'ctbc')).toBe('Transfer sent');
  expect(accountActivityLabel(t,'post')).toBe('Transfer received');
});

test('adjustment reversal and void display remove its active effect',()=>{
  const adjustment=tx('adjustment','-5000','post',null);
  expect(transactionEffectOnAccount(adjustment,'post')).toBe('-5000');
  expect(transactionEffectOnAccount({...adjustment,voidedAt:'2026-10-31T09:00:00Z'},'post')).toBe('0');
});

test('income and expense only affect chosen account',()=>{
  expect(transactionEffectOnAccount(tx('income','600000',null,'ctbc'),'ctbc')).toBe('600000');
  expect(transactionEffectOnAccount(tx('expense','10000','cash',null),'cash')).toBe('-10000');
  expect(transactionEffectOnAccount(tx('expense','10000','cash',null),'post')).toBe('0');
});

test('Taiwan date is independent of browser timezone and handles midnight',()=>{
  expect(todayInTaipei(new Date('2026-10-29T16:30:00Z'))).toBe('2026-10-30');
  expect(todayInTaipei(new Date('2026-10-30T15:59:59Z'))).toBe('2026-10-30');
  expect(todayInTaipei(new Date('2026-10-30T16:00:00Z'))).toBe('2026-10-31');
  expect(formatFinanceDate('2028-02-29')).toBe('Feb 29, 2028');
});

test('archived accounts are not included in available sum',()=>{
  const entries=[account('post','50000'),{...account('closed','0'),isActive:false}];
  expect(sumActiveAccountBalances(entries)).toBe('50000');
});
