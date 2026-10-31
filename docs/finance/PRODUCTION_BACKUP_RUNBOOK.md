# Production database backup / restore gate

**Status:** Not complete. Do not run Finance migrations 009–018 in production.

**Verified live target:** Supabase ManuOS project `awmfxkaunmithimfijsi`, PostgreSQL 17, Free plan. The existing Vercel project `manu-learning-os` points at its public Supabase URL. Production currently contains 23 pre-existing public tables with protected learning/activity data, no Finance tables.

## Why the release is blocked

- Supabase Free projects do not receive the scheduled daily database backup service supplied on paid plans. See https://supabase.com/docs/guides/platform/backups.
- A Vercel code rollback does **not** roll back Postgres schema or personal financial transactions.
- The Finance JSON export is Finance-only; it does not include pre-existing ManuOS learning data, Auth configuration or private image files.
- A default Supabase CLI `db dump` explicitly excludes managed Auth and Storage schemas. Database backups also exclude actual Storage object bytes. A successful SQL file alone is not a complete project restoration plan.

## First step — owner-controlled SQL export

On a trusted local computer, outside the Git repository, install the current Supabase CLI and Docker Desktop. Use Supabase's official instructions: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore.

Sign in to Supabase locally and explicitly link the correct project:

```sh
supabase login
supabase link --project-ref awmfxkaunmithimfijsi
supabase db dump -f roles.sql --role-only
supabase db dump -f schema.sql
supabase db dump -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

Use a private, secure working directory. Never send database passwords, auth records or exported SQL to ChatGPT or commit them to GitHub. Confirm command success, nonempty output files, and encrypted off-site copies. These three files are **partial** recovery material, not proof that the entire Supabase project can be restored.

## Second step — full recovery rehearsal

1. Separately back up private Storage objects (not merely database metadata), Auth/redirect configuration, and any other owner documents.
2. Establish a different, authorized disposable database and Storage environment. If it has a cost, obtain separate approval.
3. Restore copies of the public schema/data and protected assets; verify public table counts/IDs, existing private files, RLS, grants and authorized authentication.
4. Apply finance migrations 009–018 **to the isolated restored environment only**. Verify two-owner separation and authenticated web workflows, refresh/persistence, expense edits and voids, backup and multi-day allocations.
5. Record verified recovery, migration and deployment evidence. **Only then** approve production migration and Vercel release.

Do not upload a full backup over a live database or discard newer legitimate entries during rollback.
