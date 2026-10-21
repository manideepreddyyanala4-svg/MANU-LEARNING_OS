'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { BookOpen, ShieldCheck, Target, ArrowRight, Lock, Mail, Sparkles, Terminal } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client) {
      setError('Supabase credentials missing. Check environment configuration.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: authError } = await client.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      const { error: bootstrapError } = await client.rpc('bootstrap_owner');
      if (bootstrapError) {
        await client.auth.signOut();
        setError(`Workspace initialization failed: ${bootstrapError.message}`);
        setBusy(false);
        return;
      }
      window.location.assign(next.startsWith('/') && !next.startsWith('//') ? next : '/');
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xl md:flex-row">
      {/* Left Column: Brand & Engineering Mission */}
      <div className="flex flex-col justify-between border-b border-[var(--line)] bg-[var(--sidebar)] p-8 md:w-5/12 md:border-b-0 md:border-r md:p-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs">
              M
            </div>
            <span className="text-base font-black tracking-tight text-[var(--fg)]">
              MANU<span className="text-[var(--accent)]">.</span>OS
            </span>
            <span className="ml-auto rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[9px] font-bold text-[var(--accent)]">
              v2.0
            </span>
          </div>

          <div className="mt-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              <Target size={12} /> Target Objective
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">
              Technical Internship & Engineering Mastery
            </h2>
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              Dedicated execution environment for curriculum study, paper-to-notes synthesis, and structured career preparation.
            </p>
          </div>

          <div className="mt-8 space-y-2.5 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">✓</span>
              <span>Distraction-free technical curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">✓</span>
              <span>Paper → ChatGPT → MANU OS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">✓</span>
              <span>Private encrypted cloud storage</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--line)] pt-4 text-[11px] text-[var(--muted)] flex items-center justify-between">
          <span>Owner RLS Protected</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
        <div className="max-w-sm w-full mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Secure Authentication
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--fg)]">
            Welcome back.
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Enter your credentials to access your personal learning workspace.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-[var(--fg)]"
                htmlFor="login-email"
              >
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  id="login-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-[var(--fg)]"
                htmlFor="login-password"
              >
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  id="login-password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <button
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {busy ? 'Signing in…' : 'Continue'}
              {!busy && <ArrowRight size={14} />}
            </button>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 dark:bg-red-950/20">
                {error}
              </p>
            )}
          </form>

          <p className="mt-8 text-center text-[11px] text-[var(--muted)]">
            Internal Operating System · Owner Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-5">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
            <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">Loading MANU OS…</h1>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
