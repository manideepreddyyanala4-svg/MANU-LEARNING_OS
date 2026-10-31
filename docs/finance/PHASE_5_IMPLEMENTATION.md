# ManuOS Finance — Phase 5 monthly budget and daily limits

**Status:** Development branch only. **Date:** 2026-10-30.  
**Branch:** `feature/finance-phase-5-budget`  
**Parent:** Phase 4 transaction branch (draft, not production).  
**Production deployment, production Supabase migrations, and production money changes:** NOT performed.

## Implemented

- `components/finance/budget-workspace.tsx`: monthly selector (past/current/future), create/edit, manual INR/TWD budgets, manual rate selection/creation, optional copy of previous month into an editable draft, utilization progress, warnings at 75%, 90%, over-budget, standard and dynamic daily allowances, today attributed cost, and separate actual vs allocated costs. The editor does not automatically copy budgets or invent amounts. There is no full calendar or analytics.
- `lib/finance/budget-dashboard.ts`: exact signed integer daily and monthly planning helpers. All amounts are minor-unit decimal strings. No floating point for money; rational daily targets and deterministic minor-unit remainder distribution.
- `lib/finance/repository.ts`: authenticated selected-month budget read, preferences and rate snapshot read, owner-scoped daily read.
- `supabase/migrations/014_finance_daily_budget.sql`: read-only, security-invoker, owner-scoped daily cash-flow and consumption (28/29/30/31 rows). This does not change or add bank/ledger postings, and handles previous-month purchase allocations in the selected month.
- `app/finance/page.tsx`: adds budget section while preserving Phase 3 accounts, Phase 4 transactions, and existing shared navigation.
- `tests/finance-budget.spec.ts`: exact-money/daily math tests (including leap years, over-budget, month boundaries, base vs dynamic allowances and INR FX).
- `tests/finance-phase5-postgres.sql`: disposable PostgreSQL invariants (revision conflict, independent months, manual FX snapshot, historical revaluation requiring explicit edit, bank invariant, cross-month allocation, account transfers excluded from spend, owner isolation and expense edits).
- `.github/workflows/finance-phase5-validation.yml`: runs lint/typecheck/Next.js build and desktop/mobile smoke and pure math tests, plus disposable PostgreSQL 16 migration/invariant/regression tests.

## Source of truth and formulas

For month M (calendar months in saved timezone, default Asia/Taipei):

- B = persisted **resolved TWD monthly budget**. An INR budget is stored in INR paise and converted exactly **once** to a fixed TWD-cent snapshot using the owner-selected manually entered `1 INR = N TWD` rate, rounded half-up to the nearest cent.
- **Actual expense (E)** = sum of latest non-void `expense` transactions dated in M. Transferred money, cash withdrawal/deposit, openings, adjustments, all income (including separate refund income) are excluded. No expense is created by saving a budget.
- **Actual budget remaining** = B − E (can be negative).
- **Utilization** = E / B as a rational until presentation, percentage displayed with integer basis points. Zero B means percentage undefined (still show over-budget when E positive).
- **Standard daily** = B / exact calendar day count, rational until display. If distributing cents as a complete schedule, quotient/remainder assigns the extra cents to earlier days; sum of all days equals exactly B.
- **Today’s standard remainder** = B / month-day-count − **today’s attributed consumption** (which includes existing daily grocery allocations). A negative figure is labeled over-target.
- **Dynamic remaining-days average (current month only)** = (B − E) / count of dates from today through month end **inclusive**, not a guaranteed extra amount available today. Past months have no remaining-days average. Future months show B/day-count planning average.
- **Allocated consumption (A)** is a **different planning metric**: for ordinary purchases, the actual transaction date; for any already-defined multi-day allocation, daily rule shares on their attributed dates, even across a month boundary. Allocated remaining = B − A. This is NOT a second bank deduction. Phase 6 will add allocation editing UI.
- Existing `finance_monthly_summary` remains authoritative for actual and allocated monthly totals. The new daily read model must sum exactly to these figures; the projection refuses mismatches instead of silently inventing totals.
- The existing immutable finance ledger postings remain the source of truth for account balances.

## Safety policy

- Every budget belongs to an authenticated user and is stored in `finance_monthly_budgets`, with owner-only RLS. Reads follow the existing owner-scoped views; writes go through the existing `finance_upsert_monthly_budget` authenticated, revision-checked RPC.
- Each month's budget is independently editable and previously saved months are never auto-revalued due to a new FX rate. An explicit edit and selected rate freezes a new snapshot. The saved FX rate includes a server timestamp; this is never described as live.
- Budget modifications have no effect on `finance_postings`, `finance_transactions`, or bank balances. Unsuccessful or revision-conflicted edits are reported rather than assumed saved.
- Only TWD bank accounts are supported in the current ledger. INR is a budgeting currency. Do not add TWD and INR before conversion.
- Income and refunds follow Phase 4's **separate income** policy and never silently net against spending.
- Do not apply migration 014 before migrations 009–013 in an authorized staging database. No changes are made to production.
- Direct Android device / authenticated staging CRUD, refresh/sign-out/sign-in persistence, real DB RLS grants, timezone preference changes, and production backup/restore have NOT been checked by offline GitHub Actions. Run them before production approval.

## Deliberate Phase 5 limits

- Phase 6 handles the full multi-day grocery allocation editor.
- Phases 7–8 handle a daily calendar and advanced charts.
- No live FX feed, no automatic copying month budgets, and no bank synchronization.
- History/projections are deterministic calculations from recorded transactions. No forecast claims are made.

Stop after Phase 5; Phase 6 is multi-day grocery allocation.
