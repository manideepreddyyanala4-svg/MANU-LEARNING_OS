# ManuOS Finance — Phase 2 implementation and release gates

**Branch:** \`feature/finance-phase-2-foundation\` (draft PR #1). **Date:** 2026-10-30.
**Never merge or execute these migrations on live Supabase until preflight and isolated tests pass.**
See \`docs/finance/PHASE_1_ARCHITECTURE.md\` for the full accounting contract.

## Verified repository and integration

ManuOS uses Next.js App Router, TypeScript ES2017 with ESNext libraries, Supabase Auth/PostgreSQL, \`lib/supabase.ts\` browser client, \`lib/supabase-server.ts\`, \`proxy.ts\`, pnpm, Playwright and Vercel. The new finance code reuses \`lib/learning.ts\`'s \`requireClient()\` and existing auth; no new framework, external banking API, independent app, service-role access in browser, finance pages or navigation changes. No finance data is stored as a localStorage source of truth.

## Files added

- \`supabase/migrations/009_finance_schema.sql\`: ten finance tables, owner-only RLS, composite owner FKs, read-safe views with integer minor units serialized as text.
- \`supabase/migrations/010_finance_ledger_rpcs.sql\`: idempotent per-owner bootstrap, atomic transaction revisions and signed posting reversals, safe voids, reconciliation with reason.
- \`supabase/migrations/011_finance_metadata_rpcs.sql\`: create/update account, create/update/archive category, user preferences, immutable manual INR→TWD rates, independently editable monthly budgets, monthly actual/allocated summaries.
- \`lib/finance/types.ts\`: stable domain and RPC input shape.
- \`lib/finance/money.ts\`: exact decimal parsing, integer cent/paise arithmetic and half-up rate conversion.
- \`lib/finance/allocations.ts\`: pure day-by-day multi-item grocery allocation, spillover across calendar months.
- \`lib/finance/budget.ts\`: leap-year day counts, exact rational standard allowance, commitment-aware dynamic allowance.
- \`lib/finance/repository.ts\`: authenticated typed read methods and RPC-only mutation facade.
- \`tests/finance-math.spec.ts\`: unit tests for money, exchange rates, leap dates, allocations and budget.
- \`tests/finance-db.spec.ts\`: optional integration test gated with **MANU_FINANCE_ISOLATED_DB=1** and disposable Supabase project.
- \`tests/finance-postgres-fixture.sql\` and \`tests/finance-postgres-assertions.sql\`: separate PostgreSQL test schema and invariant assertions.
- \`.github/workflows/finance-phase2-validation.yml\`: branch/PR-only CI; pnpm lint, typecheck, build, finance math tests, PostgreSQL 16 isolated schema/RLS checks.
- \`supabase/finance_read_only_preflight.sql\`: nonmutating live schema audit script.

## Model and transaction invariants

All ledger account currencies are **TWD** in the MVP. Budget display/planning may be TWD or INR. Money is stored as integer 0.01 units: \`30000\` = NT$300; manually entered rates are \`numeric(20,8)\`. Browser reads expose numeric money as decimal strings, never unsafe JSON floating-point. The code deliberately uses \`BigInt(...)\` rather than \`1n\` literals because the existing project TypeScript target is ES2017.

Only the latest non-void transaction contributes to **actual monthly spending**, not the sum of all journal entries. Bank/account balances use the sum of **signed append-only postings**. Expense allocated consumption is computed from the current active grocery rules and/or transaction date, and never creates further postings. Month-crossing purchases count fully on the actual payment month while their planned consumption spreads across the intended days. Multi-item allocations must sum to the real expense total.

Opening balance is represented by a single non-voidable \`opening\` transaction per account. It can be edited through an audited revision. Reconciliation calculates \`target - sum(postings)\` while holding a per-owner lock; zero-delta reconciliation is an explicit no-op error. Money may be negative from legitimate overdrafts; no arbitrary insufficient-funds block. Transfers move exact TWD cents in a single SQL operation. Cross-currency account transfers are **not** supported in the TWD-only MVP; to add accounts in multiple currencies later, extend the transaction/postings schema to store individually valued debit/credit legs and an explicit rate snapshot rather than summing different currencies.

Per-user \`finance_preferences\` row is locked for all finance mutations, serializing concurrent edits, transfers, archive checks and reconciliation. Each financial operation has an immutable unique \`operation_key\`; the same key is safe to retry. Revisions use \`expected_revision\`. Edits append compensating postings, not duplicated charges. Void retains financial history and reversing postings. No browser/anon direct INSERT/UPDATE/DELETE to finance tables; authenticated RPC functions validate user and all referenced IDs. \`SECURITY DEFINER\` functions have a pinned empty \`search_path\` and narrow EXECUTE grants.

## Integration / test commands

With project dependencies installed:

\`\`\`bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm exec playwright test tests/finance-math.spec.ts --project=desktop-chromium
\`\`\`

With disposable PostgreSQL 16 and explicit fake Supabase auth fixture (NEVER run this fixture on the real database):

\`\`\`bash
psql -v ON_ERROR_STOP=1 -f tests/finance-postgres-fixture.sql
psql -v ON_ERROR_STOP=1 -f supabase/migrations/009_finance_schema.sql
psql -v ON_ERROR_STOP=1 -f supabase/migrations/010_finance_ledger_rpcs.sql
psql -v ON_ERROR_STOP=1 -f supabase/migrations/011_finance_metadata_rpcs.sql
psql -v ON_ERROR_STOP=1 -f tests/finance-postgres-assertions.sql
\`\`\`

The separate Supabase integration suite requires explicitly supplied disposable owner credentials and both \`MANU_FINANCE_TEST_READY=1\` and \`MANU_FINANCE_ISOLATED_DB=1\`. It is not meant for Vercel production or real bank data.

### Live/staging gates before applying migration 009

1. Confirm in Vercel that production is connected to this repository **and** confirm the specific production branch.
2. Execute \`supabase/finance_read_only_preflight.sql\` read-only on real Supabase, compare migration 001–008 state with repository and record the outputs. Historical migration 007 already describes prior schema drift; do not assume tables exist because migrations are checked in.
3. Back up the existing database and verify restore before any schema operations.
4. Apply migrations 009–011 in order to an isolated Supabase staging project, not production. Verify Supabase-specific grants, RLS, auth, RPC and multi-user denial; use a disposable test user.
5. Run code CI, isolated Postgres and staging integration tests including concurrency, retries, editing payment account, voids, manual FX, and cross-month consumption. Check no unrelated ManuOS route regresses.
6. Obtain explicit approval before any production migration or merge. No finance UI is built in Phase 2.

## Phase 3 handoff

Build the account-management UX only after the schema is tested and available in an authorized environment. Add \`/finance\` once the selected phase calls for it; the primary design/route wiring belongs to Phase 7 unless an earlier minimal account screen is deliberately scoped. Phase 3 focuses on initializing Post/CTBC/Cash, entering/editing opening balances with dates, listing *manually tracked* calculated balances and showing account history; the UI calls \`lib/finance/repository.ts\`, not raw INSERTs. Use fresh UUIDs for new operations, reuse keys on retries, pass \`expectedRevision\` on edits, preserve saved grocery rules unless explicitly modified, and keep primary account currency TWD. Never represent balances as live bank values.

## Remaining risks

Actual live schema, environment variables, Vercel production-branch mapping, production backup/restore, and Supabase staging validation are not accessible through the GitHub code connector alone. Merely committing CI config or test source does not prove those tests have passed; review the GitHub Actions run and do not claim success without results. Vercel may automatically generate preview checks on new Git branches/PRs. No production deploy has been initiated by these scripts.
