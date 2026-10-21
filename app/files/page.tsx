'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Download,
  File as FileIcon,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  HardDrive,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UploadCloud,
  X,
  Layers,
} from 'lucide-react';
import { Page, Card, Empty } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { requireUser } from '@/lib/learning';

type FolderItem = { id: string; name: string; parent_id: string | null };
type StoredFile = {
  id: string;
  original_filename: string;
  storage_path: string;
  folder_id: string | null;
  mime_type: string;
  created_at?: string;
  size_bytes?: number;
};

const BUCKET = 'manu-files';

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string, filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (mime.includes('pdf') || ext === 'pdf') {
    return <FileText className="text-red-500 shrink-0" size={16} />;
  }
  if (mime.includes('image') || ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) {
    return <FileImage className="text-emerald-500 shrink-0" size={16} />;
  }
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'json', 'sql', 'sh', 'css', 'html'].includes(ext || '')) {
    return <FileCode className="text-blue-500 shrink-0" size={16} />;
  }
  if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
    return <FileSpreadsheet className="text-teal-600 shrink-0" size={16} />;
  }
  return <FileIcon className="text-[var(--muted)] shrink-0" size={16} />;
}

export default function FilesPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Modals
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null);
  const [editingFile, setEditingFile] = useState<StoredFile | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const c = createClient();
    if (!c) return;
    try {
      const [f, g] = await Promise.all([
        c.from('file_folders').select('id,name,parent_id').order('name'),
        c.from('files').select('*').order('created_at', { ascending: false }),
      ]);
      if (f.error || g.error) throw f.error ?? g.error;
      setFolders((f.data ?? []) as FolderItem[]);
      setFiles((g.data ?? []) as StoredFile[]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to load storage files');
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      load().catch((e) => setMessage(e.message));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function addFolder() {
    if (!newFolderName.trim()) return;
    try {
      const c = createClient();
      const u = await requireUser();
      const { error } = await c!.from('file_folders').insert({
        user_id: u.id,
        name: newFolderName.trim(),
        parent_id: selectedFolder,
      });
      if (error) throw error;
      setNewFolderName('');
      setFolderModalOpen(false);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to create folder');
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage('');
    try {
      const c = createClient();
      const u = await requireUser();
      const path = `${u.id}/${crypto.randomUUID()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      )}`;
      const up = await c!.storage.from(BUCKET).upload(path, file);
      if (up.error) throw up.error;
      const row = await c!.from('files').insert({
        user_id: u.id,
        folder_id: selectedFolder,
        storage_path: path,
        original_filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
      });
      if (row.error) {
        await c!.storage.from(BUCKET).remove([path]);
        throw row.error;
      }
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function confirmDeleteFile() {
    if (!fileToDelete) return;
    try {
      const c = createClient();
      if (!c) return;
      await c.storage.from(BUCKET).remove([fileToDelete.storage_path]);
      const { error } = await c.from('files').delete().eq('id', fileToDelete.id);
      if (error) throw error;
      setFileToDelete(null);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  async function saveRename() {
    if (!editingFile) return;
    const value = editFileName.trim();
    if (!value) return;
    const c = createClient();
    if (!c) return;
    const { error } = await c
      .from('files')
      .update({ original_filename: value })
      .eq('id', editingFile.id);
    if (error) setMessage(error.message);
    else {
      setEditingFile(null);
      await load();
    }
  }

  async function move(file: StoredFile, target: string) {
    const c = createClient();
    if (!c) return;
    const { error } = await c
      .from('files')
      .update({ folder_id: target || null })
      .eq('id', file.id);
    if (error) setMessage(error.message);
    else await load();
  }

  async function download(file: StoredFile) {
    const c = createClient();
    if (!c) return;
    const { data, error } = await c.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_path, 300, { download: file.original_filename });
    if (error) setMessage(error.message);
    else if (data) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  // Filtered files
  const visible = useMemo(() => {
    return files.filter((x) => {
      if (selectedFolder && x.folder_id !== selectedFolder) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!x.original_filename.toLowerCase().includes(query)) return false;
      }
      if (typeFilter !== 'all') {
        const ext = x.original_filename.split('.').pop()?.toLowerCase();
        if (typeFilter === 'pdf' && !x.mime_type.includes('pdf') && ext !== 'pdf') return false;
        if (typeFilter === 'image' && !x.mime_type.includes('image') && !['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) return false;
        if (typeFilter === 'code' && !['ts', 'tsx', 'js', 'jsx', 'py', 'json', 'sql', 'sh', 'css', 'html'].includes(ext || '')) return false;
        if (typeFilter === 'doc' && !['doc', 'docx', 'txt', 'md'].includes(ext || '')) return false;
      }
      return true;
    });
  }, [files, selectedFolder, searchQuery, typeFilter]);

  // Aggregate stats
  const totalSizeBytes = useMemo(() => files.reduce((acc, f) => acc + (f.size_bytes || 0), 0), [files]);
  const activeFolderName = selectedFolder ? folders.find((f) => f.id === selectedFolder)?.name ?? 'Folder' : 'All files';

  return (
    <Page
      eyebrow="Storage & Documents"
      title="File Manager"
      subtitle="Encrypted storage for technical papers, assignments, and resume versions."
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setNewFolderName('');
              setFolderModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] shadow-2xs hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition"
          >
            <FolderPlus size={14} />
            <span>New folder</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)] transition disabled:opacity-50"
          >
            <Upload size={14} />
            <span>{uploading ? 'Uploading…' : 'Upload file'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = '';
            }}
          />
        </div>
      }
    >
      {message && (
        <div role="alert" className="mb-6 flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="p-1 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      {/* Workspace Storage Telemetry Strip */}
      <section className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Documents</span>
            <FileText size={16} className="text-[var(--accent)]" />
          </div>
          <p className="mt-3 text-2xl font-black text-[var(--fg)]">{files.length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Across all project directories</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Storage Consumed</span>
            <HardDrive size={16} className="text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-[var(--fg)]">{formatFileSize(totalSizeBytes)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Encrypted Supabase private storage</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Folders Created</span>
            <Folder size={16} className="text-indigo-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-[var(--fg)]">{folders.length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Hierarchical categories</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Storage Security</span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <p className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">Private Bucket RLS</p>
          <p className="mt-1 text-xs text-[var(--muted)]">User-isolated AES-256 access</p>
        </Card>
      </section>

      {/* Main Workspace Layout: Folders Rail & Files Table */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Navigation: Folder Directory */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Directories
              </span>
              <button
                onClick={() => {
                  setNewFolderName('');
                  setFolderModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
              >
                <Plus size={12} /> New
              </button>
            </div>

            <nav className="mt-3 space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  selectedFolder === null
                    ? 'bg-[var(--accent)] text-white shadow-2xs'
                    : 'text-[var(--fg)] hover:bg-[var(--accent-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder size={15} className={selectedFolder === null ? 'text-white' : 'text-[var(--accent)]'} />
                  <span className="truncate">All Files</span>
                </div>
                <span className={`text-[11px] ${selectedFolder === null ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                  {files.length}
                </span>
              </button>

              {folders.map((f) => {
                const count = files.filter((x) => x.folder_id === f.id).length;
                const isSelected = selectedFolder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolder(f.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                        : 'text-[var(--fg)] hover:bg-[var(--accent-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isSelected ? (
                        <FolderOpen size={15} className="text-white" />
                      ) : (
                        <Folder size={15} className="text-[var(--muted)]" />
                      )}
                      <span className="truncate">{f.name}</span>
                    </div>
                    <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Drag & Drop Quick Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) upload(dropped);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
              isDragOver
                ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                : 'border-[var(--line)] bg-[var(--surface)] hover:border-color-mix(in srgb, var(--accent) 50%, var(--line))'
            }`}
          >
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--bg)] text-[var(--muted)] group-hover:text-[var(--accent)]">
              <UploadCloud size={20} />
            </div>
            <p className="mt-2 text-xs font-bold text-[var(--fg)]">
              {isDragOver ? 'Drop to upload' : 'Quick file upload'}
            </p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Drop file here or click to browse
            </p>
          </div>
        </aside>

        {/* Right Main Panel: File Workspace */}
        <section className="lg:col-span-9 space-y-4">
          {/* Search, Folder Filter & Type Pills */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${activeFolderName}…`}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2 pl-9 pr-4 text-xs text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            {/* Type filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'pdf', 'code', 'image', 'doc'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                    typeFilter === t
                      ? 'bg-[var(--accent)] text-white shadow-2xs'
                      : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Files Data Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            <div className="grid grid-cols-12 gap-4 border-b border-[var(--line)] bg-[var(--sidebar)] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              <div className="col-span-6 sm:col-span-5">File Name</div>
              <div className="hidden sm:block sm:col-span-2">Folder</div>
              <div className="hidden sm:block sm:col-span-2">Size</div>
              <div className="col-span-3 sm:col-span-2">Uploaded</div>
              <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-[var(--line-subtle)]">
              {visible.map((file) => {
                const folderName = folders.find((f) => f.id === file.folder_id)?.name ?? '—';
                const isEditing = editingFile?.id === file.id;

                return (
                  <div
                    key={file.id}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-3 text-xs transition hover:bg-[var(--accent-subtle)]"
                  >
                    {/* Name Column */}
                    <div className="col-span-6 sm:col-span-5 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            aria-label={`Rename ${file.original_filename}`}
                            value={editFileName}
                            onChange={(e) => setEditFileName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void saveRename();
                              if (e.key === 'Escape') setEditingFile(null);
                            }}
                            className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-xs font-semibold text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            onClick={() => void saveRename()}
                            className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingFile(null)}
                            className="text-[11px] text-[var(--muted)] hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => download(file)}
                          className="flex items-center gap-2.5 text-left font-semibold text-[var(--fg)] hover:text-[var(--accent)] truncate w-full group"
                        >
                          {getFileIcon(file.mime_type, file.original_filename)}
                          <span className="truncate group-hover:underline">{file.original_filename}</span>
                        </button>
                      )}
                    </div>

                    {/* Folder Column */}
                    <div className="hidden sm:block sm:col-span-2 text-[var(--muted)] truncate">
                      {folderName !== '—' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg)] px-2 py-0.5 text-[11px] font-medium border border-[var(--line)]">
                          <Folder size={11} /> {folderName}
                        </span>
                      ) : (
                        <span className="text-[var(--muted)] text-[11px]">Root</span>
                      )}
                    </div>

                    {/* Size Column */}
                    <div className="hidden sm:block sm:col-span-2 text-[11px] font-mono text-[var(--muted)]">
                      {formatFileSize(file.size_bytes)}
                    </div>

                    {/* Upload Date Column */}
                    <div className="col-span-3 sm:col-span-2 text-[11px] text-[var(--muted)]">
                      {file.created_at ? new Date(file.created_at).toLocaleDateString() : '—'}
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => download(file)}
                        title="Download file"
                        className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition"
                      >
                        <Download size={14} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === file.id ? null : file.id)}
                          title="More options"
                          className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-subtle)] transition"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {menuOpenId === file.id && (
                          <div className="absolute right-0 top-full mt-1 z-30 w-48 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                setEditingFile(file);
                                setEditFileName(file.original_filename);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[var(--fg)] hover:bg-[var(--accent-subtle)] transition"
                            >
                              <Pencil size={13} className="text-[var(--muted)]" /> Rename
                            </button>

                            <div className="my-1 border-t border-[var(--line)]" />

                            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                              Move to folder
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-0.5">
                              <button
                                onClick={() => {
                                  setMenuOpenId(null);
                                  void move(file, '');
                                }}
                                className={`flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-left text-xs ${
                                  !file.folder_id ? 'font-bold text-[var(--accent)]' : 'text-[var(--fg)] hover:bg-[var(--accent-subtle)]'
                                }`}
                              >
                                Root (No folder)
                              </button>
                              {folders.map((f) => (
                                <button
                                  key={f.id}
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    void move(file, f.id);
                                  }}
                                  className={`flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-left text-xs ${
                                    file.folder_id === f.id ? 'font-bold text-[var(--accent)]' : 'text-[var(--fg)] hover:bg-[var(--accent-subtle)]'
                                  }`}
                                >
                                  <Folder size={11} className="text-[var(--muted)]" />
                                  <span className="truncate">{f.name}</span>
                                </button>
                              ))}
                            </div>

                            <div className="my-1 border-t border-[var(--line)]" />

                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                setFileToDelete(file);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-500/10 transition"
                            >
                              <Trash2 size={13} /> Delete File
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {!visible.length && (
                <div className="py-16 text-center">
                  <Empty
                    title="No files found"
                    description={
                      searchQuery
                        ? `No documents matching "${searchQuery}" in this folder.`
                        : 'Upload study notes, resumes, or interview artifacts.'
                    }
                  />
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)] transition"
                    >
                      <Upload size={14} /> Upload First Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* New Folder Modal */}
      {folderModalOpen && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setFolderModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-folder-title"
            className="learning-dialog"
          >
            <h2 id="new-folder-title">Create New Folder</h2>
            <p>Group research papers, assignments, and resume versions by category.</p>
            <input
              autoFocus
              aria-label="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void addFolder()}
              placeholder="e.g. Resumes, Distributed Systems, Algorithms"
            />
            <div>
              <button onClick={() => setFolderModalOpen(false)}>Cancel</button>
              <button
                disabled={!newFolderName.trim()}
                onClick={() => void addFolder()}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete File Confirmation Modal */}
      {fileToDelete && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setFileToDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-file-title"
            className="learning-dialog"
          >
            <h2 id="delete-file-title">Delete File Permanently?</h2>
            <p>
              Are you sure you want to delete <strong className="text-[var(--fg)]">{fileToDelete.original_filename}</strong>? This action cannot be undone.
            </p>
            <div>
              <button onClick={() => setFileToDelete(null)}>Cancel</button>
              <button
                onClick={() => void confirmDeleteFile()}
                className="!bg-red-600 hover:!bg-red-700 !text-white"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}