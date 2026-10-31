# ManuOS Finance — Phase 6: multi-day purchase allocation

Date: 2026-10-30
Development branch: feature/finance-phase-6-allocation
Base: feature/finance-phase-5-budget
Status: DEV IMPLEMENTATION, isolated PostgreSQL + CI only. No production DB migration, merge, or deployment.

## Architecture and changed files

Reuses existing ManuOS Next.js app, Supabase user authentication, owner-scoped immutable ledger, existing Phase 2 grocery allocation definitions, Phase 4 expense form, and Phase 5 daily budget summaries. No new bank balance store.

Added:
- lib/finance/allocation-editor.ts — pure purchase validation, item-level totals, exact integer-minor-unit preview and saved-rule hydration.
- components/finance/purchase-allocation-editor.tsx — responsive controls for single-day, multi-day whole purchase and optional item-level basket. Number-of-days presets 1/2/3/4/5/7, custom 1–365 days, allocation start date, and live exact preview.
- components/finance/day-breakdown.tsx — date selector, owner-only per-day attribution records, daily budget standard remainder, link to original expense details, server pagination.
- supabase/migrations/015_finance_grocery_allocations.sql — separate scheduled grocery definitions, matching owner validation and revision/audit/idempotency, posting rules in one ledger transaction, and indexed owner-scoped day-detail RPC.
- tests/finance-allocation-phase6.spec.ts — exact cents, month/year/leap day, overlap, basket and editing math.
- tests/finance-phase6-postgres.sql — isolated full-DB invariant and security scenarios.
- .github/workflows/finance-phase6-validation.yml — lint, TypeScript, build, desktop/mobile math and smoke, PostgreSQL 16 migrations 009–015 + phase regressions.

Modified:
- components/finance/transactions-workspace.tsx — loads saved allocation rules before allowing an edit; one atomic save, edit or void; future expense schedule retains rules; the same existing expense ledger transaction is edited, not duplicated.
- lib/finance/repository.ts — read saved rules, schedule with allocations, server-bounded daily cost breakdown and owner-protected original purchase read.
- app/finance/page.tsx — adds daily breakdown inside existing Finance page. Other pages were not redesigned.

## Real accounting example in tests

Opening Post Bank NT$3,000 + CTBC NT$3,000 + Cash NT$500 = NT$6,500.

On October 30, recording a **single PX Mart purchase of NT$450 from CTBC** and allocating it from October 30 over **3 days** produces:

- **Bank ledger:** exactly ONE NT$450 debit to CTBC; CTBC remaining NT$2,550; combined tracked available money NT$6,050.
- **Actual October spending:** NT$450. Actual November spending: NT$0.
- **Planning October 30:** NT$150; October 31: NT$150; November 1: NT$150.
- **Allocated October consumption:** NT$300. **Allocated November consumption:** NT$150.
- Neither allocated day adds any further bank posting. Bank/cash total remains NT$6,050 (before subsequent transactions).

The database test also checks a subsequent correction NT$450/3 days to NT$500/5 days: old bank effect is reversed and one corrected charge applied; old allocation rules replaced atomically. Editing the payment account correctly restores CTBC and debits Post Bank. Voiding restores the corrected single charge and eliminates active daily allocations. Replays, stale versions, and cross-user writes are rejected.

## Exact rules and reporting policy

- Whole purchase: one allocation rule totaling the actual debit. Optional basket items are different rules under the SAME original transaction; all item amounts must exactly equal the basket total.
- Integer minor units only, with quotient/remainder distribution (earlier days get an extra cent). No floating-point accumulation.
- Ordinary purchase with no allocation rules is attributed in full to its transaction date. Multiple overlapping rules and ordinary expenses sum on each date.
- A purchase can be paid in one month and planned for consumption in another. Month cash-flow and day-consumption views must remain separate. Phase 5 daily budget uses allocated consumption, and the remaining monthly cash-flow budget uses actual spending.
- Future-dated transactions are saved as planned transactions without bank impact; their allocation metadata stays attached. Posting on/after due date creates one real expense and its allocation rules atomically.
- For accurate money availability, refer to Phase 3 tracked account ledger balances rather than future planned consumption.
- Existing refund policy: refunds are separate income entries, not implicit reversals of prior paid expenses.
- The original transaction and before/after allocation definitions are audited in finance_ledger_events. Financially significant edits following reconciliation are blocked by Phase 4 reconciliation guard.
- Date strings remain ISO calendar days, interpreted in the configured accounting timezone, default Asia/Taipei. The interface currently defaults to Taipei; see remaining limitations.
- Existing TWD accounts, INR monthly budget snapshots and frozen manual FX rates remain unchanged. Allocations are in TWD cents; never add INR and TWD amounts directly.

## Release checks and known limitations

Do NOT deploy or merge until prior Phases 2–5 and this Phase 6 are reviewed and applied IN ORDER in an authorized isolated Supabase staging environment. New database migration 015 is not approved for live Supabase. Confirm schema state, take backup/test restore, perform signed-in Android and multi-device persistence checks, and verify concurrency/failure recovery against staging.

Local GitHub Actions PostgreSQL 16 fixture uses fake users, not a connected live Supabase deployment. Desktop and mobile tests exercise calculation logic and unconfigured Finance route but do not emulate an authenticated real backend flow. In particular, actual Samsung Android touch testing and server persistence after signout/signin are NOT verified.

Day breakdown is a date-based section, not a full month-view spending calendar. Full calendar/timeline/navigation is reserved for **Phase 7**. No banking credentials or bank APIs were added. There are no automatic background payments. Allocation planning views are server-read-only.

Stop at Phase 6. Phase 7: daily financial calendar, spending timeline, upcoming grocery allocations, daily remaining budget visualization.
