# ManuOS Finance Phase 9 — Reliability, Security, UI and Data Ownership Audit

Date: 2026-10-30. Branch: `feature/finance-phase-9-reliability`, based on `feature/finance-phase-8-analytics` at `3729c4af`.

**Release state: DEVELOPMENT ONLY, NOT READY FOR PRODUCTION.** No production migration, merge, real user transaction or Vercel deployment was performed.

## Audit scope and findings (actual repository)

Inspected `app/finance/page.tsx`, Finance components and repository, database migrations 009–017, Phase 8 documentation and automated workflows. Source-of-truth is the authenticated owner-scoped PostgreSQL ledger, not browser storage or bank API. TWD minor units are exact integers; INR budgets use a frozen user-entered exchange-rate snapshot. The 3 accounts use additive signed postings. Existing protected revisions, write idempotency, account reconciliation audit, budget, grocery allocations, calendar and analytics were preserved.

| Severity | Actual finding | Repair / disposition |
| --- | --- | --- |
| **P1 — Loss of backup completeness** | Previous `financeExportSnapshot()` used unbounded client `.select('*')` calls subject to Supabase default row limits; omitted ledger events, postings, audit, planned entries, plan operation keys and preferences. | Replaced with one consistent MVCC `finance_full_backup()` owner-authenticated JSON snapshot (migration 018), plus required-array, owner/reference, exact allocation and count validation. Hard fails when too large; never saves a partial backup labeled complete. Stress test exceeds 1,000 records. |
| **P1 — Reconciliation / backdating** | Old guard prevented editing transactions predating an account reconciliation but did not reject **new** backdated transactions entered after reconciliation. | Added owner-aware `finance_guard_backdated_reconciliation` before insert/update. A transaction cannot silently change the historical records on/before a reconciled statement date. The existing non-destructive audited correction/void design is retained. |
| **P1 — Uncertain expense re-submit after browser refresh** | Expense/income form idempotency UUID was held only in a ref, lost on reload. | Added `pending-intent.ts` to keep only a SHA256 fingerprint and operation UUID in sessionStorage until **confirmed** server success. Same form and session reuse the same operation UUID. Database still enforces unique operation keys and revision checks. Storage failures do not masquerade as a failed payment. |
| **P1 — Missing full export and integrity diagnostics** | Users had no complete portable downloadable Finance record or cross-ledger diagnostic. | Added verified private CSV and JSON backup UI; `finance_integrity_report()` compares active transaction effects to all owner postings and allocation rules, includes orphan and duplicate counts, performs **no writes**. |
| **P1 — Spreadsheet injection** | Free-text values including merchants or notes can contain formula-like characters. | CSV quotes all fields and neutralizes formula prefixes at cell start **and after embedded newlines**. Export includes voided adjustments, income and transfers with clear type and status. |
| **P2 — Excessive requests** | Every Finance workspace fetched database data on initial page load, including 12-month analytics, calendar and full accounts. | `FinanceModule` lazily mounts only the selected section. Overview defaults to Accounts plus a short budget/today/recent-expenses snapshot. Mobile navigation is a compact responsive 3-column grid; desktop uses flex wrap. |
| **P2 — Dense home screen** | Users had to scroll through five heavy workspaces and could not see today's paid vs attributed grocery values near account balances. | New `FinanceOverviewSnapshot`: recorded monthly spending, budget remaining, today attributed consumption, allowance left, grocery committed today, actual paid today, 5 most recent expenses. All from existing owner-authorized readers. |
| **P2 — Export data privacy** | Need to protect user backups and no third-party sharing. | Explicit JSON export confirmation, local browser download; no third-party analytics/AI service. SHA-256 provides an **accidental corruption checksum, not a digital signature**. |
| **P1 risk deliberately NOT released** | Full automatic restore into a populated immutable/revisioned ledger cannot be made safe by blind JSON writes. | No unsafe importer. Owner-held backup is suitable for **administrator-assisted isolated restore**, with referential and reconciliation verification; implement rehearsed transactional restore and user acceptance in a separately authorized future milestone. |

## Changes in Phase 9

- `supabase/migrations/018_finance_export_integrity.sql`: read-only owner-scoped `finance_full_backup()` and `finance_integrity_report()`, reconciliation checkpoint trigger. Does not change historical rows or balances on migration.
- `lib/finance/backup.ts`: all collection and relationship checks, amount validation, CSV spreadsheet-injection prevention including multiline cells, SHA256 portable archive.
- `lib/finance/pending-intent.ts`: digest-only sessionStorage retry idempotency for expense/income saves. Never stores free-text transaction details, account numbers or money amounts.
- `lib/finance/repository.ts`: fixes old truncation-prone export and provides authenticated diagnostics.
- `components/finance/finance-data-ownership.tsx`: secure export, integrity/health panel, restoration limitations.
- `components/finance/finance-module.tsx`: lazy mobile-first Finance section navigation; preserves existing quick-expense/transaction-edit event workflow.
- `components/finance/overview-snapshot.tsx`: recent purchases, daily and monthly spending context.
- `components/finance/transactions-workspace.tsx`: stable idempotent retries after reload, careful confirmed-only success and storage failure handling.
- `app/finance/page.tsx`: integrates native shell, no new standalone finance app.
- `tests/finance-phase9-postgres.sql`, `tests/finance-backup-phase9.spec.ts`, `.github/workflows/finance-phase9-validation.yml`: isolated integration and browser/unit/viewport testing.

## Accounting and user-visible number definitions

1. **Tracked money available**: net signed postings for Post Bank + CTBC + Cash. Not bank-verified. Income adds money, ordinary expense removes it, and CTBC-to-Cash transfer only moves it; no second expense.
2. **Actual monthly spending**: saved posted, non-voided expenses on original purchase dates. Transfers, opening balances and reconciliations are excluded; refunds are separate income under the existing policy.
3. **Budget remaining**: saved monthly budget converted at historical manual FX snapshot minus posted expenses. This is not cash or realized savings. A budget edit changes targets, not ledger balances.
4. **Standard daily allowance**: month budget divided into deterministic exact-cent daily values, matching the full monthly budget. Today's remainder can be negative.
5. **Attributed daily consumption**: ordinary expenses on payment date plus saved allocations for purchased grocery days. Never an additional bank payment; cross-month and overlapping allocations remain supported.
6. **Dynamic remaining-days allowance**: Phase 5 actual remaining monthly budget / remaining days including today; not equal to standard daily allowance, today's remainder, or tracked bank balance.

## Backup file contents and privacy

JSON includes all **11 owned finance collections** plus owner preferences, schema version, owner ID and export time: bank/cash accounts, categories, manual exchange-rate history, budgets, all original transactions (including opening, transfer, reconciliations, edits and void statuses), item allocations, ledger events, account postings, audit events, planned entries and plan operations. UUIDs, revision numbers, links and dates are preserved. Monetary columns are serialized as decimal-text strings where required for exactness. No auth sessions, tokens or bank credentials are included.

A browser ZIP/encrypted automated backup is **not** provided. The user must download and store the JSON securely. A backup is rejected if data or ledger checks disagree with the independent integrity report, or if it's too large for the safe browser limit. Automatic restore is **not** offered.

### Future restore rehearsal (do not attempt in production)

1. Preserve original JSON file unchanged and verify SHA-256 of `JSON.stringify({format:'manuos-finance-portable-archive',version:1,counts,backup})` against the recorded digest. SHA-256 detects accidental changes but is not proof of trusted origin.
2. Validate owner IDs, all 11 arrays, amount strings, UUID link references, allocation sums, frozen FX snapshots, and ledger event/posting consistency.
3. Create a separate **isolated** Supabase/Postgres database with an explicit restored auth identity mapping and reviewed migrations 009–018. Never import directly into a populated owner's production database.
4. Build and rehearse a **single transactional** restore with referential integrity, unique idempotency keys, event ordering and revision compatibility; reject any duplicate or failed dependency and ROLLBACK entirely.
5. Recalculate all account balances from postings, compare to recorded source reports, test finances with the restored owner, then obtain explicit user and administrator approval for any future live recovery plan.
6. Do not import an archive that fails integrity or that could double-debit previously saved payments.

## Test coverage and limits

The Phase 9 CI suite runs: Finance ESLint, TypeScript, Next production build, Playwright desktop and mobile finance/unit tests, 320/360/390/430 CSS pixel unconfigured navigation smoke, isolated PostgreSQL 16 migrations **009–018** and all previous financial regression SQL. Phase 9 SQL runs the NT$6,500 → NT$6,100 → NT$12,100 opening/payment/transfer/income scenario, cross-month NT$450/3 grocery attribution, frozen INR budget edits, owner backup, reconciliation backdating and isolation. The 1,100-row synthetic category test detects backup truncation. JS tests cover JSON relationships and size, SQL precision, CSV spreadsheet injection, SHA256 output and owner report count checks.

**Do not mark the following unrun scenarios as passed:**
- Authenticated live browser UI with real Supabase, Samsung Android or tablet screenshots; production/multi-device refresh, sign-out/sign-in persistence, slow/offline network and two-tab concurrency UI.
- Full restore/import transactional integration and disaster-recovery rehearsal.
- External penetration test, accessibility screen-reader walkthrough, full dependency advisory audit and real device 320–430 layout screenshots. Responsive unconfigured smoke is not the same as authenticated screen visual verification.
- Actual Supabase staging data persistence (CI only uses disposable PostgreSQL) or production backup verification.

## Phase 10 — explicit deployment prerequisites (no authorization yet)

1. Independent review and approve the chained Phase 1–9 draft PRs in dependency order. Confirm no drift versus live `main`; main still predates Finance migrations and should not be assumed to contain the feature.
2. Inspect existing live migrations 001–008 and staging schema; apply additive 009–018 sequentially in **staging** and verify every RPC, RLS and budget/FX/view compatibility, with owner-isolation tests.
3. Take and verify existing production backups (including the rest of ManuOS) and rehearse a point-in-time recovery in isolation. Do not run any migration without a rollback / recovery procedure.
4. Conduct two real signed-in staging user tests (and at least two browsers/tabs): initialize accounts, transfer, edit and void, grocery cross-month, INR budget update, all calendar/analytics totals, duplicate Save, offline/uncertain timeout, sign-out/in and cross-owner denial. Check no genuine production financial data is exposed.
5. Test smartphone widths 320,360,390,430, tablet, desktop and actual Android with screenshots and keyboard focus/Save reachability, reduced motion, screen reader, contrast, chart text equivalents, mobile navigation and all seven workspaces. Fix discovered issues before release.
6. Confirm SQL `finance_full_backup()` contents and local file downloading on staging, verify large backup + SHA256, CSV formula safety, no unauthorized export and no session token leaks. Keep a separately tested recovery path.
7. Run all CI checks on proposed release SHA, review dependency advisories, secret scanning, repository-wide lint failures, operations alerting, actual Vercel environment separation and Supabase read/write grants.
8. User explicitly authorizes production deployment/migrations. Only then promote and perform post-deploy bank/account/migration smoke and user acceptance, without creating fictitious or real unwanted payments.

**Verdict:** Development changes are implemented and isolated automated tests are available; **NOT production ready** until staging authenticated mobile and reliability gates have been passed. No P0/P1 defect may be treated as resolved solely from local model reasoning or CI on an unconfigured browser.
