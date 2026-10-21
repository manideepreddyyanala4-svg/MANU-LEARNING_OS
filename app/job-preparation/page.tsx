'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  FileCheck2,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  Pencil,
  Check,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  X,
  Upload,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Page, Card, Empty } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { requireUser } from '@/lib/learning';

type Company = { id: string; name: string; website: string | null };
type Application = {
  id: string;
  role: string;
  status: string;
  location: string;
  company_id: string | null;
  created_at?: string;
};
type Resume = {
  id: string;
  original_filename: string;
  storage_path: string;
  version_label: string;
  is_current: boolean;
  created_at: string;
};
type Category = { id: string; name: string };
type InterviewNote = {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  created_at: string;
};
type JobFile = {
  id: string;
  original_filename: string;
  storage_path: string;
  application_id: string | null;
  created_at: string;
};

const statuses = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const;

type StatusType = (typeof statuses)[number];

const statusStyles: Record<StatusType, { bg: string; text: string; border: string }> = {
  saved: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
  applied: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  screening: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  interview: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  offer: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400 font-bold', border: 'border-emerald-500/20' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  withdrawn: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20' },
};

export default function JobPreparation() {
  const [activeTab, setActiveTab] = useState<
    'applications' | 'companies' | 'resumes' | 'interview' | 'files'
  >('applications');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<InterviewNote[]>([]);
  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Modal Dialogs state
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [appRole, setAppRole] = useState('');
  const [appCompanyId, setAppCompanyId] = useState('');
  const [appLocation, setAppLocation] = useState('');
  const [appStatus, setAppStatus] = useState<StatusType>('saved');

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeVersion, setResumeVersion] = useState('v1.0');

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategoryId, setNoteCategoryId] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({ open: false, title: '', description: '', onConfirm: async () => {} });

  async function load() {
    const c = createClient();
    if (!c) return;
    try {
      const [co, ap, re, ca, no, jf] = await Promise.all([
        c.from('companies').select('id,name,website').order('name'),
        c
          .from('applications')
          .select('id,role,status,location,company_id,created_at')
          .order('created_at', { ascending: false }),
        c.from('resumes').select('*').order('created_at', { ascending: false }),
        c.from('interview_categories').select('id,name').order('created_at'),
        c
          .from('interview_notes')
          .select('id,title,content,category_id,created_at')
          .order('created_at', { ascending: false }),
        c.from('job_files').select('*').order('created_at', { ascending: false }),
      ]);
      const bad = [co, ap, re, ca, no, jf].find((x) => x.error);
      if (bad?.error) throw bad.error;
      setCompanies((co.data ?? []) as Company[]);
      setApps((ap.data ?? []) as Application[]);
      setResumes((re.data ?? []) as Resume[]);
      setCategories((ca.data ?? []) as Category[]);
      setNotes((no.data ?? []) as InterviewNote[]);
      setJobFiles((jf.data ?? []) as JobFile[]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error loading career data');
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      load();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Applications CRUD
  async function saveApplication() {
    if (!appRole.trim() || busy) return;
    setBusy(true);
    try {
      const c = createClient();
      const u = await requireUser();
      if (editingApp) {
        const { error } = await c!
          .from('applications')
          .update({
            role: appRole.trim(),
            company_id: appCompanyId || null,
            location: appLocation.trim(),
            status: appStatus,
          })
          .eq('id', editingApp.id);
        if (error) throw error;
      } else {
        const { error } = await c!.from('applications').insert({
          user_id: u.id,
          role: appRole.trim(),
          company_id: appCompanyId || null,
          location: appLocation.trim(),
          status: appStatus,
        });
        if (error) throw error;
      }
      setAppModalOpen(false);
      setEditingApp(null);
      setAppRole('');
      setAppCompanyId('');
      setAppLocation('');
      setAppStatus('saved');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save application');
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(a: Application, value: string) {
    const c = createClient();
    const { error } = await c!
      .from('applications')
      .update({ status: value })
      .eq('id', a.id);
    if (error) setMessage(error.message);
    else await load();
  }

  function confirmDeleteApp(a: Application) {
    const compName = companies.find((c) => c.id === a.company_id)?.name;
    setDeleteDialog({
      open: true,
      title: `Delete Application: ${a.role}`,
      description: `Are you sure you want to remove this application${compName ? ` for ${compName}` : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        const c = createClient();
        const { error } = await c!.from('applications').delete().eq('id', a.id);
        if (error) setMessage(error.message);
        else await load();
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  // Companies CRUD
  async function saveCompany() {
    if (!companyName.trim() || busy) return;
    setBusy(true);
    try {
      const c = createClient();
      const u = await requireUser();
      const { error } = await c!.from('companies').insert({
        user_id: u.id,
        name: companyName.trim(),
        website: companyWebsite.trim() || null,
      });
      if (error) throw error;
      setCompanyName('');
      setCompanyWebsite('');
      setCompanyModalOpen(false);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save company');
    } finally {
      setBusy(false);
    }
  }

  function confirmDeleteCompany(comp: Company) {
    const linkedCount = apps.filter((a) => a.company_id === comp.id).length;
    setDeleteDialog({
      open: true,
      title: `Delete Company: ${comp.name}`,
      description: linkedCount
        ? `Warning: This company has ${linkedCount} linked application(s). Deleting it will unlink those applications.`
        : `Are you sure you want to delete ${comp.name}?`,
      onConfirm: async () => {
        const c = createClient();
        const { error } = await c!.from('companies').delete().eq('id', comp.id);
        if (error) setMessage(error.message);
        else await load();
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  // Resumes CRUD
  async function handleResumeUpload(file: File) {
    const c = createClient();
    if (!c) return;
    setBusy(true);
    try {
      const u = await requireUser();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${u.id}/${crypto.randomUUID()}-${safeName}`;
      const up = await c.storage.from('manu-resumes').upload(path, file);
      if (up.error) throw up.error;

      // Reset existing currents
      await c
        .from('resumes')
        .update({ is_current: false })
        .eq('user_id', u.id);

      const { error } = await c.from('resumes').insert({
        user_id: u.id,
        original_filename: file.name,
        storage_path: path,
        version_label: resumeVersion.trim() || 'v1.0',
        is_current: true,
      });
      if (error) throw error;
      setResumeModalOpen(false);
      setResumeVersion('v1.0');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Resume upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function setResumeCurrent(r: Resume) {
    const c = createClient();
    const u = await requireUser();
    await c!.from('resumes').update({ is_current: false }).eq('user_id', u.id);
    await c!.from('resumes').update({ is_current: true }).eq('id', r.id);
    await load();
  }

  async function downloadResume(r: Resume) {
    const c = createClient();
    if (!c) return;
    const { data } = await c.storage
      .from('manu-resumes')
      .createSignedUrl(r.storage_path, 300, { download: r.original_filename });
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  function confirmDeleteResume(r: Resume) {
    setDeleteDialog({
      open: true,
      title: `Delete Resume: ${r.version_label}`,
      description: `Permanently delete ${r.original_filename}?`,
      onConfirm: async () => {
        const c = createClient();
        await c!.storage.from('manu-resumes').remove([r.storage_path]);
        await c!.from('resumes').delete().eq('id', r.id);
        await load();
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  // Interview Notes CRUD
  async function saveNote() {
    if (!noteTitle.trim() || busy) return;
    setBusy(true);
    try {
      const c = createClient();
      const u = await requireUser();
      const { error } = await c!.from('interview_notes').insert({
        user_id: u.id,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category_id: noteCategoryId || null,
      });
      if (error) throw error;
      setNoteModalOpen(false);
      setNoteTitle('');
      setNoteContent('');
      setNoteCategoryId('');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save note');
    } finally {
      setBusy(false);
    }
  }

  function confirmDeleteNote(n: InterviewNote) {
    setDeleteDialog({
      open: true,
      title: `Delete Note: ${n.title}`,
      description: 'Are you sure you want to remove this interview study note?',
      onConfirm: async () => {
        const c = createClient();
        await c!.from('interview_notes').delete().eq('id', n.id);
        await load();
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  // Job Files Upload
  async function handleJobFileUpload(file: File) {
    const c = createClient();
    if (!c) return;
    try {
      const u = await requireUser();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${u.id}/${crypto.randomUUID()}-${safe}`;
      const up = await c.storage.from('manu-job-files').upload(path, file);
      if (up.error) throw up.error;
      const { error } = await c.from('job_files').insert({
        user_id: u.id,
        original_filename: file.name,
        storage_path: path,
        application_id: null,
      });
      if (error) throw error;
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Job file upload failed');
    }
  }

  async function downloadJobFile(f: JobFile) {
    const c = createClient();
    if (!c) return;
    const { data } = await c.storage
      .from('manu-job-files')
      .createSignedUrl(f.storage_path, 300, { download: f.original_filename });
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  function confirmDeleteJobFile(f: JobFile) {
    setDeleteDialog({
      open: true,
      title: `Delete File: ${f.original_filename}`,
      description: 'Permanently remove this file from job storage?',
      onConfirm: async () => {
        const c = createClient();
        await c!.storage.from('manu-job-files').remove([f.storage_path]);
        await c!.from('job_files').delete().eq('id', f.id);
        await load();
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  // Computed Filters
  const filteredApps = useMemo(() => {
    return apps.filter((a) => {
      const matchesSearch =
        !searchQuery.trim() ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companies.find((c) => c.id === a.company_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [apps, companies, searchQuery, statusFilter]);

  const activePipelineCount = apps.filter(
    (a) => a.status === 'applied' || a.status === 'screening' || a.status === 'interview'
  ).length;

  const currentResume = resumes.find((r) => r.is_current) ?? resumes[0];

  return (
    <Page
      eyebrow="Career Execution"
      title="Job Preparation Workspace"
      subtitle="Structured pipeline to track applications, target companies, resume versions, and interview technical notes."
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'applications' && (
            <button
              onClick={() => {
                setEditingApp(null);
                setAppRole('');
                setAppCompanyId('');
                setAppLocation('');
                setAppStatus('saved');
                setAppModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={14} /> Track Application
            </button>
          )}
          {activeTab === 'companies' && (
            <button
              onClick={() => {
                setCompanyName('');
                setCompanyWebsite('');
                setCompanyModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={14} /> Add Company
            </button>
          )}
          {activeTab === 'resumes' && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]">
              <Upload size={14} /> Upload New Resume
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleResumeUpload(f);
                }}
              />
            </label>
          )}
          {activeTab === 'interview' && (
            <button
              onClick={() => {
                setNoteTitle('');
                setNoteContent('');
                setNoteCategoryId('');
                setNoteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={14} /> New Interview Note
            </button>
          )}
          {activeTab === 'files' && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]">
              <Upload size={14} /> Upload Job Document
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleJobFileUpload(f);
                }}
              />
            </label>
          )}
        </div>
      }
    >
      {message && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20">
          {message}
        </p>
      )}

      {/* Top Metric Strip */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tracked</span>
            <Briefcase size={16} className="text-[var(--accent)]" />
          </div>
          <p className="mt-2 text-3xl font-black text-[var(--fg)]">{apps.length}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Applications across all stages</p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-black text-indigo-600">{activePipelineCount}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Screening & Interview stages</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Offers Received</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600">{apps.filter((a) => a.status === 'offer').length}</p>
          <p className="mt-0.5 text-xs text-emerald-600/80 font-medium">Internship conversion targets</p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Current Resume</span>
            <FileText size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-[var(--fg)] truncate">
            {currentResume?.version_label ?? 'No resume'}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)] truncate">
            {currentResume?.original_filename ?? 'Upload your latest version'}
          </p>
        </div>
      </section>

      {/* Horizontal Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--line)] pb-3">
        {[
          { id: 'applications', label: 'Applications', count: apps.length, icon: Briefcase },
          { id: 'companies', label: 'Target Companies', count: companies.length, icon: Building2 },
          { id: 'resumes', label: 'Resumes', count: resumes.length, icon: FileCheck2 },
          { id: 'interview', label: 'Interview Prep', count: notes.length, icon: FileText },
          { id: 'files', label: 'Job Files', count: jobFiles.length, icon: FolderOpen },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shrink-0 ${
                active
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="mt-6 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications by role or company…"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-xs text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mr-1">Status:</span>
              {['all', ...statuses].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                    statusFilter === st
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold'
                      : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            {filteredApps.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--line)] bg-[var(--bg)]/75 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <tr>
                      <th className="py-3 px-4">Role & Company</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line-subtle)]">
                    {filteredApps.map((a) => {
                      const comp = companies.find((c) => c.id === a.company_id);
                      const style = statusStyles[a.status as StatusType] ?? statusStyles.saved;
                      return (
                        <tr key={a.id} className="transition hover:bg-black/[0.015] dark:hover:bg-white/[0.015]">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[var(--fg)] text-sm">{a.role}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--muted)]">
                              <Building2 size={12} />
                              {comp ? (
                                <span>{comp.name}</span>
                              ) : (
                                <span className="italic">No company assigned</span>
                              )}
                              {comp?.website && (
                                <a
                                  href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
                                >
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--muted)]">
                            {a.location || 'Remote / Unspecified'}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={a.status}
                              onChange={(e) => void updateStatus(a, e.target.value)}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize outline-none transition ${style.bg} ${style.text} ${style.border}`}
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--muted)]">
                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingApp(a);
                                  setAppRole(a.role);
                                  setAppCompanyId(a.company_id ?? '');
                                  setAppLocation(a.location ?? '');
                                  setAppStatus(a.status as StatusType);
                                  setAppModalOpen(true);
                                }}
                                aria-label="Edit application"
                                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => confirmDeleteApp(a)}
                                aria-label="Delete application"
                                className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                icon={<Briefcase size={20} />}
                title={searchQuery || statusFilter !== 'all' ? 'No applications match filter' : 'No applications tracked yet'}
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Try clearing your search query or switching status filters.'
                    : 'Start tracking software and computer vision internship applications.'
                }
                action={
                  <button
                    onClick={() => {
                      setEditingApp(null);
                      setAppRole('');
                      setAppCompanyId('');
                      setAppLocation('');
                      setAppStatus('saved');
                      setAppModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs"
                  >
                    <Plus size={14} /> Track Application
                  </button>
                }
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => {
              const linked = apps.filter((a) => a.company_id === c.id);
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs transition hover:border-color-mix(in srgb, var(--accent) 30%, var(--line))"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[var(--fg)] text-base">{c.name}</h4>
                      {c.website ? (
                        <a
                          href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                        >
                          {c.website.replace(/^https?:\/\//, '')} <ExternalLink size={11} />
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-[var(--muted)]">No website provided</p>
                      )}
                    </div>
                    <button
                      onClick={() => confirmDeleteCompany(c)}
                      aria-label={`Delete ${c.name}`}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{linked.length} linked role(s)</span>
                    <button
                      onClick={() => {
                        setEditingApp(null);
                        setAppRole('');
                        setAppCompanyId(c.id);
                        setAppLocation('');
                        setAppStatus('saved');
                        setActiveTab('applications');
                        setAppModalOpen(true);
                      }}
                      className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                    >
                      + Track role
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!companies.length && (
            <Empty
              icon={<Building2 size={20} />}
              title="No target companies added"
              description="Keep a directory of tech companies, labs, and startups you plan to apply to."
              action={
                <button
                  onClick={() => {
                    setCompanyName('');
                    setCompanyWebsite('');
                    setCompanyModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  <Plus size={14} /> Add Company
                </button>
              }
            />
          )}
        </div>
      )}

      {/* TAB 3: RESUMES */}
      {activeTab === 'resumes' && (
        <div className="mt-6 space-y-6">
          {currentResume && (
            <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Active Primary Resume
                  </span>
                  <h3 className="mt-2 text-xl font-extrabold text-[var(--fg)]">
                    {currentResume.version_label}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {currentResume.original_filename} · Uploaded {new Date(currentResume.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => void downloadResume(currentResume)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)] transition shrink-0"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            <div className="border-b border-[var(--line)] p-4 font-bold text-xs text-[var(--fg)]">
              All Resume Versions ({resumes.length})
            </div>
            {resumes.length ? (
              <div className="divide-y divide-[var(--line-subtle)] text-xs">
                {resumes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 transition hover:bg-black/[0.01]">
                    <div className="flex items-center gap-3">
                      <FileCheck2 size={18} className={r.is_current ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[var(--fg)]">{r.version_label}</p>
                          {r.is_current && (
                            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">
                          {r.original_filename} · {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!r.is_current && (
                        <button
                          onClick={() => void setResumeCurrent(r)}
                          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
                        >
                          Make current
                        </button>
                      )}
                      <button
                        onClick={() => void downloadResume(r)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)]"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => confirmDeleteResume(r)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                icon={<FileCheck2 size={20} />}
                title="No resumes uploaded"
                description="Upload tailored PDF versions of your resume for software & research applications."
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 4: INTERVIEW PREPARATION */}
      {activeTab === 'interview' && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((n) => {
              const cat = categories.find((c) => c.id === n.category_id);
              return (
                <div
                  key={n.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {cat && (
                        <span className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                          {cat.name}
                        </span>
                      )}
                      <h4 className="mt-2 text-base font-bold text-[var(--fg)]">{n.title}</h4>
                    </div>
                    <button
                      onClick={() => confirmDeleteNote(n)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
                    {n.content}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[var(--line)] text-[11px] text-[var(--muted)]">
                    Created {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>

          {!notes.length && (
            <Empty
              icon={<FileText size={20} />}
              title="No interview notes"
              description="Keep quick notes on algorithmic intuition, behavioral stories, and system design points."
              action={
                <button
                  onClick={() => {
                    setNoteTitle('');
                    setNoteContent('');
                    setNoteCategoryId('');
                    setNoteModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  <Plus size={14} /> Create Interview Note
                </button>
              }
            />
          )}
        </div>
      )}

      {/* TAB 5: JOB FILES */}
      {activeTab === 'files' && (
        <div className="mt-6 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            <div className="border-b border-[var(--line)] p-4 font-bold text-xs text-[var(--fg)]">
              Attached Job Documents ({jobFiles.length})
            </div>
            {jobFiles.length ? (
              <div className="divide-y divide-[var(--line-subtle)] text-xs">
                {jobFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FolderOpen size={18} className="text-[var(--accent)]" />
                      <div>
                        <p className="font-bold text-[var(--fg)]">{f.original_filename}</p>
                        <p className="text-[11px] text-[var(--muted)]">
                          Uploaded {new Date(f.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void downloadJobFile(f)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--fg)]"
                      >
                        <Download size={13} /> Download
                      </button>
                      <button
                        onClick={() => confirmDeleteJobFile(f)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                icon={<FolderOpen size={20} />}
                title="No job files uploaded"
                description="Store offer letters, technical take-home assignments, and transcripts."
              />
            )}
          </div>
        </div>
      )}

      {/* MODAL DIALOGS */}

      {/* Application Creation / Edit Modal */}
      {appModalOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setAppModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingApp ? 'Edit Application' : 'Track New Application'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <h3 className="text-base font-extrabold text-[var(--fg)]">
                {editingApp ? 'Edit Application' : 'Track New Application'}
              </h3>
              <button
                onClick={() => setAppModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveApplication();
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">
                  Target Role Title *
                </label>
                <input
                  required
                  autoFocus
                  value={appRole}
                  onChange={(e) => setAppRole(e.target.value)}
                  placeholder="e.g. Computer Vision Intern"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">Company</label>
                <select
                  value={appCompanyId}
                  onChange={(e) => setAppCompanyId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="">No company assigned</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--fg)] mb-1">Status</label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as StatusType)}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] capitalize outline-none focus:border-[var(--accent)]"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[var(--fg)] mb-1">Location</label>
                  <input
                    value={appLocation}
                    onChange={(e) => setAppLocation(e.target.value)}
                    placeholder="e.g. San Francisco / Remote"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setAppModalOpen(false)}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!appRole.trim() || busy}
                  className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {busy ? 'Saving…' : editingApp ? 'Update Application' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {companyModalOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setCompanyModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add Target Company"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <h3 className="text-base font-extrabold text-[var(--fg)]">Add Target Company</h3>
              <button
                onClick={() => setCompanyModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveCompany();
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">Company Name *</label>
                <input
                  required
                  autoFocus
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. OpenAI, DeepMind, NVIDIA"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">Company Website</label>
                <input
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="e.g. https://deepmind.google"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!companyName.trim() || busy}
                  className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Note Modal */}
      {noteModalOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setNoteModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create Interview Note"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <h3 className="text-base font-extrabold text-[var(--fg)]">Create Interview Note</h3>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveNote();
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">Title *</label>
                <input
                  required
                  autoFocus
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Convolution Arithmetic & Receptive Field"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">Technical Notes Content</label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record core formula, key interview question points, trade-offs, and examples…"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!noteTitle.trim() || busy}
                  className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialog.open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Deletion"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-base font-extrabold text-[var(--fg)]">Confirm Deletion</h3>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
              {deleteDialog.description}
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
                className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={() => void deleteDialog.onConfirm()}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
