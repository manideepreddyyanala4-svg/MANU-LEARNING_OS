import { minorBigInt } from './money';
import type { FinanceAccount, FinanceAccountOverview, FinanceTransaction, MoneyMinor } from './types';

export function sumActiveAccountBalances(accounts: FinanceAccount[]): MoneyMinor {
  return accounts.filter(a=>a.isActive).reduce((sum,account)=>{
    if(account.currency!=='TWD') throw new Error('Cannot add balances in different currencies');
    return sum+minorBigInt(account.balanceMinor);
  },BigInt(0)).toString();
}

export function expectedBalanceFromOverview(o: FinanceAccountOverview): MoneyMinor {
  return (
    minorBigInt(o.openingMinor) + minorBigInt(o.incomeMinor)
    - minorBigInt(o.expenseMinor) + minorBigInt(o.netTransferMinor)
    + minorBigInt(o.adjustmentMinor)
  ).toString();
}

export function accountLedgerMatches(account: FinanceAccount, overview:FinanceAccountOverview):boolean {
  return account.balanceMinor===expectedBalanceFromOverview(overview);
}

/** User-facing effect of the currently active transaction; historical voids have 0 effect. */
export function transactionEffectOnAccount(t:FinanceTransaction,accountId:string):MoneyMinor {
  if(t.voidedAt) return '0';
  const amount = minorBigInt(t.amountMinor);
  if((t.kind==='opening'||t.kind==='income') && t.destinationAccountId===accountId)
    return amount.toString();
  if((t.kind==='expense'||t.kind==='adjustment')&&t.sourceAccountId===accountId)
    return (t.kind==='expense' ? -amount : amount).toString();
  if(t.kind==='transfer'){
    if(t.sourceAccountId===accountId) return (-amount).toString();
    if(t.destinationAccountId===accountId) return amount.toString();
  }
  return '0';
}

export function accountActivityLabel(t:FinanceTransaction, accountId:string):string {
  switch(t.kind){
    case 'opening':return 'Opening balance';
    case 'income':return 'Income';
    case 'expense':return t.merchant||'Expense';
    case 'adjustment':return 'Balance adjustment';
    case 'transfer':return t.destinationAccountId===accountId?'Transfer received':'Transfer sent';
  }
}
