# ManuOS Finance — Phase 8 financial analytics

Date: 2026-10-30  
Branch: `feature/finance-phase-8-analytics` (based on reviewed Phase 7 development branch).  
**Development only.** No production Supabase migrations, release, or deployment authorized.

## Source-of-truth audit and implementation

Before editing, verified actual source from the existing phases: 009–016 migrations, account posting-based balances, owner-authenticated finance RPCs, categories, expense/income ledger, frozen manual TWD/INR budget snapshots, daily allocation rules and calendar summary, and Phase 7 passing CI. The original finance application is preserved.

### New files
- `supabase/migrations/017_finance_analytics.sql`: owner-scoped, **read-only** SQL functions `finance_analytics_overview`, `finance_analytics_months`, `finance_analytics_daily`, `finance_analytics_expenses` and curated `finance_analytics_merchant`. The first three aggregate by date before crossing the network. The drilldown RPC pages the original expenses (15 UI rows at a time). Every sum uses PostgreSQL numeric and returns minor amounts as text to avoid JS floating-point money calculations. Authenticated ownership, account and category filter ownership and bounded ranges are checked.
- `lib/finance/analytics-repository.ts`: existing Supabase client/authentication, RPC adapters with exact-string amounts, count and date validation.
- `lib/finance/analytics-model.ts`: pure exact money math for net flow, average/day, percentage shares, budget remaining, monthly comparisons, coverage statuses, and cautious optional linear projection.
- `components/finance/finance-analytics.tsx`: responsive dashboard, account/category/merchant filters, selected period presets/custom dates, 10 financial overview metrics, category and merchant interactive bars and drilldown, account totals, monthly charts, daily cash-flow-vs-consumption charts, groceries-vs-outside-food comparison and completed-month food trends, upcoming already-paid grocery allocations, deterministic insights and optional projection. No new chart or AI dependency.
- `tests/finance-analytics-phase8.spec.ts`, `tests/finance-phase8-postgres.sql`, `.github/workflows/finance-phase8-validation.yml`: application calculation and isolated PostgreSQL testing, alongside all earlier phase regressions.

### Changed file
- `app/finance/page.tsx`: adds an Analytics link and the dashboard within the existing native Finance page. No separate app or unrelated page was changed.

## Calculation contract

- **Total actual expenses**: sum of active, posted `kind='expense'` purchases dated within the chosen range. The expense ledger itself is the only actual-payment authority. Voided transactions, planned unpaid entries, incoming money, transfers, opening balances, and reconciliation adjustments are excluded.
- **Income**: sum of active posted `kind='income'` entries, including *separately entered refunds*. Income is null / not comparable if merchant or expense category filters are selected. When filtered only by payment account, income uses the receiving account; transfers remain excluded.
- **Net cash flow**: posted income minus posted expenses. Neither this nor the remaining budget is an available account balance.
- **Categories**: original purchase categories, including user-created/archived categories. Exact total reconciles to all expenses. Display shares are allocated deterministically by largest remainder so the printed percentages total 100.00% for all nonempty categories, despite cent-fraction rounding.
- **Merchants**: only explicit known aliases `PXMart`/`PX Mart`/`PX-Mart`, `FamilyMart`, `7-Eleven` are normalized, without editing the original merchant. Unknown stores stay distinct, blank merchant remains NULL (displayed as **Merchant not recorded**). Grouping and drilldown use the same rule.
- **Account spend**: original expense source account. CTBC-to-cash transfers are not purchases; subsequent cash purchases count only from cash.
- **Budget**: for unfiltered full or current-to-date single-month views only, actual posted expense versus that month's saved limit. INR limits display original saved INR budget plus frozen manual TWD conversion. Negative remaining and utilization over 100% remain visible. Filters cannot make partial expenses appear to be overall budget compliance.
- **Trend**: configurable 3, 6 or 12 months; monthly chart uses the posted-expense date, with exact month-to-month amount and signed percentage change only between comparable completed recorded months. Month coverage from the earliest retained transaction date is marked `unknown`, `partial-start`, `recorded` or `future`. A recorded month may still be incomplete if the user omitted expenses, so the UI states this.
- **Daily chart**: a single month in either posted cash-flow or attributed daily consumption. The SQL uses the existing allocation rule quotient/remainder policy; it does **not** add a full multi-day expense again on its consumption days.
- **Groceries**: paid purchase amount and count from category, average paid ticket, daily attributed grocery cost, frequent grocery merchant counts, and next seven dates of saved **already-paid** allocations. Upcoming allocations are not unpaid bills or another withdrawal.
- **Food comparison**: recorded Groceries vs Outside Food category totals and shares, combined recorded spend, and when available, completed-month comparable trends using the same account scope. No meal-count/health/cost-effectiveness inference.
- **Daily average denominator**: calendar days elapsed in the current month, full days for completed month, observed selected dates for custom range (future dates do not count as spent).
- **Optional projection**: shown only upon request, when current-month unfiltered cash spending has at least seven elapsed calendar days and tracked history predates the start of the month. Linear extrapolation is explicitly speculative, not a new planned charge or cash withdrawal. If the history may be incomplete, the UI warns accordingly.

## Exact checked illustration

With October TWD budget **NT$6,000** and real October expenses PX Mart **NT$2,000**, FamilyMart **NT$500**, transportation **NT$300**, and Other **NT$200**, the totals are:
- Actual expenses **NT$3,000**, remaining budget **NT$3,000**, utilization **50.00%**.
- Groceries **NT$2,000**, which is **66.67%** of actual expenses to two decimal places.
- A separate real income of **NT$1,000** produces **–NT$2,000 net cash flow**; a transfer between CTBC and Cash does **not** raise expenses.
- A purchase of NT$1,250 paid on October 30 and spread over 3 days contributes **NT$416.67**, **NT$416.67**, and **NT$416.66** to Oct 30, Oct 31 and Nov 1 for consumption, with **one single payment on Oct 30**. November has no new bank debit from that allocation.
- Voids remove active expenses; purchase edits change the same ledger transaction; refunds remain separately posted income; bank-account reconciliation corrections are not consumer expenses.

## Test scope and release gates

`finance-phase8-validation.yml` validates the finance-specific ESLint, TypeScript, Next.js production build, desktop and mobile calculation and unconfigured-route tests, isolated PostgreSQL 16 migrations **009–017**, owner filtering, FX snapshots, category totals, merchant aliases, date ranges, transfers, refunds, reconciliation, voiding, purchase edits, and prior-phase invariants. GitHub CI run is the authority for executed pass counts. Repository-wide lint has pre-existing unrelated errors and remains informational.

### Limitations to carry into Phase 9
1. **Not deployed.** Real signed-in Supabase E2E, migration 017 staging, and responsive Samsung Android screenshot/touch checks have not been run. All currently passing browser tests use the unconfigured Finance route and pure calculation functions.
2. Tracking history is manually entered. The earliest retained transaction date gives **no guarantee** that all purchases were entered, so monthly zero and projections remain conditional on user discipline.
3. Unrecognized merchant variations are deliberately not auto-merged. A user-managed alias CRUD screen is not part of this phase. Missing merchant and category group breakdowns are shown but unassigned-category drilldown uses the existing transaction history instead of guessing a category ID.
4. Expense income dimensions are incompatible with merchant/category filtering, so those filtered income/net-flow metrics display **Not comparable**, not invented zero.
5. Full-scale authenticated mobile performance and multi-device freshness cannot be established until Phase 9 staging; owner-scoped PostgreSQL aggregation and bounded pagination reduce browser loading but cannot substitute for integration tests.
6. Refunds cannot be silently netted from the original spending category without a separate linkage; this phase preserves Phase 4's refund-as-income policy.
7. The budget utilization used for a selected period is only displayed when its month and unfiltered spending are meaningfully comparable; multi-month/custom partial budgeting remains in the per-month trend, not a fabricated single budget.

Phase 9: consistent Finance UI/UX, mobile accessibility, security/privacy, data export/backups and real authenticated end-to-end reliability checks. Stop at Phase 8.
