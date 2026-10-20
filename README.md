# MANU Learning OS

Private single-owner learning workspace. Supabase stores the dashboard, roadmap, Inbox, subjects, topics, Markdown notes and images. The app contains no prewritten educational material.

## Requirements

Node.js 24 (the repository includes `.nvmrc`), pnpm 10, and a Supabase project. On a fresh machine:

```bash
nvm use
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` from Supabase Project Settings → API. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted. Never expose a service-role key. pnpm's release-age protection should remain enabled; do not discard the lockfile to bypass it.

## Supabase setup

1. In the Supabase SQL Editor apply `supabase/migrations/001_initial.sql`, `002_corrective.sql`, `003_foundation.sql`, then **`004_learning_v1.sql`** in order. If 001–003 are already applied, run only 004. Migration 004 creates the private `learning-assets` bucket and its policies.
2. In Authentication → Users, create the owner email/password account. Disable public email signup under Authentication settings. This app has no public registration.
3. Set Supabase Auth Site URL to the deployed origin when deployed. Add `http://localhost:3000/**` and your Vercel URL pattern to Auth redirect URLs. For Vercel preview domains, add the appropriate preview URL pattern if you intend to sign in there.
4. Sign in at `/login`. The authenticated `bootstrap_owner()` function inserts the mission, mode, priorities, workflow and 21 roadmap rows without overwriting edits. If it reports an error, check migrations 001–003.

Every personal table has `user_id`, RLS, and owner-only CRUD policies. Learning child tables also have composite foreign keys that require parent rows with the same `user_id`. Images are stored in a **private** bucket under the owner's UID and displayed through one-hour signed URLs. Refreshing the topic renews those URLs. The app has no service-role operations or public image URLs.

## Run and verify

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e --project=desktop-chromium --project=tablet-chromium --project=mobile-chrome
```

The Chromium suite checks unauthenticated redirects when Supabase is configured. A real owner session is needed to validate the full create → save → refresh → upload → refresh → logout flow. This repository does not contain test credentials. To run the disposable live owner flow after applying 004, set `MANU_TEST_EMAIL` and `MANU_TEST_PASSWORD` in your shell (not in a committed file) and run `pnpm test:e2e --project=desktop-chromium tests/live.spec.ts`; it creates and then deletes its own test subject, topic, image and Inbox capture. WebKit may require additional Linux host libraries (`pnpm exec playwright install-deps webkit`).

## Vercel deployment

1. Push this repository to GitHub and import it into Vercel as a Next.js project. Select Node.js 24. Use pnpm and the committed `pnpm-lock.yaml`.
2. In Vercel Project Settings → Environment Variables, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production (and Preview if used). Redeploy after changing them.
3. Apply migration 004 and create the owner before first deployed login. Set the Supabase Auth Site URL and redirect URLs to the deployed origin.
4. Open `/login`, sign in, create a subject and topic, save a note, upload an image, refresh both, then log out and confirm a protected URL returns to `/login`.

No local filesystem data is needed in deployment. All user data persists in Supabase. The PWA manifest is native Next.js at `/manifest.webmanifest`, with no service worker or offline sync.

## Routes and limits

`/` dashboard; `/login`; `/learning`; `/learning/[subjectSlug]`; `/learning/[subjectSlug]/[topicSlug]`; `/job-preparation`; `/files`; `/inbox`; `/progress`; `/settings`. Roadmap remains available as a secondary workspace at `/roadmap`.

Notes use plain Markdown and a safe HTML-disabled renderer with GFM preview. Learning images/assets and Files/Job files use private buckets and signed URLs; supported topic assets include JPEG/PNG/WEBP/PDF/DOCX/TXT/MD. Subject and topic order follows creation order; drag reordering is not included. Learning search uses case-insensitive title and note-text matching, not semantic search. Theme preference uses `next-themes` browser storage. Without Supabase variables, development shows an unconfigured workspace and supports a local-only Inbox fallback; configure Supabase for real private use. No Notion import, AI, quizzes or offline synchronization is included.
