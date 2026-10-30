# ManuOS Finance — Phase 3: Accounts and Balance Management

**Date:** 2026-10-30
**Branch:** \`feature/finance-phase-3-accounts\`
**Draft PR:** https://github.com/manideepreddyyanala4-svg/MANU-LEARNING_OS/pull/3
**Base:** \`feature/finance-phase-2-foundation\` (the Phase 2 foundation remains under separate review).
**Status:** Committed and isolated-CI-tested code only. NO production Supabase migration or release.

## Implementation

Reused the audited existing Next.js 16 App Router / TypeScript / Supabase Auth / RLS / Supabase PostgreSQL / \`components/shell.tsx\` / \`components/ui.tsx\` architecture.

Added \`/finance\` as a native ManuOS route. \`components/shell.tsx\` navigation item appears in desktop sidebar, mobile drawer, command palette and desktop breadcrumb via the existing shared nav array.

The accounts workspace shows server-calculated active TWD total (not bank-verified), distinct account cards for Post Bank, CTBC and Cash Wallet, last recorded activity and two recent transactions per account, first-time opening setup with blank-vs-explicit-zero distinction, account detail and authoritative ledger balance-check, transfer UI, reconciliation UI, historical opening edit UI, account rename/archive/reactivate controls and paginated account history with audited adjustment reversal. Balance-changing forms require a second review-and-confirm click. All forms use authenticated Supabase RPCs; the UI never directly writes a financial table or stores financial records in localStorage.

Business rules:
- \`finance_bootstrap\` from Phase 2 creates three account *definitions* idempotently with **no fabricated opening amounts**.
- Phase 3 \`finance_initialize_openings(jsonb)\` saves one or more real observed openings atomically; includes per-entry UUID keys for retry safety and rejects conflicting replay payloads. An opening record may be zero but is never silently inferred from an empty input.
- Correcting a mistaken opening invokes the existing revisioned \`finance_put_transaction\` with \`expectedRevision\`; it is NOT a reconciliation.
- Reconciliation invokes Phase 2 \`finance_reconcile_account\`: calculates signed target-minus-current under an owner lock and records an adjustment without modifying prior expenses.
- Transfers invoke Phase 2 \`finance_put_transaction\` with kind=\`transfer\`: two account postings in one atomic DB transaction, no cash-flow income or expense. All accounts are TWD in the MVP; no mixed-currency account sums or transfers.
- The new overview is a security-invoker PostgreSQL view (\`finance_account_overview\`) aggregating **latest active** opening/income/expense/transfer/adjustment transactions. The existing \`finance_account_balances\` view is the authoritative sum of ledger postings. The UI blocks writes if aggregates disagree.
- Each account history is queried from the owner-protected view with server-side pagination. Reversing an adjustment uses a soft void, preserving the audit trail. No expense-entry/income-entry form or grocery input is introduced (Phase 4+).
- On real-device re-entry/refresh, data is re-fetched from Supabase. If the database migration is absent, the page fails closed, showing a configuration error instead of fabricated balances.
- All account figures are labeled **manually tracked**, never presented as bank-synced.

## Changed files (relative to Phase 2)

- \`app/finance/page.tsx\` — new native route, page metadata and shared Page layout.
- \`components/shell.tsx\` — added Finance to existing shared nav arrays.
- \`components/finance/accounts-workspace.tsx\` — account cards, totals, details, source-of-truth refresh, history and adjusted transaction reversals.
- \`components/finance/account-forms.tsx\` — observed-opening form and confirmed transfer, reconcile, opening edit and account management forms.
- \`lib/finance/account-summary.ts\` — pure TWD sum/aggregation consistency and account event effect.
- \`lib/finance/dates.ts\` — explicit Asia/Taipei dates and timestamps.
- \`lib/finance/repository.ts\` — owner-scoped overview and account-history queries, atomic opening setup RPC facade, timestamps.
- \`lib/finance/types.ts\` — account summary, paginated history and opening command types.
- \`supabase/migrations/012_finance_account_overview.sql\` — safe read-only SQL view + authenticated atomic opening initialization RPC.
- \`tests/finance-accounts.spec.ts\` — account arithmetic, reversal and timezone tests.
- \`tests/finance-page.spec.ts\` — unconfigured route and desktop/mobile shell fallback tests.
- \`tests/finance-phase3-postgres.sql\` — database behavior tests for the exact user examples, reconciliation, reversal, zero opening and user isolation.
- \`.github/workflows/finance-phase3-validation.yml\` — isolated SQL + app tests (push and draft PR).

## Verified checks / exact test scope

GitHub Actions **Finance Phase 3 (isolated validation)** is configured for this branch/PR, using \`node 24\`, pinned pnpm and disposable PostgreSQL 16. The latest known green run before final documentation revisions was run \`41022334921\`: targeted Finance eslint, \`pnpm typecheck\`, \`pnpm build\`, Playwright tests (34 passed across desktop/mobile configurations), 009–012 SQL migrations executed against disposable PostgreSQL, Phase 2 financial invariant assertions and the new Phase 3 assertions passed. Repository-wide lint reports four **pre-existing, unrelated** failures in roadmap/ASE components; it remains informational and was not silenced. Re-run CI after later commits and verify status before any merge.

**Not tested / not claimed:** Live Supabase migration state, access to user's real accounts, cross-device persistence with a real authenticated browser, user-facing Android physical-device screenshots, production Vercel deployment and actual bank balances. The React fallback with no Supabase credentials is tested, but not a full logged-in interactive UI test. A disposable Supabase staging owner-session E2E test is still required.

## Exact acceptance scenario (tested in disposable PostgreSQL)

Start with Post 3000, CTBC 3000, cash 500 = total 6500 TWD. Transfer 500 CTBC → Post = Post 3500, CTBC 2500, total 6500. Transfer 200 Post → Cash = Post 3300, cash 700, total 6500. Reconcile Post to 3250 = -50 adjustment, total 6450. Reverse adjustment returns Post to 3300. Edit original opening and verify ledger and breakdown agree. Explicit zero opening persists. Repeated opening batch is idempotent. Unauthorized user cannot view other account details or write an opening for them.

## Release blocker / next phase

1. Keep draft PR #3 and Phase 2 draft PR #1 unmerged; no migration applied in production.
2. Follow the existing \`supabase/finance_read_only_preflight.sql\` against real Supabase in a **read-only** session; verify existing live migration state 001–008 and any extra live changes.
3. In disposable **Supabase staging**, safely apply 009, 010, 011, **012 in order**; validate auth.uid(), role grants, composite ownership constraints, security-invoker view, replay of RPC operations, multiple devices/session reload and actual UI transfer/reconciliation.
4. Verify automated CI, backup/restore, security and manual Android 390px view, then seek separate explicit approval for any production migration or merge.
5. Phase 4 will implement expense entry, income capture, payment-account selection and historical transaction editing against the same ledger. Do **not** reimplement the accounting system.

**Reminder:** On current production ManuOS (main), Finance may not exist yet. This phase adds code to a review branch, not a production site.
