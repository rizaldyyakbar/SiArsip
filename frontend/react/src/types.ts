export interface DocumentItem {
  id: string;
  filename: string;
  fileSize: string;
  shaHash: string;
  category: string;
  categoryTheme: {
    bg: string;
    text: string;
    border?: string;
  };
  relatedName: string;
  relatedRoleOrNim: string;
  uploadDate: string;
  status: 'Aktif' | 'Draft' | 'Tertunda';
  issues?: string;
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
