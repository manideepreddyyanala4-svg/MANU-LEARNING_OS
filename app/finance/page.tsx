import { Page } from '@/components/ui';
import { FinanceAccountsWorkspace } from '@/components/finance/accounts-workspace';
import { FinanceTransactions } from '@/components/finance/transactions-workspace';
import { FinanceBudgetWorkspace } from '@/components/finance/budget-workspace';
import { FinanceQuickLauncher } from '@/components/finance/quick-launcher';
import { FinanceCalendar } from '@/components/finance/finance-calendar';

export const metadata = {
  title:'Finance & Transactions — MANU.OS',
  description:'Private, manually tracked bank and cash balances within ManuOS.',
};

export default function FinancePage(){
  return (
    <Page eyebrow="Personal finance" title="Your money, clearly."
      actions={<FinanceQuickLauncher />}
      subtitle="Track Post Bank, CTBC and your cash wallet together. Balances reflect what you record, not live bank data.">
      <nav aria-label="Finance sections" className="flex flex-wrap gap-2 text-sm">
        {[
          ['Accounts','#finance-accounts-heading'],
          ['Budget','#finance-budget'],
          ['Transactions','#finance-transactions'],
          ['Calendar','#finance-calendar']
        ].map(([name,href])=><a key={href} href={href}
          className="rounded-xl border border-[var(--line)] px-4 py-2 font-semibold text-[var(--fg)]">
          {name}</a>)}
      </nav>
      <FinanceAccountsWorkspace />
      <FinanceBudgetWorkspace />
      <FinanceTransactions />
      <FinanceCalendar />
    </Page>
  );
}
