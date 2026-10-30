# ManuOS Finance — Phase 1 verified audit and implementation contract

**Status:** Architecture/design only. **Date:** 2026-10-30. **Branch:** `docs/finance-phase-1-contract`. No production deployment, SQL execution, or finance UI implementation has been performed.

## 1. Evidence and access boundary

Read from connected repository `manideepreddyyanala4-svg/MANU-LEARNING_OS`, default branch `main`, on 2026-10-30. Verified source files: `package.json`, `README.md`, `app/layout.tsx`, `components/shell.tsx`, `components/ui.tsx`, `app/globals.css`, `proxy.ts`, `lib/supabase.ts`, `lib/supabase-server.ts`, `lib/learning.ts`, `lib/store.ts`, `lib/feature-flags.ts`, `app/login/page.tsx`, `app/page.tsx`, `app/api/learning-assets/route.ts`, `next.config.ts`, `tsconfig.json`, `playwright.config.ts`, `tests/smoke.spec.ts`, `supabase/migrations/001_initial.sql`, `003_foundation.sql`, `004_learning_v1.sql`, `006_rich_documents.sql`, `007_live_corrective.sql`, `008_learning_sections.sql`, `.env.example`, and code-index route/search results.

**Verified:** Next.js 16.4.2 App Router + React 19.3.1 + TypeScript 5.9; Tailwind CSS v4 with CSS design tokens and light/dark via next-themes; pnpm 10.28.2 / Node >=22 (README specifies Node 24); Supabase JS 2.118 + SSR 0.12.7; Playwright projects desktop Chromium, tablet, mobile Chrome and WebKit. `app/layout.tsx` wraps global `Shell`. `components/shell.tsx` controls shared desktop left sidebar, sticky topbar, mobile hamburger drawer, navigation arrays, command palette, theme and links. Learning routes have a specialized `LearningShell`, which finance must not use. Shared `Page`, `Card`, `Empty` exist in `components/ui.tsx`. CSS tokens include `--bg`, `--surface`, `--fg`, `--muted`, `--accent`, `--line`. Existing routes seen in source: `/`, `/login`, `/learning` and nested subject/topic routes, `/roadmap`, `/job-preparation` and legacy ASE pages, `/ideas`, `/files`, `/inbox`, `/progress`, `/settings`. Search of indexed repository for `finance` found no existing finance module. The global sidebar nav is not a horizontal top-level navigation; add finance as a primary sidebar/drawer destination, with topbar context.

**Verified from source, NOT live services:** `proxy.ts` calls Supabase `auth.getUser()` and redirects signed-out visitors to `/login?next=...`; `lib/supabase.ts` builds a browser Supabase client; `lib/supabase-server.ts` builds a cookie-bound server client; `app/login/page.tsx` signs in with password. SQL migrations define per-user `user_id`, RLS policies and, for learning entities, composite ownership FKs. `supabase/migrations/003_foundation.sql` demonstrates authenticated RPC functions. `app/api/learning-assets/route.ts` explicitly checks owner access before signed URL issuance. Existing `README.md` documents Vercel deployment, Supabase environment variables and native PWA manifest; `next.config.ts` has typedRoutes enabled. No service-role client is used in inspected app runtime code.

**Not verified:** live Vercel project ↔ GitHub mapping, applied production database schema/migration state, production Auth/RLS policies, secrets or environment configuration, current deploy health, mobile browser behavior, or actual test pass rates. `README.md` describes applying through migration 004, but repository code also contains migrations through 008; treat README as outdated until production schema is audited. No CI workflow was demonstrated by the searches performed. Tests were **not run** because the connector exposes source files, not an installed/executable checkout or live test database. These are Phase 2 gates, not assumed facts.

## 2. Integration boundaries

- New first-class route: `app/finance/page.tsx`; use the normal `Shell`, shared `Page`/`Card`/`Empty`, existing theme tokens and `lucide-react`. Do not modify existing routes or recreate auth.
- Add `{ href:'/finance', label:'Finance', icon: Wallet, subtext:'Balances & Spending' }` to `navGroups[0].items` immediately after Home in `components/shell.tsx`, appearing in desktop sidebar, mobile drawer and command palette automatically. Finance page can add a mobile-only prominent "Add expense" action, but must keep other ManuOS workflows intact. The sticky topbar breadcrumb uses navGroups and will resolve "Finance".
- Put finance-specific components in `components/finance/`, reusable deterministic calculations in `lib/finance/`, route-only UI in `app/finance/`, schema in the next migration after verifying current numbering (expected `supabase/migrations/009_finance.sql`), and tests in `tests/finance*.spec.ts` plus pure calculation unit tests. Avoid coupling to legacy `lib/store.ts` learning state.
- Default private authenticated owner; no anonymous or localStorage-only finance mode. Show a configuration/authentication error rather than a fake zero balance.

## 3. Data model proposal (additive only; no tables created in Phase 1)

All private tables: `id uuid` (where relevant), `user_id uuid not null` referring to `auth.users`, timestamps, RLS owner policies, and composite `(user_id, id)` uniqueness/FKs wherever children refer to private parents. Currency codes constrained to supported ISO values. User-set dates are DATE in the `Asia/Taipei` planning timezone; creation timestamps are UTC `timestamptz`.

| Table | Required fields and purpose |
|---|---|
| `finance_preferences` | PK `user_id`; `display_currency` TWD/INR, `timezone` default Asia/Taipei, optional current manual `fx_rate_id`; one row per owner. |
| `finance_fx_rates` | `id,user_id, twd_per_inr numeric(20,8) > 0, recorded_at, note`; historical manual rates are immutable versions, never described as live. |
| `finance_accounts` | `id,user_id,name,kind(bank/cash),currency` (MVP TWD), `is_active,created_at,updated_at`. Named Post Bank, CTBC, optional Cash; no real account numbers. Opening balance is a transaction, never a second balance field. |
| `finance_categories` | `id,user_id,name,is_default,is_archived`, uniqueness of normalized name per owner; defaults: Groceries, Outside Food, Transportation, Mobile/Internet, Education, Gym/Health, Shopping, Other. |
| `finance_monthly_budgets` | `id,user_id,month_start` (first date of month), `budget_minor bigint >= 0`, `budget_currency` TWD/INR, nullable `fx_rate_id`, `resolved_twd_minor bigint` frozen conversion, `revision,updated_at`, unique `(user_id,month_start)`. Explicit action required to revalue an INR budget. No implicit copied budget. |
| `finance_transactions` | `id,user_id,kind(opening/income/expense/transfer/adjustment),txn_date,amount_minor bigint, currency` TWD, `source_account_id,destination_account_id,category_id,merchant,note,revision,voided_at,created_at,updated_at`. Valid fields depend on type; adjustment may be signed. Never store bank credentials. |
| `finance_allocation_rules` | `id,user_id,transaction_id,item_name,category_id,amount_minor bigint > 0,start_date,duration_days int >= 1,sort_order`; zero/one main rule initially, many item rules later. Expense allocations cover the entire transaction amount exactly; zero rules means attribute full amount to `txn_date`. |
| `finance_ledger_events` | `id,user_id,transaction_id,revision,action(create/replace/void),idempotency_key uuid,prior_snapshot jsonb,new_snapshot jsonb,created_at`; immutable audit of financial writes. Unique `(user_id,idempotency_key)` and `(transaction_id,revision)`. |
| `finance_postings` | `id,user_id,ledger_event_id,account_id,delta_minor bigint NOT NULL`; immutable signed TWD account movement. No mutable cached balance. Index `(user_id,account_id)`; owner-matching composite FKs. |
| `finance_audit_events` | `id,user_id,entity_type,entity_id,action,old_value jsonb,new_value jsonb,created_at` for budget, manual FX, account/category changes and reconciliation. Immutable. |

Potential simpler event/audit consolidation can be made in Phase 2 **before SQL is applied**, but never change the core balance and idempotency invariants. Make schema guarantees with CHECK constraints, owner-FKs and authorized DB mutation functions, not frontend trust.

## 4. Financial accounting contract

All TWD postings use integer **hundredths** of a TWD; INR budgets use integer paise. Example NT$300 = `30000` minor units. Input via parsed decimal strings and integer math; never JS floating-point amount arithmetic. Validate signed and maximum-safe bounds before serialization; if using Postgres `bigint`, serialize large values as strings over the wire. Never put money calculations into CSS/UI formatting functions.

**Ledger:** `balance(account) = SUM(finance_postings.delta_minor)` for that account. `total_available_TWD = SUM(balance(active tracked accounts))`. Closed accounts with money require settlement/explicit inclusion policy before archiving; cannot silently disappear. User-visible account balance always marked **manually tracked, not bank-verified**.

**Cash-flow event postings (TWD):**
- Opening balance: one posting `+opening`; editing initial balance is an audited replacement of the opening transaction, not an independent update to an account balance field.
- Income: one posting `+amount` to receiving account; counts as cash income but not spending.
- Expense: one posting `-amount` from selected account; counts once as actual spending on `txn_date`.
- Transfer: two postings in one database transaction, `-amount` source and `+amount` destination, same currency; sum exactly zero, excluded from income and spending. Cash withdrawal Post → Cash is a transfer, **not** expense. Cash deposit Cash → CTBC likewise.
- Adjustment: signed single posting equal to `target_reconciled_balance - current_ledger_balance`; DB calculates this inside a lock, and stores reason/previous/new values in audit. Adjustment is neither income nor expense. Never silently overwrite balances.
- For MVP, account currencies are TWD; INR is a budgeting/display currency. Reject cross-currency account transfers rather than silently exchanging at an assumed rate.

**Mutations must be atomic, concurrency-safe and idempotent.** Use authenticated PostgreSQL RPC functions to create, revise, void and reconcile transactions. Do not permit arbitrary direct client INSERT/UPDATE/DELETE of postings/journal events. Functions validate `auth.uid()`, own every referenced account/category/transaction, verify expected revision, lock affected rows in stable order, and write journal events/postings/revisions in one DB transaction. `SECURITY DEFINER` functions, if used, must pin `search_path`, revoke PUBLIC/anon EXECUTE and explicitly check ownership; authenticated-only EXECUTE. No service-role key in browser code.

For an edit: lock original transaction; append reversing postings for currently active state, append replacement postings for changed state (or zero for allocation-only edit), record next revision and old/new snapshots, update the displayed transaction; then commit together. For a void: append reversing postings and mark `voided_at`, preserving history; no hard deletion. A repeated client request with the same `idempotency_key` returns the existing operation; a stale `expected_revision` fails without posting. The **active latest transaction** defines current cash-flow reports, not the historical correction postings. Changing an account/category/allocation must not create spending twice.

Actual expenses dated in the future should not be accepted as already-spent transactions in the MVP; future grocery allocation start dates are allowed. Allow legitimate backdated entries while recording an independent server timestamp.

## 5. Budget and grocery allocation contract

- `B` = the selected month's **resolved TWD budget**; `D` = actual calendar days (28/29/30/31; Gregorian leap year). Budget unconfigured or INR FX unset is shown as **not configured**, never zero/undefined silently.
- **Actual monthly expenditure** = sum of latest non-void expense transactions with `txn_date` inside month. All grocery purchases count in full ONCE on purchase date. `actual_budget_remaining = B - actual_monthly_expenditure` may be negative.
- **Allocated/consumed monthly cost** = sum of *derived daily expense allocations* whose allocation dates fall in the month (including prior-month purchases); it is a planning metric, not additional money leaving the bank. `allocated_budget_remaining = B - allocated_monthly_cost`, distinct from actual cash-flow remaining.
- **Single-date expenses** without grocery rules allocate their full latest amount to the transaction date. Expense with rules must satisfy `sum(item.amount_minor) = expense.amount_minor`. Items may have independent duration/start date/category. Rules change only through the same revision/audit transaction as their purchase.
- For every item amount `A` integer minor units, duration `N >= 1`: `q = floor(A/N)`, `r = A mod N`; for `i = 0..N-1`, allocation on `start_date + i calendar days` is `q + 1` if `i < r`, else `q`. Sum of all days is exactly `A`. Reject excessive duration and invalid dates; advancing a DATE must not depend on UTC local midnight/DST offsets. Do not create postings for allocation entries.
- Example: NT$300 paid Oct 30 with start Oct 30, duration 3 → Oct 30 NT$100, Oct 31 NT$100, Nov 1 NT$100. Bank -NT$300 once on Oct 30; October **actual cash-flow** -NT$300; October **allocated consumption** NT$200; November allocated consumption NT$100 with no new bank debit. NT$301/3 days => NT$100.34, NT$100.33, NT$100.33.
- `standard_daily_allowance = B / D` (rational until display rounding). `daily_allocated_cost(d)` includes grocery rules covering d and other expenses attributed to d. `standard_daily_remaining(d) = standard_daily_allowance - daily_allocated_cost(d)`. Mark day over/under target by sign.
- For a selected **current** month and today (Asia/Taipei), `remaining_days_inclusive = calendar dates from today through last day`. `uncommitted_budget = B - ALL daily allocations already recorded in that calendar month` (past, today and future grocery commitments); `dynamic_additional_daily_allowance = uncommitted_budget / remaining_days_inclusive`. This is an explicitly labeled safe target for *new discretionary spending* across remaining days; it is **not** the same as `standard_daily_remaining`, and must not deduct today's already allocated expense a second time. Display negative values as a deficit, not free money. For historical months, dynamic allowance is not applicable; for future months, use full number of days.
- Rates: manually enter `1 INR = N TWD`, store `numeric(20,8)` plus timestamp. For INR budget, convert once to TWD cents with a deterministic documented half-up rule and persist rate ID and converted snapshot on monthly budget. Changes to rate do not reprice historical budgets implicitly; revalue only with explicit consent. TWD accounts remain TWD; INR account equivalents are approximate and labeled **manual-rate estimate**. Never invent a live rate.

## 6. UX and contracts

`/finance`: compact title + "Manually tracked • last updated", total TWD available, three account cards (Post, CTBC, optional Cash), current-month budget cards with **Actual spent** vs **Allocated cost**, today **Standard target remaining** vs **Dynamic discretionary allowance**, primary Add Expense action, quick expense form, recent transactions, upcoming grocery commitments, category totals and cash-flow/consumption trend charts. Date/month picker, account history, transfer/adjustment forms, budget/rate/settings, export and empty/configuration states. On Android, responsive single-column cards and thumb-reachable CTA; no horizontal overflow; numeric keyboard; minimum usable touch targets; confirm edits/voids and show exact post-save balances. Minimize input friction with preselected date, last-used account (local preference only, not financial source of truth) and category.

Suggested TS interfaces (boundaries; freeze in Phase 2 prior to implementation):
```ts
type Currency = 'TWD' | 'INR';
type MoneyMinor = string; // decimal integer serialized safely from PostgreSQL
type TxKind = 'opening'|'income'|'expense'|'transfer'|'adjustment';
type AccountBalance = { accountId:string; currency:'TWD'; balanceMinor:MoneyMinor };
type BudgetMonth = { monthStart:string; currency:Currency; budgetMinor:MoneyMinor; resolvedTwdMinor:MoneyMinor; fxRateId?:string|null };
type GroceryRule = { itemName?:string; categoryId?:string|null; amountMinor:MoneyMinor; startDate:string; durationDays:number };
type MutationCommand = { idempotencyKey:string; expectedRevision?:number; transactionId?:string; kind:TxKind; amountMinor:MoneyMinor; txnDate:string; sourceAccountId?:string; destinationAccountId?:string; categoryId?:string; merchant?:string; note?:string; allocations?:GroceryRule[] };
type DailyAllocation = { date:string; amountMinor:MoneyMinor; sourceTransactionId:string; categoryId?:string|null };
```

Source-of-truth data access contracts:
- `lib/finance/types.ts` type interfaces/validation;
- `lib/finance/money.ts` parse/format integer amounts, FX decimal conversion and rounding;
- `lib/finance/allocations.ts` pure deterministic allocation;
- `lib/finance/budget.ts` pure calendar-day and daily/monthly metrics;
- `lib/finance/repository.ts` authenticated Supabase reads and calls to mutation RPCs; client never directly edits ledger tables;
- `components/finance/*` presentation only, without duplicated accounting math;
- `app/finance/page.tsx` composition and loading/errors;
- `app/api/finance/export/route.ts` (later phase) authenticated, owner-scoped export of JSON/CSV with escaped spreadsheet-injection cells.

## 7. Security, data durability, risks

1. **Real DB mismatch:** 007 migration documents historical discrepancy between repo and deployed Supabase; Phase 2 must run *read-only* introspection and compare migration state, policies, triggers, constraints and buckets before additive changes. Never assume 008 is applied live.
2. **Risk of double counting:** ledger journal is authoritative for balances; latest transaction state authoritative for monthly actual cash-flow; derived daily schedule authoritative only for consumption. Never combine those totals as "spending".
3. **Unauthorized updates/forged account IDs:** owner RLS and composite FKs everywhere; authenticated RPC with explicit ownership checks, narrow grants, no browser service-role key.
4. **Concurrent double-submit/edit races:** idempotency UUID, unique constraint, expected revision, locked atomic mutations; test parallel create/edit/void and network retries.
5. **Floating-point / FX drift:** integer money, decimal manual-rate snapshots, fixed rounding and explicit currency labels; never `number` arithmetic on balances.
6. **Historical rewrite:** append-only audit/journal and reversible changes; soft-void. Reallocation only changes planning projections, not bank postings.
7. **Misleading "available balance":** stamp as manual estimate, allow reconciliation with reason and warning about unentered transactions; an account's balance is not bank-verified.
8. **Persistence and privacy:** Supabase database is source of truth (not localStorage); authenticated owner-only reads/writes; avoid secrets and real bank account numbers. Provide authenticated JSON + CSV export, import strategy/backup review, and restore testing before production.
9. **Mobile and regression:** audit Samsung/Android browser after implementation; page must not break LearningShell, Job Preparation, Inbox, roadmap, theme, or global nav; empty and offline/error states must not falsely claim save.
10. **Operational verification:** check Vercel → GitHub link, env variables, Supabase auth redirects, installed schema and true backup posture before touching live records. Source review does not prove service state.

## 8. Ten-phase execution plan and gates

1. **Phase 1 (this file):** real source audit, architecture and written invariant/contract. No migrations, finance route or deployment.
2. **Phase 2 — schema/security foundation:** read-only live schema drift check; finalize TS interfaces + SQL diagram; add additive `009_finance.sql` and safe RLS/composite FKs/RPC drafts; run migration on isolated test DB only; validate RLS hostile-user tests; no production deployment yet.
3. **Phase 3 — ledger and accounts:** create/edit openings, income, adjustments, account history and account balance reads; idempotent atomic RPCs and test reversal flows.
4. **Phase 4 — expenses/categories/transfers:** CRUD via revisions and voids, cash withdrawal/deposit as transfers, category default/custom, search and account filters.
5. **Phase 5 — monthly budget and manual FX:** month-specific budgets, TWD/INR snapshot conversion, leap-day handling and accurate actual cash-flow totals.
6. **Phase 6 — grocery allocation engine:** date-spanning purchase rules, edit/void reallocation, per-item different durations and category classification, cross-month exact sums.
7. **Phase 7 — finance dashboard and Android UX:** `/finance`, sidebar + drawer + palette, quick capture, budget contrast, account cards, mobile accessibility.
8. **Phase 8 — analytics and reconciliation:** category spending, daily/month trends, allocated-vs-actual contrast, future commitments, reconciliations and warnings.
9. **Phase 9 — export, reliability, security QA:** owner-safe exports/backups and restore drill, adversarial RLS tests, concurrency retries, unit/property/E2E + regression suite; fix defects.
10. **Phase 10 — staged release and production sign-off:** apply reviewed additive migration through authorized release process, Vercel preview → production, Samsung browser UAT, confirm existing ManuOS intact and track first real entries.

Each phase: read THIS contract and current repository first; make minimal changes; use main branch up to date; report changed paths and commands/tests actually run; pass acceptance gates before next phase; never overwrite existing user data. Finance feature is **not live** merely because architecture docs exist.

**Immediate Phase 2 gate:** confirm current deployed Vercel project uses this GitHub repo/branch, snapshot live Supabase read-only schema & policies, verify migrations 001–008 against real DB, then write isolated test DB migration/RLS tests without running DDL in production.
