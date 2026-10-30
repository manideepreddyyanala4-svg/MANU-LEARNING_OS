# Finance Phase 9 — security, recovery and reliability audit

**Status:** Development-only draft. Migrate and release only after Phase 10 preflight.  
**Source:** `feature/finance-phase-9-audit`, based on `feature/finance-phase-8-analytics`.  
**Production changes:** None; no live Supabase migration or Vercel deployment.

## Audit scope and evidence

Inspected the actual Phase 8 tree and Finance files: architecture docs, migrations 009–017, wallet/account opening RPCs, transaction and signed-posting RPCs, RLS/select-only views, scheduled entries, item-level allocation RPCs, monthly budgeting, daily calendar, analytics and all existing finance component/workspace code. Validation runs on a disposable PostgreSQL 16 database with owner impersonation and headless Chromium desktop/mobile. The public production website is **not** the code being tested here.

| Severity | Finding | Phase 9 resolution | Remaining limitation |
|---|---|---|---|
| P0 | Transaction idempotency key could be reused with different amount/account and return prior transaction ID as if the new request had saved | Add `request_fingerprint` on immutable events and compare every RPC argument under serialized owner lock, rejecting mismatches; update old tests to require *identical* requests | Legacy event keys predating migration have no fingerprint and fail closed on replay |
| P0 | Reconciliation key could be retried with changed target or account and return an unrelated pre-existing reconciliation | Check original audited target, account, date, reason and original transaction on replay | User must refresh authoritative balances after an uncertain result |
| P1 | New expense could be backdated into a period preceding a manually checked balance | Reject new income/expense/transfer with date **earlier than** most recent relevant reconciliation date | Same-day sequence cannot be fully ordered using the existing date-only reconciliation semantics; document for Phase 10 |
| P1 | Old `financeExportSnapshot` silently omitted plans, audit trail, ledger postings and could be truncated by PostgREST defaults | Replace with an owner-only database RPC that locks the owner's finance preference row and gathers 12 finance tables in a consistent snapshot | 16 MB guard prevents silent truncation; very large ledgers require a controlled admin export |
| P1 | No secure transaction CSV or independent backup | Implement authenticated inclusive-date CSV and full, versioned JSON with IDs, history, original entry states as exact JSON strings, count and ledger validation, SHA-256 integrity digest | Automated restore is **not enabled** because safely restoring append-only journal history requires an independently reviewed migration procedure |
| P1 | Manual amounts could lose precision if serialized as JS floats during export | Serialize budget, transaction, rate, allocation and posting amounts as strings; export event/audit before/after JSON as exact strings | No live bank verification is implied |
| P2 | Finance month controls overflowed at 320 CSS px | Responsive month picker grid, narrow button padding and 320–1280 px browser overflow regression | Actual Samsung Android hardware visual/keyboard test not performed |
| P2 | Analytics dropdown options disappeared while requesting new filtered data | Preserve account/category/merchant metadata separately from current filtered results | Analytics still makes several RPC calls per refresh; optimize if live latency warrants |
| P2 | Finance navigation omitted an Overview anchor and independent export workspace | Responsive Overview / Accounts / Transactions / Budget / Calendar / Analytics / Export navigation, reuse existing sections | No additional routing abstraction or duplicate pages |

The existing account manager prevents archiving a nonzero-balance account. Earlier signed posting edits and void reversals remain append-only. Future scheduled expenses remain separate from actual posted payments. INR budgets retain their frozen manually supplied FX rate; account balances and expenses are TWD.

## Financial semantics rechecked

- **Account balance:** sum of signed immutable postings; opening + income + incoming transfers - expenses - outgoing transfers + signed reconciliations. A transaction edit emits reversal of prior state and application of new state. Voids reverse only once. Transfers net to zero across accounts.
- **Grocery purchase:** bank debit occurs **once**, at purchase time. Allocation is read-only consumption metadata. For 400.00 TWD over three days the allocation is 133.34 + 133.33 + 133.33 = 400.00. Crossing into November changes planning attribution, not another bank debit.
- **Budgets:** monthly INR or TWD budget is independent of account cash and historical expenses. Editing it changes allowance projections, not ledger postings. No budget remaining is described as cash or confirmed savings.
- **Analytics:** active paid expenses only; excluded transfers, openings, adjustments, voids, and unpaid plans; gross refunds are separate income. Category/account/merchant totals reconcile with filtered expense records.
- **Reconciliation:** a signed adjustment records a checked current balance; no historical entry is overwritten. Historical dates and same-day sequencing need care. After recording a new forgotten payment, check the real account and reconcile again when necessary.

## Export formats

**CSV:** `finance_export_transaction_rows(p_from,p_to)`, inclusive optional date filter, up to 25,000 rows per request; if more, errors visibly instead of silently truncating. Includes ID, date/time, kind, exact decimal TWD amount, account IDs and names, category, merchant, description, status and revision. Values from user text are quoted, escaped and prefixed for spreadsheet formula protection. Downloaded client-side as UTF-8 BOM CSV.

**JSON backup:** `finance_export_backup()`, owner-authenticated via `auth.uid()`, security-definer with fixed search path and owner predicate in **every** table selection. Includes `preferences`, `accounts`, `categories`, `fxRates`, `monthlyBudgets`, `transactions`, `allocations`, `ledgerEvents`, `postings`, `auditEvents`, `plannedEntries`, `planOperations`. Preserves primary/foreign keys, record counts, audit and reconciliation histories. Big money fields and JSON event states are exported without JS floating-point conversions. Client independently checks owner ID, counts, account posting algebra, orphan references and item-level allocation totals before generating a JSON file wrapped in a SHA-256 content digest. **The SHA-256 digest detects inadvertent corruption, not malicious re-signing; it is not an authenticity signature.**

The authenticated user's browser alone initiates downloads. No bank login, statement credential, service key, cloud backup provider, advertising feed or AI request is used. A downloaded backup is extremely sensitive and should be stored encrypted; it is not automatically saved to an external service. An incognito session or a browser file download prompt may affect where it is saved.

### Recovery procedure — no in-app restore in Phase 9

1. Keep at least two private copies of the JSON backup; verify that its wrapper hash matches the serialized payload; check `format`, version, owner, 12 tables, record counts, saved timestamps and signed account balances.
2. Recreate a **separate staging** database from a verified database-level backup with the same migration schema. Do **not** import raw JSON directly into the live append-only ledger through untrusted client code.
3. Have an authorized operator write and independently review a **transactional**, owner-scoped restore script using the saved IDs and foreign key order. Verify every journal event, posting, void, allocation, budget, audit and plan record before commit. Never overwrite another owner's records or merge duplicate operation keys.
4. Run `tests/finance-phase9-integrity-diagnostics.sql` and full user-isolation tests on staging. Compare post-restore account balances, totals, dates and record counts with the exported snapshot.
5. Obtain explicit user approval for any live recovery. Keep the original database backup and test rollback first. There is no supported self-service import button.

## Tests and security boundaries

- Existing Finance Playwright tests plus new `tests/finance-phase9-export.spec.ts`: CSV formula injection, exact BigInt decimal values, owner mismatch, broken references, ledger sums, allocation sums, SHA-256 browser capability, live-rendered unconfigured-page and 320/360/390/430/768/1280 viewport overflow checks.
- PostgreSQL 16 runs migrations 009–018 from scratch and the original phase regression fixtures; new `tests/finance-phase9-postgres.sql` checks 6,500→6,100→12,100 TWD balance transitions, transfer conservation, genuine/mismatched replay, cross-month grocery rounding, overlap, voiding, category analytics reconciliation, export completeness, inclusive CSV, and RLS between distinct users.
- `tests/finance-phase9-integrity-diagnostics.sql` is **not a public RPC**. It reads all staging/CI finance rows and raises on ledger-account mismatch, missing owner references, orphan postings or events, duplicate operation UUIDs, invalid currency and allocation sums. Never automatically modifies records.
- Database writer RPCs remain authenticated; RLS restricts owner SELECTs; clients have no direct DML permission on finance tables; privileged operations are fixed-search-path server-side functions. No localStorage ledger, bank account login or service-role key is introduced.
- Risk not solved by isolated tests: actual Supabase Auth + browser sign-out/in persistence, cross-tab network contention in the deployed system, lost mobile connectivity, physical Android keyboard overlap, real production latency and restore-to-staging dry-run.

## Phase 10 release gates

1. **Do not merge/deploy** until final Phase 9 workflow succeeds on the exact proposed commit.
2. Verify the **real** deployment uses the expected Supabase project; inspect live schema metadata, current migration list and contents with read-only SQL. Compare with 009–018, including ownership, grants, RLS, indexes and functions.
3. Take an independently restorable database-level backup **before** migrations. Practice a staging restore; validate JSON snapshots with test data. Never reset live records.
4. Apply migrations in a dedicated staging project, run owner-to-owner access tests with actual Supabase tokens and end-to-end flows: app reload, sign-in/out, failed writes/retry, edit/void, reconciliation, cross-tab conflicts, CSV and JSON download.
5. Test physical Android at 320/360/390/430 layout equivalents, virtual keyboard and file downloads, plus tablet/desktop, and complete keyboard/screen-reader navigation and accessibility checks.
6. Verify any unresolved same-day reconciliation ambiguity, offline retry/after-reload idempotency, exact CSV/backup completeness and large-ledger limits before production release. If a P0/P1 blocker remains, **do not ship**.
7. Review current dependency alerts, production environment values (never expose server credentials), CORS/session behavior, and privacy disclosure.
8. Only after explicit user approval: merge in correct phase order, migrate production with rollback plan, deploy via Vercel, run real signed-in smoke tests with **non-destructive actual data**, and record the exact released SHA.

**Final position:** Passing development tests demonstrate important invariants; they do not establish live production readiness. Phase 9 includes no deploy and no live database writes.
