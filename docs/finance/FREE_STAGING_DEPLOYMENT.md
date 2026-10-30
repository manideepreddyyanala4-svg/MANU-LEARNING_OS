# ManuOS Finance — zero paid staging release route

**Release status: NOT YET LIVE. No paid staging branch is used or authorized.**
**Date:** 2026-10-30 Asia/Taipei.
**Canonical code lineage:** Phase 9 reliability → Phase 10 preflight → Phase 10 request-integrity hardening → this free-gates branch.
**Do not merge alternative Phase 9 audit PR #11:** it has a different migration numbered 018 and incompatible export contract.

## 1. Verified project and existing records

- Existing hosted Vercel project: `manu-learning-os`, project ID `prj_6RjVmZmD1KdrY3ne4tn91i9NRlTa`.
- Main site: https://manu-learning-os.vercel.app (production still on pre-Finance `main`).
- Existing free-plan Supabase ManuOS: `awmfxkaunmithimfijsi`, PostgreSQL 17, no tracked migrations.
- As of audit: 23 existing public tables, all RLS enabled, **0 Finance tables**. There is live learning progress/note data.
- Storage: private bucket `learning-assets` with **45 objects**, private bucket `manu-files` with 0. These file bodies **are not contained in SQL dumps**. Never overwrite or reset them.
- Phase 10 Finance preview is built on the existing Vercel project, but no real Finance writes can work until the DB migration exists.

## 2. FREE disposable full-stack staging in GitHub Actions

Run the existing workflow `.github/workflows/finance-free-local-supabase.yml`. It never invokes hosted Supabase migration or paid branch APIs and never requests production secrets.

The workflow:

1. Installs pinned Supabase CLI v2.122.0 on an ephemeral GitHub runner.
2. Creates an **unlinked local-only** Docker Supabase stack (PostgreSQL 17, GoTrue Auth, PostgREST, API gateway).
3. Copies migration files `001`–`019` into timestamped local-only names and applies them to disposable PostgreSQL.
4. Creates disposable authenticated users using local-only service key, without printing auth credentials.
5. Checks direct Supabase RPC and money invariants, real Next.js sign-in via Chromium, refresh persistence and owner-isolation access.
6. Tears down all local containers. **No real user, database, service-role key, or paid resource is touched.**

GitHub Actions on private repositories has included minutes subject to the plan quota; do not claim unlimited free compute. CI concurrency cancels redundant newer runs. This is a free **synthetic** staging stack, not a copied production dataset or real Android device.

## 3. Required free production backup (owner action, no ChatGPT credentials)

Supabase's Free plan does **not** include automatic daily database backups. Before writing a migration to the live database, the owner must export all existing records and the 45 private images, keep a separate encrypted offline copy, and prove data are recoverable. The Supabase plugin has no complete database backup or Storage-download action. Do not pretend a read-only metadata scan is a backup.

A Windows PowerShell helper is committed at `scripts/finance-free-backup.ps1`. It uses only the owner's interactive Supabase CLI login/link (no secrets hard-coded), exports roles, schema, public data and explicitly selected Auth/Storage data; then tries to download `learning-assets` recursively using the official experimental CLI Storage copy command. It checks that required files are nonempty, requires at least the last observed 45 learning assets and writes per-file SHA-256 checksums and a manifest to `~/ManuOS-Private-Backups`. It **fails closed** if files are missing. It does not read credentials into ChatGPT or copy private data into GitHub.

**Run on your own Windows computer, in a trusted clone of the repository:**

```powershell
powershell -NoProfile -File .\scripts\finance-free-backup.ps1
```

Supabase CLI and Docker Desktop must already be installed. Link/DB password prompts, if any, happen in your terminal. Do not paste passwords, API keys, SQL backups, auth user records or private images into ChatGPT. The script cannot be executed through the connected Supabase plugin on behalf of the owner. The exact file count may have changed: after export compare live Storage metadata counts; do not rely only on a historic threshold.

**IMPORTANT:** Even a completed backup manifest does **not** prove a complete restore. The owner should test restoring the SQL and files into a disposable local Supabase instance and compare restored user IDs, row counts and asset bytes. Auth encryption/GoTrue config and Storage object payloads need separate checks. Do not declare production recovery tested merely because `db dump` exits zero.

Reference: https://supabase.com/docs/guides/platform/backups and https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore .

## 4. Read-only production preflight

After owner backup/recovery proof, run only metadata queries on the existing live project and verify:
- project ref matches `awmfxkaunmithimfijsi`;
- all 23 legacy public tables and their counts/policies still exist;
- the Finance namespace and Finance procedures do not already exist;
- no duplicate existing migration versions conflict;
- production environment URL in Vercel points to the same public Supabase origin;
- incoming migration files 009–019 do not mutate any non-Finance table or bucket.

This step may be done with connected Supabase read-only queries. Record evidence, never export secrets.

## 5. Production schema and Vercel code rollout (only after gates above pass)

1. Apply **only** additive Finance migrations `009`–`019` in order, after separate review, **not** legacy `001`–`008`. For safety validate the exact live base and use transactional migrations; never run `supabase db reset` or a destructive `db push` against existing production.
2. Verify required new Finance tables, owner RLS, execute grants, financial RPCs, safe default initialization and legacy data count unchanged. On failure, do not promote app code and preserve any new legitimate records.
3. Deploy the exact green release SHA to the **existing** Vercel project, no new project and no new domain. Verify actual deployed SHA and domain.
4. Log in with the owner's account, confirm Post Bank / CTBC / Cash, manually set real current balances, check persistence after reload. No fabricated production payments.
5. Export a Finance backup through the web UI and reconcile against saved account ledger. Keep regular private backups: manual imports are not supplied.

## 6. Explicit release decision

- ✅ Paid Supabase staging: **NOT USED**.
- ✅ Local full-stack synthetic staging: implemented in GitHub Actions (check run conclusion before claiming it passed).
- ✅ DB owner/data privacy regressions: included in local tests.
- ❌ Owner's private production SQL/Auth/Storage backup: **NOT yet captured or verified**.
- ❌ Full owner dataset recovery rehearsal: **NOT yet proven**.
- ❌ Live Finance tables: **NOT applied**.
- ❌ Real production Finance UI: **NOT deployed**.
- ❌ Physical Samsung Android sign-in/download verification: **NOT performed**.

**Stop at the backup gate. Do not quietly skip it to get a green deployment badge.**
