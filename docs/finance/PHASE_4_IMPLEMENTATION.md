# ManuOS Finance — Phase 4 implementation handoff

Date: 2026-10-30. Development branch: feature/finance-phase-4-transactions.

Status: code and isolated CI only. No production database migration or deployment was performed.

## Delivered
- Finance page: one-tap Add Expense action, Add Income, exact TWD amounts, account and category, merchant/source, optional notes, Taipei date, success/error/loading states, and mobile-friendly forms.
- Income sources: Research Assistant stipend, part-time salary, family support, refund, other, and custom free-text descriptions. Refunds are **separate income**, not automatic prior-expense reversals.
- Transaction history: database-side paging, merchant search, account/category/date/type filters, newest/oldest sort, preserved voids, and separate transaction/audit timestamps.
- Edit and void: existing Phase 2 ledger RPCs, expected revision, stable idempotency key and atomic reversing postings. Voids retain audit history. No direct unvoid operation exists.
- Schedule: future-dated entries are proposals, never ledger postings. They can be edited/cancelled; users must explicitly Post on or after the date. The due posting is atomic and idempotent.
- Phase 3 bank cards automatically refresh only following a confirmed ledger save.
- Reconciliation-conflict SQL trigger rejects financially significant changes to older entries that would invalidate a later manually verified balance.
- New files: components/finance/transactions-workspace.tsx, components/finance/quick-launcher.tsx, supabase/migrations/013_finance_transactions_and_schedules.sql, tests/finance-phase4-postgres.sql, .github/workflows/finance-phase4-validation.yml. Modified files: app/finance/page.tsx, components/finance/accounts-workspace.tsx, lib/finance/repository.ts.

## Accounting policies
- TWD-only bank/cash accounts; INR may be used for later budget display with a manually provided rate. Never mix currencies without a defined rate.
- Expense reduces only the chosen account; income increases only receiving account. Transfers do not count as spending or income.
- Money is stored as integer minor units and audited as immutable ledger postings. Edits reverse the old effect and apply the new one.
- Actual expenses belong to the recorded Taipei-local transaction date. Future spending never reduces current money until explicitly posted.
- Refunds use a distinct income transaction, and are not removed from the historical expenditure sum.
- Custom categories are owner-scoped. UI preferences may be local, but all financial records are persisted through owner-authenticated PostgreSQL RPCs.

## Testing and release limitations
- GitHub Actions checks finance lint, TypeScript, production build (no deploy), desktop/mobile unconfigured smoke tests, and PostgreSQL 16 disposable-instance assertions for amounts, correction, account switch, void, scheduled entries, repeat requests, stale revision and cross-user denial.
- Isolated test correctness is not production deployment verification. The connected GitHub connector has not validated live Supabase migration history, backups, phone-specific user behavior, or persistence across devices after login.
- Test authenticated staging, offline/failed requests, concurrent clients, and Samsung Android UI before approving deployment.
- Postgres migration 013 requires 009–012, and must first be reviewed and executed in authorized **staging**, never automatically in production.
- Transaction free-text search is merchant/source only; advanced multi-field search is out of scope.
- No automatic future postings, no full grocery-allocation UI, no monthly-budget editor, and no charts. Those are later phases.

Stop after Phase 4. Phase 5 is editable budgets and dynamic daily allowance.
