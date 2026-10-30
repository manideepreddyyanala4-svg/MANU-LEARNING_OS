# ManuOS Finance — Phase 7 Daily Financial Calendar

2026-10-30 · Development branch: `feature/finance-phase-7-calendar`  
Parent branch: `feature/finance-phase-6-allocation`. This phase is **not merged or deployed**. Migrations 009–016 must not be applied on production without explicit authorization and staged verification.

## What changed

- **`app/finance/page.tsx`** now offers in-page Accounts / Budget / Transactions / Calendar navigation and mounts the calendar where Phase 6's standalone day-breakdown panel used to appear. The existing bank, budget and transaction workspaces remain.
- **`components/finance/finance-calendar.tsx`** builds the mobile-first, accessible month grid with previous/next month navigation and month picker, consumption/payment toggle, account/category/grocery filters, exact daily allowance status, selected-day timeline, purchase-edit action and upcoming seven-day saved groceries.
- **`components/finance/transactions-workspace.tsx`** listens for calendar action `manuos:finance-edit-transaction` and fetches the authenticated original expense, opening the existing auditable Phase 4/6 edit form. This avoids adding another ledger editor.
- **`lib/finance/calendar-view.ts`** shares Phase 5 exact minor-unit daily target distribution, calendar date math and consistency checks against the authoritative monthly daily source. Filtered amounts must never exceed real unfiltered totals, and incomplete or inconsistent month data is rejected rather than estimated.
- **`lib/finance/repository.ts`** adds `listFinanceCalendarDays(month, filters)` for one month of bounded filtered daily metrics and `listFinanceCalendarDayDetails(date, view, filters, offset, limit)` for a paginated day timeline.
- **`supabase/migrations/016_finance_calendar_metrics.sql`** adds **read-only**, `security invoker`, `auth.uid()`-scoped PostgreSQL range and day-detail functions, `finance_calendar_days` and `finance_calendar_day_details`. Existing finance_transactions, postings, budgets, allocation tables, and exchange-rate snapshots are unchanged.
- **`tests/finance-calendar-phase7.spec.ts`**, **`tests/finance-phase7-postgres.sql`**, **`.github/workflows/finance-phase7-validation.yml`** add calendar math, PostgreSQL integration and regression CI checks.

## Finance correctness contract

- **Actual payment view**: one expense in the original transaction date, not each grocery usage day. Does not include income, transfers, reconciliation, voided payments, or opening balances.
- **Daily consumption view (default)**: ordinary paid expenses on their payment date + per-day portions of genuine, nonvoided saved grocery allocation rules. The same grocery purchase is never counted at full cost *and* as daily allocations.
- A paid purchase from a prior month contributes to a later month's consumption if the saved interval overlaps, without a later bank deduction.
- **Month budget**: owner-selected INR or TWD budget; INR is displayed with its persisted manual conversion snapshot, never a guessed or live exchange rate.
- **Standard daily allowances**: fixed money-minor-unit amounts allocated across each date with quotient/remainder precision; total equals the saved TWD budget exactly. Status and selected-day remaining are computed from **unfiltered** consumption; filtering changes only the displayed subset of spending.
- **Near target**: consumption is at least 80% of that day's allowance; **Over target**: consumption exceeds that allowance. Text accompanies colors; the UI never clamps overspending to zero.
- **Dynamic remaining-month average**: sourced from the existing Phase 5 `buildBudgetProjection` using actual monthly expenses and days left *including today*. Past months show historical records; future months are planning only. It is not available bank balance or "money you may spend today".
- **Upcoming groceries**: the next seven dates beginning tomorrow, from active **already-paid** grocery allocation definitions. It does not treat an unpaid scheduled plan as completed spending. Cross-month lookups retrieve both relevant month segments.
- **Timeline**: purchase date, merchant/item, original account and category, allocation period, exact attributed amount, and action to open the original expense. It shows dates but does not invent wall-clock transaction times.
- All data comes from authenticated owner-scoped finance tables and RPCs. No dummy transactions, bank connection, new write service, or new financial ledger entry.

## Example to verify (historical fixture)

A NT$7,500 month with 30 calendar days has a NT$250.00 standard daily allowance.

A previously paid NT$450 grocery purchase spread over Oct 30, Oct 31 and Nov 1 contributes **NT$150.00 to Nov 1**. A separate paid NT$40 coffee on Nov 1 contributes **NT$40.00**, so consumption is NT$190.00 and standard remaining is **NT$60.00**.

The actual-cashflow view on Nov 1 shows NT$40.00; the Oct grocery bank debit stays in October and is never duplicated. Isolated SQL tests also compare month range results against Phase 5/6 daily summaries, exercise account/category filters, overlap, edits and voiding, pagination, user isolation and leap days.

## Deployment and test limitations

- The code and isolated database tests are **not** evidence that the live website has these features. This is a review-only development branch with migration 016 unapplied in production.
- Prior migrations 009–015 and draft PRs 2–6 are prerequisites; check actual Supabase migration history and live schema before deployment.
- Test migration 016 with fake users in isolated PostgreSQL first, then in an authorized staging Supabase environment with a backup/restore plan.
- Automated browser CI runs pure calendar arithmetic and *unconfigured* desktop/mobile Finance-route smoke, not an authenticated real mobile phone or live Supabase. Manual Android validation, signed-in refresh persistence, navigation and live reconciliation behavior remain release gates.
- Date cells use compact TWD numeric text on narrow screens and include accessible full-amount labels. Full historical analytics and charts remain Phase 8.
- The earlier Phase 6 `day-breakdown.tsx` file is preserved, though no longer mounted alongside this calendar, to minimize unnecessary deletion.

Stop at Phase 7. Next: Phase 8 category spending analytics and financial trend reports.
