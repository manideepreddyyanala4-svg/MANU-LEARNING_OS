# ManuOS Finance — Final hardening and release decision

**Status: NO-GO for production deployment.**  
**Prepared:** 2026-10-30, Asia/Taipei.  
**Proposed release branch:** `feature/finance-phase-10-final-hardening`, based on `feature/finance-phase-10-release-preflight`.  
**Live Finance migration status:** No Finance tables yet; no live Finance data has been written by this work.

## Why this hardening was necessary

During a release audit of the existing Phase 10 candidate, a real P0 reliability flaw was identified: the original `finance_put_transaction` RPC deduplicated by a request UUID, but if a caller reused the UUID with **different arguments**, it returned the original transaction ID as if the new transaction had succeeded. An earlier release fixture explicitly exercised this flawed behavior by using a different merchant and expecting success. Account, amount, and merchant mismatches are unacceptable in a financial ledger.

Migration `019_finance_request_integrity.sql` adds `finance_ledger_events.request_fingerprint` and stores a canonical JSONB fingerprint of the **complete original RPC argument set** under the existing per-owner database lock. Identical requests return the same saved transaction ID without another posting; reused keys with different amounts, payment accounts, merchants, dates, allocations, revisions, or void mode raise an error. Original event and posting history remains immutable. Replays of legacy keys without fingerprints fail closed, requiring the user to inspect authoritative history.

The same migration verifies that repeated reconciliation keys match the original **target balance, account ID, date and reason**, rather than treating any previously recorded adjustment as confirmation of the new request. Newly created transaction time is derived from the user's configured Finance timezone.

Regression tests were adjusted to replay identical requests rather than quietly testing the unsafe behavior. A new SQL test checks repeated same-key requests, deliberately changed amount/account/merchant, reconciliation mismatch, signed balances, one event per UUID, and cross-owner access. The existing Phase 10 suite continues to check money totals, multi-day grocery attribution, budget and analytics invariants, exports, and RLS.

## Important two-branch warning

There are **two independent Phase 9 draft PRs**:

- PR #9: `feature/finance-phase-9-reliability` (Finance UI module, overview, complete owner backup and diagnostics), with migration `018_finance_export_integrity.sql`.
- PR #11: `feature/finance-phase-9-audit` (a separate alternative export implementation), with migration `018_finance_reliability_exports.sql`.

**Do not blindly merge both** or apply both conflicting `018` migrations. The Phase 10 release candidate is based on PR #9 / the `feature/finance-phase-9-reliability` path. This final hardening PR adds migration 019 **on top of that path only**, preserving the existing Phase 9 overview, backup UI, and pending-intent workflow.

## Actual live environment verified (read-only)

- Existing Vercel project: `manu-learning-os`, ID `prj_6RjVmZmD1KdrY3ne4tn91i9NRlTa`.
- Production domain: `manu-learning-os.vercel.app` (verified by Vercel).
- Connected active Supabase: `ManuOS`, ref `awmfxkaunmithimfijsi`, PostgreSQL 17.
- Finance tables: **0**. Supabase-tracked migrations: **0** (no `supabase_migrations.schema_migrations` table). Existing public application tables contain unrelated ManuOS records.
- Supabase staging branches: **none**.
- Security advisors: existing `public.set_updated_at` uses a mutable function search_path, and Auth leaked-password protection is disabled. Both are independent of the new Finance migration and should be reviewed before wider production release. Relevant guides: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable and https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Deployment gates still BLOCKED

1. **P0: owner-controlled complete production backup not verified.** The Supabase connection cannot produce a database-level recovery artifact, storage-object backup, or tested restore. Finance-only portable JSON is insufficient to preserve unrelated ManuOS data. Follow `docs/finance/PRODUCTION_BACKUP_RUNBOOK.md` on a trusted local machine to export all relevant database, auth/config, and storage assets **without committing them or pasting secrets into ChatGPT**.
2. **P0: restored staging environment not available.** Create an isolated, authorized staging database with verified backups and permissions. Do not incur paid staging/compute charges without approval.
3. **P1: actual authenticated browser E2E not verified.** Need two staging owners and real Supabase Auth for first-time setup, expense/income/transfer, allocation, edit/void, reconciliation, filtered analytics, exports, sign-out/in persistence, offline uncertain-request retries, and multi-tab conflict behavior.
4. **P1: actual Android keyboard/device verification not performed.** Chromium responsive tests are not physical device validation.
5. **P1: production migration plan needs all 009–019 reviewed against existing public schema and current provider settings.** Never rerun existing 001–008 against populated production without a migration inventory.

**Do not deploy, merge to main, or apply migrations to production before these are satisfied.** Production code is still the existing non-Finance app; no actual owner finances were created or modified by the tests.

## Safe completion sequence

1. Create a complete offline recovery artifact and rehearse full restoration, including unrelated ManuOS data and storage, onto a separate environment.
2. Validate the actual production/staging schema and environment binding, then apply 009–019 **to staging only** in dependency order. Preserve existing tables.
3. Exercise real two-user signed-in E2E with verified mobile layouts, network interruption/retry, reconciliation and JSON/CSV exports. No test writes to production Finance records.
4. Review security advisers and all high-severity dependency alerts. Run CI on the exact final release SHA; require both browser and PostgreSQL jobs green.
5. Once all gates pass and deployment is explicitly approved, merge the canonical Finance chain plus this hardening branch, apply reviewed migrations to production with rollback/forward-fix plan, and deploy **the existing Vercel project**.
6. Verify active domain, production deployment commit, live user authentication and read-only Finance structure; user enters actual opening balances and validates the real bank statements. Do not insert fake payments.

## Results

- A prior Phase 10 release-preflight branch had green isolated PostgreSQL 17 and app checks.
- This hardening branch has new migration 019 and a negative security regression, tested in disposable GitHub Actions PostgreSQL 17, not live.
- The benchmark is **not production certification** without independent backup/staging/Android evidence.
