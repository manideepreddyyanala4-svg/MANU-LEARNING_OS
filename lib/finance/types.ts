/** Phase 2 contract. All balances are manually tracked estimates, never bank-verified. */
export type Currency = 'TWD' | 'INR';
export type LedgerCurrency = 'TWD';
/** Base-10 signed minor units, serialized as TEXT to preserve precision. */
export type MoneyMinor = string;
export type ISODate = string;
export type TransactionKind = 'opening' | 'income' | 'expense' | 'transfer' | 'adjustment';

export interface FinanceAccount {
  accountId: string;
  code: string;
  name: string;
  kind: 'bank' | 'cash';
  currency: LedgerCurrency;
  isActive: boolean;
  balanceMinor: MoneyMinor;
}

export interface FinanceCategory {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isArchived: boolean;
}

export interface FinanceTransaction {
  id: string;
  kind: TransactionKind;
  amountMinor: MoneyMinor;
  currency: LedgerCurrency;
  txnDate: ISODate;
  txnTime: string;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  categoryId: string | null;
  merchant: string;
  note: string;
  revision: number;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryRule {
  /** Optional categorization for an individual item. */
  itemName?: string;
  categoryId?: string | null;
  amountMinor: MoneyMinor;
  startDate: ISODate;
  durationDays: number;
}

export interface DailyAllocation {
  date: ISODate;
  amountMinor: MoneyMinor;
  transactionId: string;
  categoryId: string | null;
}

export interface TransactionCommand {
  /** Create a fresh UUID per user intent; reuse it only when retrying that intent. */
  idempotencyKey: string;
  kind: TransactionKind;
  amountMinor: MoneyMinor;
  txnDate: ISODate;
  txnTime?: string | null;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  merchant?: string;
  note?: string;
  /** Present only for edits. */
  transactionId?: string;
  expectedRevision?: number;
  allocations?: GroceryRule[];
}

export interface MonthlyBudget {
  id: string;
  monthStart: ISODate;
  budgetMinor: MoneyMinor;
  budgetCurrency: Currency;
  fxRateId: string | null;
  /** Frozen exchange-rate snapshot, null for a TWD budget. */
  fxTwdPerInr: string | null;
  resolvedTwdMinor: MoneyMinor;
  revision: number;
}

export interface MonthlySummary {
  monthStart: ISODate;
  budgetCurrency: Currency | null;
  budgetMinor: MoneyMinor | null;
  resolvedTwdMinor: MoneyMinor | null;
  actualExpenseMinor: MoneyMinor;
  actualIncomeMinor: MoneyMinor;
  allocatedConsumptionMinor: MoneyMinor;
}

export interface ManualFxRate {
  id: string;
  twdPerInr: string;
  rateSource: 'manual';
  note: string;
  recordedAt: string;
}


/** RLS-backed server-side aggregates. No browser-side total from truncated history. */
export interface FinanceAccountOverview {
  accountId: string;
  openingTransactionId: string | null;
  openingRevision: number | null;
  openingDate: ISODate | null;
  openingMinor: MoneyMinor;
  incomeMinor: MoneyMinor;
  expenseMinor: MoneyMinor;
  netTransferMinor: MoneyMinor;
  adjustmentMinor: MoneyMinor;
  lastActivityAt: string | null;
  lastReconciledAt: string | null;
}

export interface OpeningBalanceEntry {
  accountId: string;
  amountMinor: MoneyMinor;
  effectiveDate: ISODate;
  /** Stable for a retry of the SAME entry, new UUID for a new intent. */
  operationKey: string;
}

export interface AccountHistoryPage {
  rows: FinanceTransaction[];
  count: number;
}
