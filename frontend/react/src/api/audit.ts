import { apiClient } from './client';
import type { AuditLogItem } from '../types';

export interface BackendAuditLog {
  id: number;
  action: 'UPLOAD' | 'DOWNLOAD' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'PERMANENT_DELETE' | string;
  entity_type: string;
  entity_id?: number | null;
  detail?: string;
  actor_nip?: string;
  actor_name?: string;
  ip_address?: string;
  created_at: string;
}

export function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec} detik lalu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDays = Math.floor(diffHour / 24);
    return `${diffDays} hari lalu`;
  } catch {
    return 'beberapa saat lalu';
  }
}

export function mapBackendAuditToItem(log: BackendAuditLog): AuditLogItem {
  let title = 'Aktivitas Sistem';
  let accentColor = '#00236f';
  let badgeLabel = 'SISTEM';
  let badgeType: 'neutral' | 'success' | 'system' | 'info' = 'neutral';

  switch (log.action) {
    case 'UPLOAD':
      title = 'Dokumen Baru Diunggah';
      accentColor = '#006398';
      badgeLabel = 'UPLOAD';
      badgeType = 'info';
      break;
    case 'DOWNLOAD':
      title = 'Pengunduhan Berkas';
      accentColor = '#004a32';
      badgeLabel = 'UNDUH';
      badgeType = 'success';
      break;
    case 'UPDATE':
      title = 'Pembaruan Metadata';
      accentColor = '#5f370e';
      badgeLabel = 'UPDATE';
      badgeType = 'info';
      break;
    case 'DELETE':
      title = 'Pemindahan ke Tempat Sampah';
      accentColor = '#ba1a1a';
      badgeLabel = 'SAMPAH';
      badgeType = 'neutral';
      break;
    case 'RESTORE':
      title = 'Pemulihan Dokumen';
      accentColor = '#006c4c';
      badgeLabel = 'PULIH';
      badgeType = 'success';
      break;
    case 'PERMANENT_DELETE':
      title = 'Penghapusan Permanen';
      accentColor = '#93000a';
      badgeLabel = 'HAPUS';
      badgeType = 'neutral';
      break;
  }

  const actor = log.actor_nip ? `NIP: ${log.actor_nip}` : log.actor_name || 'Admin Sistem';

  return {
    id: String(log.id),
    title,
    timeAgo: formatTimeAgo(log.created_at),
    description: log.detail || `Aksi ${log.action} dilakukan oleh ${actor}`,
    accentColor,
    badge: {
      label: badgeLabel,
      type: badgeType
    }
  };
}

export interface AuditFilterParams {
  action?: string;
  actor_nip?: string;
  from?: string;
  to?: string;
}

export async function fetchAuditLogs(params?: AuditFilterParams): Promise<AuditLogItem[]> {
  const logs = await apiClient<BackendAuditLog[]>('/audit-logs', { params });
  return (logs || []).map(mapBackendAuditToItem);
}
