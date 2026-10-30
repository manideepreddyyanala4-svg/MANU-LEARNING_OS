'use client';
import { Plus } from 'lucide-react';

/** Opens the quick-entry form in one tap, from the sticky page header. */
export function FinanceQuickLauncher(){
  return <button type="button"
    onClick={()=>window.dispatchEvent(new Event('manuos:finance-open-expense'))}
    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white hover:opacity-90">
    <Plus size={16}/> Add Expense
  </button>;
}
