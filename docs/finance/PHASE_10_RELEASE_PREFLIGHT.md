# ManuOS Finance — Phase 10: Production Release Preflight and Go/No-Go Record

**Prepared:** 2026-10-30 (Asia/Taipei). **State: NO-GO — do not deploy or migrate production.**

## 1. Repository / baseline

- Repository: `manideepreddyyanala4-svg/MANU-LEARNING_OS`
- Production/default branch `main` at preflight: `6507cf35202ca4ceaf664b8e6009ade443404371`
- Base of Phase 10: `feature/finance-phase-9-reliability` commit `274f281bbe30e1751f005ce721a804754790bbde`
- Release candidate branch: `feature/finance-phase-10-release-preflight` (the commit for a prospective release must be recorded from latest GitHub branch head after this document and tests pass).
- The Finance work from Phases 2–9 is **not merged into main**. Earlier Phase 2–9 PRs are separate development draft PRs; production app must not be presumed to contain any corresponding DB schema.
- Existing target URL: `https://manu-learning-os.vercel.app`. **Vercel project ID and active production deployment ID have not been verified.** A matching domain string in a prompt does not verify account access or Git integration.
- Financial persistence architecture from repo: Supabase Auth/PostgreSQL using `@supabase/ssr` and `@supabase/supabase-js`. Client needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy anon name. Do not expose the service role key.
- Latest Phase 9 CI had 134 Playwright desktop/mobile tests, passed isolated PostgreSQL migrations 009–018 and financial regression SQL, finance lint/type/build passed and dependency audit found no known vulnerabilities at the time. Repository-wide lint has 4 pre-existing unrelated errors.
- Phase 10 adds `tests/finance-phase10-release-postgres.sql`: precise 5-step Post Bank/CTBC/Cash ledger calculations; cross-month overlapping 3/3/5-day grocery allocations; edit, account change, void, exact rounding, trend and archive owner isolation. CI confirmation required separately.

## 2. Known release blockers (do not override by relying on CI)

| Severity | Blocker | Required proof to clear |
| --- | --- | --- |
| **P0 release gate** | Actual production Supabase project and schema migration history are unverified. | Authorized Supabase project read-only identification and migration inventory, matching origin `NEXT_PUBLIC_SUPABASE_URL` to exact production target. |
| **P0 release gate** | Production backup/recovery state and non-destructive migration safety are unverified. | Independently validated recoverable production snapshot including unrelated existing ManuOS data; transactional staged migration 009–018; rehearsed restoration and verified rollback with a distinct disposable database. |
| **P1 release gate** | Existing Vercel project identity, live Git branch/commit, environment variables and deployment ID are unverified. | Authorized read-only Vercel project/production deployment lookup and safe environment identity comparison, without logging secrets. |
| **P1 release gate** | Real signed-in staging Finance create/edit/void, bank balance, transfer, budget, cross-month grocery and CSV/JSON download have not been exercised. | Authorized staging credentials / isolated owner plus second owner, migration 009–018, actual UI and database-write E2E tests with refresh, sign-out/sign-in, owner isolation, duplicate save, concurrent tabs and offline. |
| **P1 release gate** | Mobile authenticated controls, keyboard, chart and calendar are not visually verified on real device. | Inspect actual screenshots/touch workflows at 320/360/390/430px, tablet and real Android with Supabase staging. |
| **P1 recovery gate** | Portable JSON has no proven automated full restore procedure. | Isolated backup restore rehearsal with preserved transaction IDs, full posting and audit history, owner FK check and balance/consumption reconciliation. No blind restore on populated owner DB. |

**All blockers above are release blockers, not claims of known data corruption.** They prevent confident promotion of money-management software without changing production.

## 3. Release dry-run procedure (safe / read-only first)

1. Confirm the connected Vercel account has the **existing** ManuOS project and that `manu-learning-os.vercel.app` is a verified production alias. Record project ID, active deploy ID, current Git commit and production branch. Never create another project/domain.
2. Confirm the selected Supabase project matches Vercel's production **public URL host** and intended auth settings. Do not print environment variable values or access tokens. Read migration tracking, table status, RLS and whether production already holds any real Finance rows.
3. Capture and **restore-check** a production database snapshot in a separate environment including unrelated owner records/assets. Check RPO/RTO and availability of point-in-time restore; Git alone cannot restore financial data.
4. Review migrations `009`–`018` against actual `001`–`008` and live schema; verify additive changes, SECURITY DEFINER search paths, RLS policies, grant limits, trigger compatibility, extensions, operation UUID uniqueness and precise amounts. Never use `reset db` in production.
5. Apply 009–018 **only to a disposable staging clone first**; run all Postgres regression SQL **only** on disposable test DB with fake users. The release tests insert fixture users and MUST NEVER run on a real production/staging database that contains actual user data.
6. Validate two real staging identities through browser workflows including Post/CTBC/Cash, income, transfer, expense edit/void, day allocations, budget edit, analytics, export, logout/login, cross-user denial and network fault. Confirm browser screenshots at all requested sizes and no unrelated ManuOS regressions.
7. Run release candidate CI for exact commit. Correct any P0/P1 issues and freeze a new reviewed commit SHA; record migration/preflight evidence.
8. Only once the above are green, promote code to the **same** connected existing Vercel project and approved reviewed schema to intended production Supabase. Confirm Vercel completed deployment and active domain, then **read-only** production smoke/health and financial owner acceptance without fabricated real purchases.
9. If release fails, stop unsafe Finance writes, preserve new real transactions, and only roll back app code if backward-compatible with applied DB schema. Treat additive SQL migration separately; never destructively reverse ledger, reset database or overwrite valid post-release entries.

## 4. Explicit checkpoints: NOT VERIFIED at preflight

| Required field | Current value |
| --- | --- |
| Vercel production project ID | `prj_6RjVmZmD1KdrY3ne4tn91i9NRlTa` — VERIFIED |
| Vercel production deployment ID | `dpl_AspmMhsbBNQAZftcrop7BivCyWGe` — READY at preflight |
| Active Vercel Git deployment commit | `main` at `6507cf35202ca4ceaf664b8e6009ade443404371` — VERIFIED |
| Supabase production project reference | `awmfxkaunmithimfijsi` — matches production URL host |
| Supabase target migration history / finance tables | No tracked migrations, 23 existing non-Finance public tables, zero Finance tables — VERIFIED |
| Production backup & recovery test | NOT VERIFIED |
| Authenticated staging + real Android screenshots | NOT VERIFIED |
| Production migrations 009–018 | **NOT APPLIED BY THIS RELEASE WORK** |
| Production deployment | **NOT PERFORMED** |
| Release status | **NOT DEPLOYED — RELEASE BLOCKERS REMAIN** |

## 5. Rollback / safe failure rules

Never restore a full pre-release snapshot over a live database if newer valid transactions may exist. Freeze writes when necessary, capture the latest DB snapshot and logs, reconcile incoming writes and use forward-compatible fixes. App rollback does **not** reverse PostgreSQL schema changes; test old/new app compatibility in staging. A release checklist is not a substitute for actual Vercel and Supabase project inspection.

## 6. Release-critical user acceptance

Read the [Finance User Guide](./USER_GUIDE.md). Owner must sign in, confirm Post Bank, CTBC Bank and Cash Wallet map to their actual manually observed balances; test a real-world purchase only when intending to record a legitimate expense; verify saved account delta, original cashflow date, allocation consumption dates, analytics, and private exports. No fixture purchases should be created under the owner's actual account. Record any discrepancy and block future financial writes until resolved.

**Do not merge or publish the Phase 10 draft release PR until P0/P1 gates have evidence.**

## 7. Connected live-service evidence (2026-10-30, read-only)

**Supabase:** The authenticated Supabase account lists exactly one active healthy project named `ManuOS`, ref `awmfxkaunmithimfijsi`, region `ap-northeast-2` (Seoul), Postgres **17.11**. The organization `JobReady Org` is on the **Free** plan. A second project, `yjgcfputqjzfqsrqveuy` in Singapore, was marked inactive and must not be assumed to be this application's backend. The ManuOS API host is `awmfxkaunmithimfijsi.supabase.co`. **Verified live Vercel backend:** the existing Vercel project's production `NEXT_PUBLIC_SUPABASE_URL` environment value was read only for exact host equality (secret-free output); it matches `awmfxkaunmithimfijsi.supabase.co`. No credentials were disclosed.

Read-only schema introspection of active ManuOS found **23 public base tables**, including populated learning/activity tables, and **zero public Finance tables**. Every public base table had RLS enabled. The Supabase migration-list API returned no tracked migrations; `supabase_migrations` schema was absent. Do **not** assume SQL files 001–008 have tracked migration versions. Existing tables were likely created by another method, but the method is unverified. Finance 009–018 must be staged against a copy of this exact base schema and reviewed for dependencies. Never apply 001–008 over populated production blindly.

Security advisers report: (1) `public.set_updated_at` has a mutable search path (https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), and (2) leaked-password protection is disabled (https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). These are existing application hardening tasks, not direct evidence of Finance vulnerabilities. Performance advisers also report multiple pre-existing unindexed foreign keys.

**Backup blocking risk:** Supabase official backup docs (https://supabase.com/docs/guides/platform/backups) state automatic daily database backups are on Pro/Team/Enterprise; Free-tier owners should regularly export via CLI `db dump` or another independently tested process. This connection exposes no database-backup API. No complete production backup or isolated restore has been produced or verified. **NO PRODUCTION SCHEMA CHANGE until this gate is cleared.** The JSON archive in Finance protects only Finance owner data and is not a complete Supabase database backup.

**Vercel — verified after user approved access:** existing `manu-learning-os` project id `prj_6RjVmZmD1KdrY3ne4tn91i9NRlTa`, team `team_25mSjhrZDbhuGSDh9Gxuol6f`, framework Next.js, verified production domain `manu-learning-os.vercel.app`. Last production deployment at audit `dpl_AspmMhsbBNQAZftcrop7BivCyWGe`, state READY, commit `6507cf35202ca4ceaf664b8e6009ade443404371`, ref `main`; **Finance code still not deployed to the production alias**. The 16 configured project environment entries were targeted to production only; preview-target Supabase environment config was not listed, so authenticated Finance staging on preview cannot be presumed to work. The decrypted public URL host was compared inside the connector without disclosing other values and matched active ManuOS Supabase ref `awmfxkaunmithimfijsi`. Existing development preview deployments from Finance branches are READY, but a successful build without a separate Finance-migrated preview database is not an authenticated functional acceptance pass.

**Additional release constraint:** The Phase 10 GitHub CI job now uses isolated PostgreSQL 17 and passes migrations 009–018 and synthetic financial regression. Production is PostgreSQL 17.11. A PostgreSQL 17 CI container is **not** a complete Supabase staging clone (auth, storage, grants, production 001–008 schema, third-party services, or real browser sign-in). Do not insert fixture users into the live `auth.users` table.

## 8. Post-authorization code-reliability repairs

- Recent recorded expenses now request an **active-only server-side** history page. Voided transactions remain accessible in the comprehensive history and backup, but no longer appear as ordinary paid recent purchases in the overview.
- Pending transaction retries retain up to 32 hashed independent intents for 7 days per session and action scope, rather than overwriting the previous uncertain UUID when the user begins a second different expense. Phase 9 one-slot session state is migrated, with no raw merchant/account/amount data stored in sessionStorage. Browser/session-loss and true simultaneous cross-device duplicates still require user reconciliation against server history.
- Added regression testing for interleaved uncertain intents and Phase 9 store migration.
- Updated the release-only Postgres test service from v16 to v17 and confirmed the SQL job passed, matching the active production major version.

**Gates still open:** no complete recoverable live production database export; no verified isolated restore; no Supabase staging owner login and cross-user/authenticated mobile acceptance; therefore **do not merge PR #10 or apply Finance schema in production**.
