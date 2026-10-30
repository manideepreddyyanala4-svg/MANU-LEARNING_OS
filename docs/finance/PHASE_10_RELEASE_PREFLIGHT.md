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
| Vercel production project ID | NOT VERIFIED |
| Vercel production deployment ID | NOT VERIFIED |
| Active Vercel Git deployment commit | NOT VERIFIED |
| Supabase production project reference | NOT VERIFIED |
| Supabase target migration history / finance tables | NOT VERIFIED |
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
