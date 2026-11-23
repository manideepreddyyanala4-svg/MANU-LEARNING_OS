import type { SupabaseClient } from '@supabase/supabase-js';

const mimeByExtension: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  csv: 'text/csv',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};
const resumeExtensions = ['pdf', 'doc', 'docx'];
const maxDocumentSize = 20 * 1024 * 1024;

export const careerStorage = {
  resumes: { bucket: 'manu-resumes', accept: resumeExtensions.map((type) => '.' + type).join(',') },
  job_files: { bucket: 'manu-job-files', accept: Object.keys(mimeByExtension).map((type) => '.' + type).join(',') },
};
export type CareerDocumentTable = keyof typeof careerStorage;

export const evidenceStatuses = ['unreviewed', 'historical', 'verified', 'conditional', 'superseded', 'restricted'] as const;
export type EvidenceStatus = (typeof evidenceStatuses)[number];

export type CareerDocument = {
  id: string;
  original_filename: string;
  storage_path: string;
  created_at: string;
  evidence_status: EvidenceStatus;
  source_ids: string[];
  claim_ids: string[];
};

export function careerDocumentError(error: unknown) {
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The document operation failed';
}

async function inspectDocument(table: CareerDocumentTable, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = mimeByExtension[extension];
  if (!mime || !Object.hasOwn(mimeByExtension, extension) || !careerStorage[table].accept.split(',').includes('.' + extension)) {
    throw new Error('Choose a supported document type.');
  }
  if (!file.size || file.size > maxDocumentSize) {
    throw new Error('Choose a non-empty document up to 20 MB.');
  }

  const bytes = await file.arrayBuffer();
  const prefix = new Uint8Array(bytes, 0, Math.min(12, bytes.byteLength));
  const beginsWith = (...signature: number[]) => signature.every((byte, index) => prefix[index] === byte);
  switch (extension) {
    case 'pdf':
      if (!beginsWith(37, 80, 68, 70, 45)) throw new Error('The file is missing the PDF header.');
      break;
    case 'docx':
    case 'xlsx':
      if (!beginsWith(80, 75, 3, 4)) throw new Error('The file is missing the Office document header.');
      break;
    case 'doc':
      if (!beginsWith(208, 207, 17, 224, 161, 177, 26, 225)) throw new Error('The file is missing the Word document header.');
      break;
    case 'png':
      if (!beginsWith(137, 80, 78, 71, 13, 10, 26, 10)) throw new Error('The file is missing the PNG header.');
      break;
    case 'jpg':
    case 'jpeg':
      if (!beginsWith(255, 216, 255)) throw new Error('The file is missing the JPEG header.');
      break;
    case 'webp':
      if (!beginsWith(82, 73, 70, 70) || new TextDecoder().decode(prefix.slice(8)) !== 'WEBP') {
        throw new Error('The file is missing the WebP header.');
      }
      break;
  }

  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const sha256 = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { mime, sha256 };
}

export async function storeCareerDocument(
  client: SupabaseClient,
  table: CareerDocumentTable,
  ownerId: string,
  file: File,
) {
  const { mime, sha256 } = await inspectDocument(table, file);
  const matches = await Promise.all((['resumes', 'job_files'] as const).map((entry) =>
    client.from(entry).select('id').eq('user_id', ownerId).eq('document_sha256', sha256).maybeSingle(),
  ));
  for (const match of matches) {
    if (match.error) throw match.error;
    if (match.data) throw new Error('This original is already stored in Resumes or Job Documents.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const path = `${ownerId}/${crypto.randomUUID()}-${safeName}`;
  const bucket = client.storage.from(careerStorage[table].bucket);
  const uploaded = await bucket.upload(path, file, { contentType: mime, upsert: false });
  if (uploaded.error) throw uploaded.error;

  const metadata = {
    user_id: ownerId,
    original_filename: file.name,
    storage_path: path,
    document_sha256: sha256,
    size_bytes: file.size,
  };
  const inserted = await client.from(table).insert(table === 'resumes'
    ? { ...metadata, version_label: file.name.replace(/\.[^.]+$/, ''), is_current: false }
    : { ...metadata, mime_type: mime });
  if (!inserted.error) return;

  // A lost response can follow a successful insert. Keep the file if its metadata exists.
  const confirmed = await client.from(table).select('id').eq('storage_path', path).maybeSingle();
  if (confirmed.data) return;
  if (confirmed.error) throw new Error('The upload could not be confirmed. Refresh before retrying.');
  const cleanup = await bucket.remove([path]);
  if (cleanup.error) throw new Error('The record could not be saved and file cleanup failed. Contact the workspace administrator.');
  throw inserted.error;
}

export async function downloadCareerDocument(client: SupabaseClient, table: CareerDocumentTable, document: CareerDocument) {
  const { data, error } = await client.storage.from(careerStorage[table].bucket).download(document.storage_path);
  if (error) throw error;
  const downloadUrl = URL.createObjectURL(data);
  const link = window.document.createElement('a');
  link.href = downloadUrl;
  link.download = document.original_filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

export async function removeCareerDocument(client: SupabaseClient, table: CareerDocumentTable, document: CareerDocument) {
  const removed = await client.storage.from(careerStorage[table].bucket).remove([document.storage_path]);
  if (removed.error) throw removed.error;
  const { error } = await client.from(table).delete().eq('id', document.id);
  if (error) throw error;
}
