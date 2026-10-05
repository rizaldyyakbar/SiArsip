import { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  AlertTriangle,
  FolderArchive,
  Check,
  Trash2,
  Filter,
  RotateCcw,
  FileText
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KPISection } from './components/KPISection';
import { DataVisualizationSection } from './components/DataVisualizationSection';
import { RecentDocumentsTable } from './components/RecentDocumentsTable';
import { AuditActivityPanel } from './components/AuditActivityPanel';
import { ConflictModal } from './components/ConflictModal';
import { UploadModal } from './components/UploadModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { AddAcademicYearModal } from './components/AddAcademicYearModal';
import { useSiArsipData } from './hooks/useSiArsipData';
import type { DocumentItem } from './types';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & UI states
  const [isConflictAlertVisible, setIsConflictAlertVisible] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddAYModalOpen, setIsAddAYModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Filters for Daftar Arsip
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('Semua');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('Semua');

  // Live data hook (connects to Go backend with PostgreSQL or falls back to demo data)
  const {
    isBackendOnline,
    documents,
    trashDocuments,
    academicYears,
    criteria,
    auditLogs,
    conflictInfo,
    setConflictInfo,
    loadData,
    handleUpload,
    handleDeleteDoc,
    handleRestoreDoc,
    handlePermanentDeleteDoc,
    handleAddAcademicYear,
    handleToggleAcademicYear,
    handleDeleteAcademicYear
  } = useSiArsipData();

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Filter documents by search, category, and academic year
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          d.filename.toLowerCase().includes(q) ||
          d.responsibleIdentifier.toLowerCase().includes(q) ||
          d.documentNumber.toLowerCase().includes(q) ||
          d.academicYear.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          (d.accreditationCriterion && d.accreditationCriterion.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Category filter
      if (categoryFilter !== 'Semua' && d.category !== categoryFilter) {
        return false;
      }

      // Academic Year filter
      if (academicYearFilter !== 'Semua' && d.academicYear !== academicYearFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, categoryFilter, academicYearFilter]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    if (auditActionFilter === 'Semua') return auditLogs;
    return auditLogs.filter((log) => log.badge?.label === auditActionFilter);
  }, [auditLogs, auditActionFilter]);

  useEffect(() => {
    if (conflictInfo) {
      setIsConflictAlertVisible(true);
    }
  }, [conflictInfo]);

  const handleResolveConflict = (action: string) => {
    setIsConflictModalOpen(false);
    setConflictInfo(null);
    setIsConflictAlertVisible(false);
    showToast(`Konflik hash berhasil diselesaikan (${action})`);
  };

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    showToast(`Dokumen "${newDoc.filename}" berhasil diunggah & terindeks!`);
  };

  const handleSoftDelete = async (doc: DocumentItem) => {
    if (!window.confirm(`Pindahkan berkas "${doc.filename}" ke tempat sampah?`)) return;
    const ok = await handleDeleteDoc(doc.id);
    if (ok) {
      showToast(`Berkas "${doc.filename}" dipindahkan ke Tempat Sampah.`);
    } else {
      alert('Gagal memindahkan berkas ke tempat sampah.');
    }
  };

  const handleRestore = async (doc: DocumentItem) => {
    const ok = await handleRestoreDoc(doc.id);
    if (ok) {
      showToast(`Berkas "${doc.filename}" berhasil dipulihkan!`);
    } else {
      alert('Gagal memulihkan berkas.');
    }
  };

  const handlePermanentDelete = async (doc: DocumentItem) => {
    if (
      !window.confirm(
        `HAPUS PERMANEN berkas "${doc.filename}"?\n\nTindakan ini tidak dapat dibatalkan dan berkas fisik akan dihapus dari server.`
      )
    )
      return;
    const ok = await handlePermanentDeleteDoc(doc.id);
    if (ok) {
      showToast(`Berkas "${doc.filename}" telah dihapus permanen.`);
    } else {
      alert('Gagal menghapus berkas permanen.');
    }
  };

  const handleSaveAcademicYear = async (year: string, semester: 'Ganjil' | 'Genap') => {
    await handleAddAcademicYear(year, semester);
    showToast(`Tahun Akademik ${year} ${semester} berhasil ditambahkan!`);
  };

  const handleToggleAY = async (ay: any) => {
    await handleToggleAcademicYear(ay);
    showToast(`Status tahun akademik "${ay.label}" diperbarui!`);
  };

  const handleDeleteAY = async (id: string, label: string) => {
    if (!window.confirm(`Hapus master tahun akademik "${label}"?`)) return;
    try {
      await handleDeleteAcademicYear(id);
      showToast(`Tahun akademik "${label}" berhasil dihapus.`);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus tahun akademik');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f8] text-[#111c2d] flex flex-col font-sans">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-60 flex items-center gap-2.5 rounded-2xl bg-[#c8102e] px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <Check className="h-4 w-4 text-[#85f8c4]" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        documents={documents}
      />

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isBackendOnline={isBackendOnline}
          onRefresh={loadData}
          auditLogs={auditLogs}
          conflictInfo={conflictInfo}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {currentTab === 'dashboard' ? (
            <>
              {/* Top Action & Title Row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {/* Category / Semester Pill */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-md bg-[#c8102e] px-2.5 py-0.5 font-bold tracking-wider text-white uppercase text-[10px]">
                      ARSIP JURUSAN RPL
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[11px]">
                      {academicYears.find((ay) => ay.isActive)?.label || 'SEMESTER GANJIL 2026/2027'}
                    </span>
                  </div>

                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111c2d] sm:text-3xl">
                    Dashboard Pengarsipan Digital
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Pantauan metrik arsip, kuota penyimpanan, dan aktivitas dokumen Prodi Rekayasa Perangkat Lunak
                  </p>
                </div>

                {/* Top Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => showToast('Mengekspor laporan akreditasi format XLSX...')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f0f3ff] px-4 py-2.5 text-xs font-semibold text-[#111c2d] hover:bg-[#dee8ff] transition-all"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-[#006398]" />
                    <span>Ekspor Laporan Akreditasi</span>
                  </button>

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#9e1025] transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Unggah Dokumen Baru</span>
                  </button>
                </div>
              </div>

              {/* Alert Duplikasi SHA-256 (Peringatan Sistem Real) */}
              {(isConflictAlertVisible && conflictInfo) && (
                <div className="flex flex-col gap-4 rounded-2xl border border-red-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-200">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffdad6] text-[#93000a]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-[#111c2d]">
                          Peringatan Integritas Arsip
                        </h2>
                        <span className="rounded-md bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold text-[#93000a]">
                          1 DUPLIKAT SHA-256
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        Dokumen{' '}
                        <span className="font-semibold text-[#ba1a1a]">
                          {conflictInfo.newFilename}
                        </span>{' '}
                        terdeteksi memiliki signature hash SHA-256 identik{' '}
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                          {conflictInfo.sha256 ? `${conflictInfo.sha256.slice(0, 16)}...` : 'SHA-256'}
                        </span>{' '}
                        dengan berkas di repositori. Tindakan penolakan atau perbaikan diperlukan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setIsConflictAlertVisible(false);
                        setConflictInfo(null);
                      }}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-red-50 transition-colors"
                    >
                      Abaikan
                    </button>
                    <button
                      onClick={() => setIsConflictModalOpen(true)}
                      className="rounded-xl bg-[#ba1a1a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#93000a] transition-all"
                    >
                      Review Konflik
                    </button>
                  </div>
                </div>
              )}

              {/* 4 Kartu KPI Statistik Utama (Dynamic from documents) */}
              <KPISection documents={documents} />

              {/* Baris Visualisasi Data (Grid 2 Kolom - Dynamic from documents) */}
              <DataVisualizationSection documents={documents} />

              {/* Baris Bawah: Grid 2 Kolom (8 Col vs 4 Col) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <RecentDocumentsTable
                  documents={filteredDocuments}
                  onViewDocument={(doc) => setSelectedDocument(doc)}
                  onPreviewDocument={(doc) => setPreviewDocument(doc)}
                  onDeleteDocument={handleSoftDelete}
                  onViewAll={() => setCurrentTab('daftar-arsip')}
                />
                <AuditActivityPanel
                  logs={auditLogs}
                  onOpenAuditTrail={() => setCurrentTab('audit-log')}
                />
              </div>
            </>
          ) : (
            /* Secondary Tab Views */
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-xl font-bold text-[#111c2d] capitalize">
                    {currentTab.replace('-', ' ')}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Repositori dan modul sistem pengarsipan digital prodi RPL
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9e1025] transition-all"
                >
                  Kembali ke Dashboard
                </button>
              </div>

              {/* TAB: DAFTAR ARSIP */}
              {currentTab === 'daftar-arsip' && (
                <div className="mt-6 space-y-4">
                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f0f3ff]/60 p-4 border border-slate-200/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5 text-[#00236f]" /> Kategori:
                      </span>
                      {['Semua', 'Tugas Akhir', 'Laporan PKL', 'Kurikulum & RPS', 'Akreditasi', 'SK & Surat'].map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                              categoryFilter === cat
                                ? 'bg-[#c8102e] text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-600">Tahun:</span>
                      <select
                        value={academicYearFilter}
                        onChange={(e) => setAcademicYearFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-hidden font-medium"
                      >
                        <option value="Semua">Semua Semester</option>
                        {academicYears.map((ay) => (
                          <option key={ay.id} value={ay.label}>
                            {ay.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <RecentDocumentsTable
                    documents={filteredDocuments}
                    onViewDocument={(doc) => setSelectedDocument(doc)}
                    onPreviewDocument={(doc) => setPreviewDocument(doc)}
                    onDeleteDocument={handleSoftDelete}
                    onViewAll={() => {}}
                  />
                </div>
              )}

              {/* TAB: AUDIT LOG */}
              {currentTab === 'audit-log' && (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-sm font-bold text-[#111c2d]">
                        Log Rekam Jejak Sistem (Audit Trail)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Catatan kronologis semua aksi pengguna untuk transparansi & instrumen akreditasi
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {['Semua', 'UPLOAD', 'UNDUH', 'UPDATE', 'SAMPAH', 'PULIH'].map((action) => (
                        <button
                          key={action}
                          onClick={() => setAuditActionFilter(action)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            auditActionFilter === action
                              ? 'bg-[#00236f] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-3xl">
                    <AuditActivityPanel logs={filteredAuditLogs} onOpenAuditTrail={() => {}} />
                  </div>
                </div>
              )}

              {/* TAB: TAHUN AKADEMIK */}
              {currentTab === 'tahun-akademik' && (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#111c2d]">
                        Daftar Master Data Tahun Akademik
                      </h2>
                      <p className="text-xs text-slate-500">
                        Referensi baku tahun dan semester untuk pengelompokan arsip digital
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddAYModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#9e1025] transition-all shadow-xs"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Tahun Akademik</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#f0f3ff]/70 text-[11px] font-bold text-[#444651]">
                          <th className="py-3 pl-4 pr-3">TAHUN AKADEMIK</th>
                          <th className="px-3 py-3">SEMESTER</th>
                          <th className="px-3 py-3">LABEL SISTEM</th>
                          <th className="px-3 py-3">STATUS AKTIF</th>
                          <th className="px-3 py-3 text-center">JUMLAH DOKUMEN</th>
                          <th className="py-3 pr-4 pl-3 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {academicYears.map((ay) => {
                          const docCount = documents.filter((d) => d.academicYear === ay.label).length;
                          return (
                            <tr key={ay.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 pl-4 pr-3 font-semibold text-[#111c2d]">{ay.year}</td>
                              <td className="px-3 py-3">{ay.semester}</td>
                              <td className="px-3 py-3 font-mono font-semibold text-[#00236f]">{ay.label}</td>
                              <td className="px-3 py-3">
                                {ay.isActive ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#85f8c4]/40 px-2.5 py-0.5 text-[11px] font-bold text-[#002114]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                    Aktif Berjalan
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                                    Lampau
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center font-mono text-slate-700">
                                {docCount} Berkas
                              </td>
                              <td className="py-3 pr-4 pl-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleToggleAY(ay)}
                                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#00236f] hover:bg-[#e8f0fe] transition-colors"
                                  >
                                    {ay.isActive ? 'Nonaktifkan' : 'Jadikan Aktif'}
                                  </button>
                                  {docCount === 0 && (
                                    <button
                                      onClick={() => handleDeleteAY(ay.id, ay.label)}
                                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-[#ba1a1a] transition-colors"
                                      title="Hapus tahun akademik"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: TEMPAT SAMPAH */}
              {currentTab === 'tempat-sampah' && (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[#111c2d]">
                          Berkas di Tempat Sampah (Soft Deleted)
                        </h2>
                        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#ba1a1a]">
                          {trashDocuments.length} BERKAS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Berkas dapat dipulihkan kembali ke repositori aktif atau dihapus secara permanen dari server.
                      </p>
                    </div>
                  </div>

                  {trashDocuments.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-[#f9f9ff]">
                      <Trash2 className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-xs font-semibold text-slate-600">
                        Tempat sampah saat ini kosong
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Tidak ada berkas yang sedang dihapus.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-[#f0f3ff]/70 text-[11px] font-bold text-[#444651]">
                            <th className="py-3 pl-4 pr-3">DOKUMEN & IDENTITAS</th>
                            <th className="px-3 py-3">KATEGORI</th>
                            <th className="px-3 py-3">TAHUN AKADEMIK</th>
                            <th className="px-3 py-3">UKURAN</th>
                            <th className="py-3 pr-4 pl-3 text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {trashDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 pl-4 pr-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#ba1a1a]">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#111c2d] line-clamp-1">{doc.filename}</p>
                                    <p className="font-mono text-[10px] text-slate-400">{doc.archiveNumber} • {doc.responsibleIdentifier}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className="inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold"
                                  style={{ backgroundColor: doc.categoryTheme?.bg || '#f1f5f9', color: doc.categoryTheme?.text || '#334155' }}
                                >
                                  {doc.category}
                                </span>
                              </td>
                              <td className="px-3 py-3 font-mono text-slate-700">{doc.academicYear}</td>
                              <td className="px-3 py-3 font-mono text-slate-500">{doc.fileSize}</td>
                              <td className="py-3 pr-4 pl-3 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleRestore(doc)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-[#e8f5e9] px-2.5 py-1.5 text-[11px] font-semibold text-[#004a32] hover:bg-emerald-100 transition-colors cursor-pointer"
                                    title="Pulihkan dokumen ke repositori aktif"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Pulihkan</span>
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDelete(doc)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-[#ba1a1a] hover:bg-red-100 transition-colors cursor-pointer"
                                    title="Hapus permanen berkas fisik dari server"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Hapus Permanen</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* OTHER COMING SOON TABS */}
              {!['daftar-arsip', 'audit-log', 'tahun-akademik', 'tempat-sampah'].includes(currentTab) && (
                <div className="py-16 text-center">
                  <FolderArchive className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600 capitalize">
                    Modul {currentTab.replace('-', ' ')}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Modul ini siap dikembangkan sesuai data master repositori.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ConflictModal
        isOpen={isConflictModalOpen || conflictInfo !== null}
        onClose={() => {
          setIsConflictModalOpen(false);
          setConflictInfo(null);
        }}
        onResolve={handleResolveConflict}
        conflictData={conflictInfo}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        onUpload={handleUpload}
        academicYears={academicYears}
        criteria={criteria}
      />

      <DocumentDetailModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onPreview={(document) => setPreviewDocument(document)}
        onDelete={handleSoftDelete}
      />

      <DocumentPreviewModal
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      <AddAcademicYearModal
        isOpen={isAddAYModalOpen}
        onClose={() => setIsAddAYModalOpen(false)}
        onSubmit={handleSaveAcademicYear}
      />
    </div>
  );
}

export default App;
