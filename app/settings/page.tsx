'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Check,
  CheckCircle2,
  Database,
  Eye,
  Key,
  Lock,
  LogOut,
  Moon,
  Plus,
  Save,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  User,
  X,
  Target,
  FileText,
  Sliders,
  Laptop,
} from 'lucide-react';
import { Page, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { loadPriorities, loadSettings, type SettingsData } from '@/lib/store';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('man@gmail.com');
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const client = createClient();
    if (client) {
      client.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) setUserEmail(user.email);
      });
    }

    Promise.all([loadSettings(), loadPriorities()])
      .then(([s, p]) => {
        setData(s);
        setPriorities(p.map((x) => x.title));
      })
      .catch((e) => setMessage(e.message));
  }, []);

  async function save() {
    const client = createClient();
    if (!client || !data) return;
    setBusy(true);
    setMessage('');
    try {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) return;

      const { error } = await client
        .from('app_settings')
        .update(data)
        .eq('user_id', user.id);
      if (error) {
        setMessage(error.message);
        return;
      }

      const existing = await loadPriorities();
      for (let i = 0; i < priorities.length; i++) {
        const title = priorities[i].trim();
        if (existing[i]) {
          const { error: e } = await client
            .from('priority_items')
            .update({ title })
            .eq('id', existing[i].id);
          if (e) {
            setMessage(e.message);
            return;
          }
        } else if (title) {
          const { error: e } = await client
            .from('priority_items')
            .insert({ user_id: user.id, title, sort_order: i + 1 });
          if (e) {
            setMessage(e.message);
            return;
          }
        }
      }

      await client.from('activity_events').insert({
        user_id: user.id,
        event_type: 'settings_changed',
        metadata: {
          fields: [
            'mission',
            'current_mode',
            'focus_rule',
            'priorities',
            'note_workflow',
          ],
        },
      });

      setMessage('Settings saved successfully.');
      setTimeout(() => setMessage(''), 4000);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error saving settings');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const client = createClient();
    if (client) await client.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  function addPriority() {
    setPriorities([...priorities, '']);
  }

  function removePriority(index: number) {
    setPriorities(priorities.filter((_, i) => i !== index));
  }

  return (
    <Page
      eyebrow="Configuration"
      title="Settings & System Preferences"
      subtitle="Customize workspace theme, career objectives, and operating protocol standards."
      actions={
        <button
          disabled={busy}
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          <Save size={14} />
          <span>{busy ? 'Saving…' : 'Save Changes'}</span>
        </button>
      }
    >
      {message && (
        <div
          role="status"
          className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="p-1 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (4 cols): Appearance, Account & Security */}
        <div className="lg:col-span-4 space-y-6">
          {/* Appearance Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              <Sliders size={14} />
              <span>Workspace Appearance</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Light mode is calibrated for long, distraction-free study sessions.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {/* Light option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                  mounted && theme === 'light'
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-2xs ring-1 ring-[var(--accent)]'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-color-mix(in srgb, var(--accent) 40%, var(--line)) hover:text-[var(--fg)]'
                }`}
              >
                <Sun size={20} className={mounted && theme === 'light' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                <span className="text-xs font-bold">Light</span>
              </button>

              {/* Dark option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                  mounted && theme === 'dark'
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-2xs ring-1 ring-[var(--accent)]'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-color-mix(in srgb, var(--accent) 40%, var(--line)) hover:text-[var(--fg)]'
                }`}
              >
                <Moon size={20} className={mounted && theme === 'dark' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                <span className="text-xs font-bold">Dark</span>
              </button>

              {/* System option */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                  mounted && theme === 'system'
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-2xs ring-1 ring-[var(--accent)]'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-color-mix(in srgb, var(--accent) 40%, var(--line)) hover:text-[var(--fg)]'
                }`}
              >
                <Laptop size={20} className={mounted && theme === 'system' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                <span className="text-xs font-bold">Auto</span>
              </button>
            </div>
          </div>

          {/* Account & Session Identity Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              <User size={14} />
              <span>Account Identity</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[var(--line-subtle)]">
                <span className="text-[var(--muted)]">Active User</span>
                <span className="font-semibold text-[var(--fg)]">{userEmail}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[var(--line-subtle)]">
                <span className="text-[var(--muted)]">Auth Provider</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Shield size={12} /> Supabase Auth
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[var(--line-subtle)]">
                <span className="text-[var(--muted)]">Database Storage</span>
                <span className="font-semibold text-[var(--fg)] flex items-center gap-1">
                  <Database size={12} /> Private RLS
                </span>
              </div>
            </div>

            <button
              onClick={() => setConfirmLogoutOpen(true)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition"
            >
              <LogOut size={14} /> Sign out of MANU OS
            </button>
          </div>

          {/* Storage & Encryption Architecture */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              System Architecture
            </h4>
            <div className="mt-3 space-y-2 text-xs text-[var(--muted)] leading-relaxed">
              <p>• <strong>Next.js 16</strong> App Router with SSR authentication.</p>
              <p>• <strong>Supabase PostgreSQL</strong> with Row-Level Security on every table.</p>
              <p>• <strong>Encrypted Storage Bucket</strong> (`manu-files`) with authenticated presigned URLs.</p>
              <p>• <strong>BlockNote Prosemirror</strong> rich documents with schema migrations.</p>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Career Mission, Priorities, and Protocol */}
        <div className="lg:col-span-8 space-y-6">
          {data ? (
            <>
              {/* Mission & Operating Mode Card */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--fg)] flex items-center gap-2">
                      <Target size={18} className="text-[var(--accent)]" />
                      <span>Career Mission & Core Objectives</span>
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      The non-negotiable objective that governs roadmap planning and study time.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                      Current Career Mission
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                      value={data.mission}
                      onChange={(e) => setData({ ...data, mission: e.target.value })}
                      placeholder="e.g. GET A TECHNICAL INTERNSHIP"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                        Current Mode
                      </label>
                      <input
                        className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                        value={data.current_mode}
                        onChange={(e) => setData({ ...data, current_mode: e.target.value })}
                        placeholder="e.g. Technical Interview Preparation & Mastery"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                        Focus Rule & Operating Boundary
                      </label>
                      <input
                        className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                        value={data.focus_rule}
                        onChange={(e) => setData({ ...data, focus_rule: e.target.value })}
                        placeholder="e.g. No business or startup research until internship objective is achieved"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Priorities Order */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--fg)]">
                      Execution Priorities Hierarchy
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Ordered disciplines to prevent distraction and maintain daily velocity.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPriority}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    <Plus size={13} /> Add Priority
                  </button>
                </div>

                <div className="mt-4 space-y-2.5">
                  {priorities.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs font-bold text-[var(--muted)]">
                        {i + 1}
                      </div>
                      <input
                        className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-medium text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                        value={item}
                        onChange={(e) =>
                          setPriorities(
                            priorities.map((v, j) => (i === j ? e.target.value : v))
                          )
                        }
                        placeholder={`Priority ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removePriority(i)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note Workflow SOP Steps */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
                <div className="border-b border-[var(--line)] pb-4">
                  <h3 className="text-base font-bold text-[var(--fg)] flex items-center gap-2">
                    <FileText size={18} className="text-emerald-500" />
                    <span>Study Workflow Protocol Standard</span>
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    The 4-stage rigor protocol for synthesizing technical concepts.
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {data.note_workflow.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {i + 1}
                      </div>
                      <input
                        className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-medium text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                        value={step}
                        onChange={(e) =>
                          setData({
                            ...data,
                            note_workflow: data.note_workflow.map((v, j) =>
                              i === j ? e.target.value : v
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    disabled={busy}
                    onClick={save}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{busy ? 'Saving…' : 'Save System Settings'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--muted)]">
              Loading settings configuration…
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {confirmLogoutOpen && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setConfirmLogoutOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="learning-dialog"
          >
            <h2 id="logout-title">Sign Out of MANU OS?</h2>
            <p>
              Are you sure you want to end your active session? Any unsaved edits will be saved locally.
            </p>
            <div>
              <button onClick={() => setConfirmLogoutOpen(false)}>Cancel</button>
              <button
                onClick={() => void logout()}
                className="!bg-red-600 hover:!bg-red-700 !text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}