# MANU Learning OS

A calm, responsive learning workspace built with Next.js App Router, Tailwind, lucide, motion-ready UI, next-themes, Supabase SSR scaffolding, and Playwright.

## Setup

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` to enable authentication and persistence. Apply migrations in order using the Supabase SQL editor or `supabase db push`. The service-role key is server-only and must never be committed or sent to the browser.

Without Supabase variables, development uses a device-local fallback for inbox captures; no credentials or fake remote data are created. Authenticated routes are protected by middleware when Supabase is configured.

## Checks and deployment

`pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` run the quality checks. Install Playwright browsers with `pnpm exec playwright install` when running browser tests on a new machine. Deploy the production build with `pnpm build && pnpm start`, and configure the same public Supabase variables in the hosting provider. Add the deployment URL to Supabase Auth redirect URLs.

Security relies on Supabase Auth sessions, server-side cookie refresh, and row-level security policies requiring `auth.uid() = user_id`. Keep RLS enabled and never use a service-role key in client code.
