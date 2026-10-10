export interface DocumentItem {
  id: string;
  archiveNumber: string;
  documentNumber: string;
  documentDate: string;
  academicYear: string;
  previewUrl?: string;
  downloadUrl?: string;
  accreditationInstrument?: string;
  accreditationCriterion?: string;
  evidenceType?: string;
  filename: string;
  fileSize: string;
  shaHash: string;
  fullShaHash?: string;
  category: string;
  categoryTheme: {
    bg: string;
    text: string;
    border?: string;
  };
  responsibleIdentifier: string;
  uploadDate: string;
  status: 'Aktif' | 'Draft' | 'Tertunda';
  issues?: string;
}

export interface AcademicYearMaster {
  id: string;
  year: string;
  semester: 'Ganjil' | 'Genap';
  label: string;
  isActive: boolean;
}

export interface LamInfokomCriterion {
  code: string;
  title: string;
}

export interface AuditLogItem {
  id: string;
  title: string;
  timeAgo: string;
  description: string;
  highlightText?: string;
  badge?: {
    label: string;
    type: 'neutral' | 'success' | 'system' | 'info';
  };
  accentColor: string;
}

export interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  shortLabel: string;
  value: number;
  percentage: number;
  type: 'sidang-puncak' | 'normal' | 'aktif';
  badgeNote?: string;
}

export interface Lecturer {
  id: number;
  nip: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  isActive: boolean;
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  code: string;
  description: string;
  colorBg: string;
  colorText: string;
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'kaprodi' | 'dosen' | 'staf_prodi';

export interface UserAccount {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  nip?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNo: number;
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType?: string;
  sha256Hash: string;
  note?: string;
  uploadedBy?: string;
  uploadedAt: string;
}


