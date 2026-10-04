import type {
  DocumentItem,
  AuditLogItem,
  CategoryDistribution,
  MonthlyTrend,
  AcademicYearMaster,
  LamInfokomCriterion
} from './types';

export const mockAcademicYears: AcademicYearMaster[] = [
  { id: 'ay-1', year: '2026/2027', semester: 'Ganjil', label: '2026/2027 Ganjil', isActive: true },
  { id: 'ay-2', year: '2025/2026', semester: 'Genap', label: '2025/2026 Genap', isActive: false },
  { id: 'ay-3', year: '2025/2026', semester: 'Ganjil', label: '2025/2026 Ganjil', isActive: false },
  { id: 'ay-4', year: '2024/2025', semester: 'Genap', label: '2024/2025 Genap', isActive: false },
  { id: 'ay-5', year: '2024/2025', semester: 'Ganjil', label: '2024/2025 Ganjil', isActive: false }
];

export const mockLamInfokomCriteria: LamInfokomCriterion[] = [
  { code: 'C.1', title: 'C.1 - Visi, Misi, Tujuan, dan Strategi (VMTS)' },
  { code: 'C.2', title: 'C.2 - Tata Pamong, Tata Kelola, dan Kerjasama' },
  { code: 'C.3', title: 'C.3 - Mahasiswa' },
  { code: 'C.4', title: 'C.4 - Sumber Daya Manusia (SDM)' },
  { code: 'C.5', title: 'C.5 - Keuangan, Sarana, dan Prasarana' },
  { code: 'C.6', title: 'C.6 - Pendidikan (Kurikulum & Pembelajaran)' },
  { code: 'C.7', title: 'C.7 - Penelitian' },
  { code: 'C.8', title: 'C.8 - Pengabdian kepada Masyarakat (PkM)' },
  { code: 'C.9', title: 'C.9 - Luaran dan Capaian Tridharma' }
];

export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    archiveNumber: 'ARS-2026-000001',
    documentNumber: '004/TA/RPL/IX/2026',
    documentDate: '2026-09-28',
    academicYear: '2026/2027 Ganjil',
    filename: '[TA]_RPL_Implementasi_Sistem_Arsip_2026.pdf',
    fileSize: '4.2 MB',
    shaHash: 'e8f2...9a1b',
    category: 'Tugas Akhir',
    categoryTheme: {
      bg: '#e8f0fe',
      text: '#00236f',
      border: '#cce5ff'
    },
    responsibleIdentifier: 'NIP: 198501012010121001',
    uploadDate: '28 Sep 2026, 14:10',
    status: 'Aktif'
  },
  {
    id: 'doc-2',
    archiveNumber: 'ARS-2026-000002',
    documentNumber: '017/PKL/RPL/IX/2026',
    documentDate: '2026-09-28',
    academicYear: '2026/2027 Ganjil',
    filename: '[PKL]_Pedoman_Magang_RPL_2026.pdf',
    fileSize: '2.8 MB',
    shaHash: 'c4d1...33fe',
    category: 'Laporan PKL',
    categoryTheme: {
      bg: '#e1f5fe',
      text: '#006398',
      border: '#b3e5fc'
    },
    responsibleIdentifier: 'NIP: 198703152012122002',
    uploadDate: '28 Sep 2026, 11:24',
    status: 'Aktif'
  },
  {
    id: 'doc-3',
    archiveNumber: 'ARS-2026-000003',
    documentNumber: 'RPS-RPL402-2026',
    documentDate: '2026-09-27',
    academicYear: '2026/2027 Ganjil',
    filename: '[RPS]_RPL402_Rekayasa_Web_2026.pdf',
    fileSize: '1.1 MB',
    shaHash: 'bb09...81ca',
    category: 'Kurikulum & RPS',
    categoryTheme: {
      bg: '#e0f7fa',
      text: '#00476e',
      border: '#b2ebf2'
    },
    accreditationInstrument: 'LAM INFOKOM 2.1',
    accreditationCriterion: 'C.6 - Pendidikan (Kurikulum & Pembelajaran)',
    evidenceType: 'Dokumen Kebijakan & Rencana Pembelajaran Semester',
    responsibleIdentifier: 'NIP: 198501012010121001',
    uploadDate: '27 Sep 2026, 16:45',
    status: 'Aktif'
  },
  {
    id: 'doc-4',
    archiveNumber: 'ARS-2026-000004',
    documentNumber: '084/SK-FT/IX/2026',
    documentDate: '2026-09-26',
    academicYear: '2026/2027 Ganjil',
    filename: '[SK]_SK-Dekan-084-Pembimbing-TA-2026.pdf',
    fileSize: '820 KB',
    shaHash: '77a0...55da',
    category: 'SK & Surat',
    categoryTheme: {
      bg: '#e8f5e9',
      text: '#004a32',
      border: '#c8e6c9'
    },
    accreditationInstrument: 'LAM INFOKOM 2.1',
    accreditationCriterion: 'C.4 - Sumber Daya Manusia (SDM)',
    evidenceType: 'SK Penetapan Pembimbing Tugas Akhir',
    responsibleIdentifier: 'NIP: 197805122005011003',
    uploadDate: '26 Sep 2026, 09:12',
    status: 'Aktif'
  },
  {
    id: 'doc-5',
    archiveNumber: 'ARS-2026-000005',
    documentNumber: '021/PKL/RPL/IX/2026',
    documentDate: '2026-09-25',
    academicYear: '2026/2027 Ganjil',
    filename: '[DRAFT]_Laporan_Evaluasi_Magang_RPL.docx',
    fileSize: '1.9 MB',
    shaHash: '3d91...77cb',
    category: 'Laporan PKL',
    categoryTheme: {
      bg: '#e1f5fe',
      text: '#006398',
      border: '#b3e5fc'
    },
    responsibleIdentifier: 'NIP: 199002022015032003',
    uploadDate: '25 Sep 2026, 18:30',
    status: 'Draft',
    issues: 'Belum ada Abstrak & NIP Pembimbing'
  },
  {
    id: 'doc-6',
    archiveNumber: 'ARS-2026-000006',
    documentNumber: '001/AKRED/LAM-INFOKOM/2026',
    documentDate: '2026-09-24',
    academicYear: '2026/2027 Ganjil',
    filename: '[AKRED]_LED_Prodi_RPL_Instrumen_2.1.pdf',
    fileSize: '6.4 MB',
    shaHash: '4f8a...12ee',
    category: 'Dokumen Akreditasi',
    categoryTheme: {
      bg: '#fdf2f8',
      text: '#9d174d',
      border: '#fbcfe8'
    },
    accreditationInstrument: 'LAM INFOKOM 2.1',
    accreditationCriterion: 'C.1 - Visi, Misi, Tujuan, dan Strategi (VMTS)',
    evidenceType: 'Laporan Evaluasi Diri (LED)',
    responsibleIdentifier: 'NIP: 197508202000031001',
    uploadDate: '24 Sep 2026, 10:15',
    status: 'Aktif'
  }
];

export const mockCategories: CategoryDistribution[] = [
  { name: 'Tugas Akhir / Skripsi', count: 1240, percentage: 35.6, color: '#00236f' },
  { name: 'Laporan PKL & Magang', count: 890, percentage: 25.5, color: '#006398' },
  { name: 'Kurikulum & RPS', count: 430, percentage: 12.3, color: '#5bb8fe' },
  { name: 'SK & Surat Keputusan', count: 380, percentage: 10.9, color: '#004a32' },
  { name: 'Berita Acara & Nilai', count: 320, percentage: 9.2, color: '#68dba9' },
  { name: 'Dokumen Akreditasi', count: 222, percentage: 6.5, color: '#d8e3fb' },
];

export const mockMonthlyTrends: MonthlyTrend[] = [
  { month: 'Oktober 2025', shortLabel: 'Okt', value: 180, percentage: 36, type: 'normal' },
  { month: 'November 2025', shortLabel: 'Nov', value: 140, percentage: 28, type: 'normal' },
  { month: 'Desember 2025', shortLabel: 'Des', value: 220, percentage: 44, type: 'normal' },
  { month: 'Januari 2026', shortLabel: 'Jan', value: 290, percentage: 58, type: 'normal', badgeNote: 'UAS Ganjil' },
  { month: 'Februari 2026', shortLabel: 'Feb', value: 110, percentage: 22, type: 'normal' },
  { month: 'Maret 2026', shortLabel: 'Mar', value: 160, percentage: 32, type: 'normal' },
  { month: 'April 2026', shortLabel: 'Apr', value: 190, percentage: 38, type: 'normal' },
  { month: 'Mei 2026', shortLabel: 'Mei', value: 230, percentage: 46, type: 'normal' },
  { month: 'Juni 2026', shortLabel: 'Jun', value: 310, percentage: 62, type: 'normal' },
  { month: 'Juli 2026', shortLabel: 'Jul', value: 412, percentage: 82, type: 'sidang-puncak', badgeNote: 'Sidang Gel. 1' },
  { month: 'Agustus 2026', shortLabel: 'Agu', value: 520, percentage: 100, type: 'sidang-puncak', badgeNote: 'Puncak Sidang / Yudisium' },
  { month: 'September 2026', shortLabel: 'Sep*', value: 148, percentage: 30, type: 'aktif', badgeNote: 'Aktif Berjalan' },
];

export const mockAuditLogs: AuditLogItem[] = [
  {
    id: 'audit-1',
    title: 'Unggah Dokumen Massal',
    timeAgo: '10 mnt lalu',
    description: 'Bu Ratna Indah mengunggah 3 dokumen baru kategori Tugas Akhir (Batch #TA-26-09).',
    highlightText: 'Bu Ratna Indah',
    badge: { label: 'IP: 192.168.10.42 • Tervalidasi SHA', type: 'success' },
    accentColor: '#00236f'
  },
  {
    id: 'audit-2',
    title: 'Pengunduhan Berkas Resmi',
    timeAgo: '35 mnt lalu',
    description: 'Pak Dimas, M.T. mengunduh arsip SK-Dekan-084-Pembimbing-TA-2026.pdf.',
    highlightText: 'Pak Dimas, M.T.',
    badge: { label: 'Akun Dosen RPL', type: 'info' },
    accentColor: '#006398'
  },
  {
    id: 'audit-3',
    title: 'Pembaruan Metadata',
    timeAgo: '2 jam lalu',
    description: 'Bu Sinta memperbarui CPL & CPMK pada berkas RPS Rekayasa Web (Revisi 2.1).',
    highlightText: 'Bu Sinta',
    accentColor: '#5bb8fe'
  },
  {
    id: 'audit-4',
    title: 'Cron Job: Auto Cleanup',
    timeAgo: '04:00 WIB',
    description: 'Pembersihan berkas temporary cache dan session unggahan kadaluarsa berhasil dijalankan. Membebaskan 1.4 GB ruang cloud.',
    badge: { label: 'SISTEM DAEMON', type: 'system' },
    accentColor: '#004a32'
  }
];
