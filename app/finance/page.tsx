import { Page } from '@/components/ui';
import { FinanceAccountsWorkspace } from '@/components/finance/accounts-workspace';

export const metadata = {
  title:'Finance Accounts — MANU.OS',
  description:'Private, manually tracked bank and cash balances within ManuOS.',
};

export default function FinancePage(){
  return (
    <Page eyebrow="Personal finance" title="Your money, clearly."
      subtitle="Track Post Bank, CTBC and your cash wallet together. Balances reflect what you record, not live bank data.">
      <FinanceAccountsWorkspace />
    </Page>
  );
}
