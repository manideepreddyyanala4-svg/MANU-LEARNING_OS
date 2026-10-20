'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client) { setError('Add Supabase environment variables to enable sign in.'); return; }
    setBusy(true); setError('');
    const { error: authError } = await client.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    else router.replace(next as never);
    setBusy(false);
  }
  return <main className="grid min-h-screen place-items-center p-5"><div className="w-full max-w-sm"><Link href="/" className="text-xl font-black">MANU<span className="text-[#ff6b35]">.</span></Link><h1 className="mt-12 text-4xl font-black">Welcome back.</h1><p className="mt-2 opacity-60">Sign in to continue your learning journey.</p><form onSubmit={submit} className="mt-8 space-y-3"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border bg-transparent p-3"/><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border bg-transparent p-3"/><button disabled={busy} className="w-full rounded-lg bg-black p-3 font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black">{busy ? 'Signing in…' : 'Continue'}</button>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}</form><p className="mt-5 text-xs opacity-50">Use your Supabase account. Local development remains available when credentials are absent.</p></div></main>
}
