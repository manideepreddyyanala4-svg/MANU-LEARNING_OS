import { Page } from '@/components/ui';
import { FinanceAccountsWorkspace } from '@/components/finance/accounts-workspace';
import { FinanceTransactions } from '@/components/finance/transactions-workspace';
import { FinanceBudgetWorkspace } from '@/components/finance/budget-workspace';
import { FinanceQuickLauncher } from '@/components/finance/quick-launcher';

export const metadata = {
  title:'Finance & Transactions — MANU.OS',
  description:'Private, manually tracked bank and cash balances within ManuOS.',
};

export default function FinancePage(){
  return (
    <Page eyebrow="Personal finance" title="Your money, clearly."
      actions={<FinanceQuickLauncher />}
      subtitle="Track Post Bank, CTBC and your cash wallet together. Balances reflect what you record, not live bank data.">
      <FinanceAccountsWorkspace />
      <FinanceBudgetWorkspace />
      <FinanceTransactions />
    </Page>
  );
}
