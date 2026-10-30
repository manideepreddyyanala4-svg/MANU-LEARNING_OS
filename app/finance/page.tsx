import { Page } from '@/components/ui';
import { FinanceAccountsWorkspace } from '@/components/finance/accounts-workspace';
import { FinanceTransactions } from '@/components/finance/transactions-workspace';

export const metadata = {
  title:'Finance & Transactions — MANU.OS',
  description:'Private, manually tracked bank and cash balances within ManuOS.',
};

export default function FinancePage(){
  return (
    <Page eyebrow="Personal finance" title="Your money, clearly."
      actions={<a href="#finance-transactions" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white">Record a payment</a>}
      subtitle="Track Post Bank, CTBC and your cash wallet together. Balances reflect what you record, not live bank data.">
      <FinanceAccountsWorkspace />
      <FinanceTransactions />
    </Page>
  );
}
