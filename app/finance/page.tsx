import { Page } from '@/components/ui';
import { FinanceModule } from '@/components/finance/finance-module';
import { FinanceQuickLauncher } from '@/components/finance/quick-launcher';

export const metadata = {
 title:'Finance — MANU.OS',
 description:'Private, manually recorded financial accounts, budgets, spending and backups.',
};
export default function FinancePage(){
 return <Page eyebrow="Personal finance" title="Your money, clearly."
   actions={<FinanceQuickLauncher/>}
   subtitle="Post Bank, CTBC and Cash Wallet. Balances reflect your own entries, not live bank data.">
   <FinanceModule/>
 </Page>;
}
