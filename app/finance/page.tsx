import { Page } from '@/components/ui';
import { FinanceAccountsWorkspace } from '@/components/finance/accounts-workspace';
import { FinanceTransactions } from '@/components/finance/transactions-workspace';
import { FinanceBudgetWorkspace } from '@/components/finance/budget-workspace';
import { FinanceQuickLauncher } from '@/components/finance/quick-launcher';
import { FinanceCalendar } from '@/components/finance/finance-calendar';
import { FinanceAnalytics } from '@/components/finance/finance-analytics';
import { FinanceDataExport } from '@/components/finance/finance-data-export';

export const metadata = {
  title:'Finance & Transactions — MANU.OS',
  description:'Private, manually tracked bank and cash balances within ManuOS.',
};

export default function FinancePage(){
  return (
    <Page eyebrow="Personal finance" title="Your money, clearly."
      actions={<FinanceQuickLauncher />}
      subtitle="Track Post Bank, CTBC and your cash wallet together. Balances reflect what you record, not live bank data.">
      <nav aria-label="Finance sections" className="grid grid-cols-3 gap-2 text-xs sm:flex sm:flex-wrap sm:text-sm">
        {[
          ['Overview','#finance-overview'],
          ['Accounts','#finance-accounts-heading'],
          ['Budget','#finance-budget'],
          ['Transactions','#finance-transactions'],
          ['Calendar','#finance-calendar'],
          ['Analytics','#finance-analytics'],
          ['Export','#finance-export']
        ].map(([name,href])=><a key={href} href={href}
          className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] px-2 py-2 text-center font-semibold text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-4">
          {name}</a>)}
      </nav>
      <FinanceAccountsWorkspace />
      <FinanceBudgetWorkspace />
      <FinanceTransactions />
      <FinanceCalendar />
      <FinanceAnalytics />
      <FinanceDataExport />
    </Page>
  );
}
