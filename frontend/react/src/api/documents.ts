import { apiClient, API_BASE_URL } from './client';
import type { DocumentItem } from '../types';

export interface BackendDocument {
  id: number;
  archive_number: string;
  document_number: string;
  document_date: string;
  academic_year: string;
  title: string;
  category: string;
  nip?: string;
  status: 'Aktif' | 'Draft' | 'Tertunda';
  accreditation_instrument?: string;
  accreditation_criterion?: string;
  evidence_type?: string;
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  mime_type?: string;
  sha256_hash: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function getCategoryTheme(category: string): { bg: string; text: string; border?: string } {
  switch (category) {
    case 'Tugas Akhir':
      return { bg: '#e8f0fe', text: '#00236f', border: '#cce5ff' };
    case 'Laporan PKL':
      return { bg: '#e6f4ea', text: '#004a32', border: '#b7e1cd' };
    case 'Kurikulum & RPS':
      return { bg: '#fef7e0', text: '#5f370e', border: '#fce8b2' };
    case 'Akreditasi':
      return { bg: '#fce8e6', text: '#ba1a1a', border: '#fad2cf' };
    case 'Surat Keputusan':
      return { bg: '#f3e8fd', text: '#581c87', border: '#e9d5ff' };
    case 'Sertifikat & Prestasi':
      return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
    default:
      return { bg: '#f1f5f9', text: '#334155', border: '#e2e8f0' };
  }
}

export function mapBackendDocToItem(doc: BackendDocument): DocumentItem {
  const shortSha = doc.sha256_hash
    ? `${doc.sha256_hash.slice(0, 4)}...${doc.sha256_hash.slice(-4)}`
    : 'tidak ada hash';

  return {
    id: String(doc.id),
    archiveNumber: doc.archive_number,
    documentNumber: doc.document_number,
    documentDate: doc.document_date,
    academicYear: doc.academic_year,
    previewUrl: `${API_BASE_URL}/documents/${doc.id}/view`,
    downloadUrl: `${API_BASE_URL}/documents/${doc.id}/download`,
    accreditationInstrument: doc.accreditation_instrument,
    accreditationCriterion: doc.accreditation_criterion,
    evidenceType: doc.evidence_type,
    filename: doc.file_name || doc.title,
    fileSize: formatBytes(doc.file_size_bytes),
    shaHash: shortSha,
    fullShaHash: doc.sha256_hash,
    category: doc.category,
    categoryTheme: getCategoryTheme(doc.category),
    responsibleIdentifier: doc.nip ? `NIP: ${doc.nip}` : 'Unit Jurusan RPL',
    uploadDate: formatDateTime(doc.created_at),
    status: doc.status || 'Aktif'
  };
}

export interface DocumentFilterParams {
  query?: string;
  category?: string;
  academic_year?: string;
  status?: string;
  criterion?: string;
}

export async function fetchDocuments(params?: DocumentFilterParams): Promise<DocumentItem[]> {
  const res = await apiClient<BackendDocument[]>('/documents', { params });
  return (res || []).map(mapBackendDocToItem);
}

export async function fetchTrashDocuments(): Promise<DocumentItem[]> {
  const res = await apiClient<BackendDocument[]>('/documents/trash');
  return (res || []).map(mapBackendDocToItem);
}

export async function getDocument(id: number | string): Promise<BackendDocument> {
  return apiClient<BackendDocument>(`/documents/${id}`);
}

export async function uploadDocument(formData: FormData): Promise<{
  id: number;
  archive_number: string;
  document_number: string;
  title: string;
  category: string;
  sha256_hash: string;
  status: string;
}> {
  return apiClient('/documents/upload', {
    method: 'POST',
    body: formData
  });
}

export async function updateDocument(
  id: number | string,
  data: Partial<BackendDocument>
): Promise<{ message: string; id: number }> {
  return apiClient(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function softDeleteDocument(id: number | string): Promise<{ message: string; id: number }> {
  return apiClient(`/documents/${id}`, {
    method: 'DELETE'
  });
}

export async function permanentDeleteDocument(id: number | string): Promise<{ message: string; id: number }> {
  return apiClient(`/documents/${id}/permanent`, {
    method: 'DELETE'
  });
}

export async function restoreDocument(id: number | string): Promise<{ message: string; id: number }> {
  return apiClient(`/documents/${id}/restore`, {
    method: 'POST'
  });
}

export function getDocumentDownloadUrl(id: number | string): string {
  return `${API_BASE_URL}/documents/${id}/download`;
}

export function getDocumentPreviewUrl(id: number | string): string {
  return `${API_BASE_URL}/documents/${id}/view`;
}
