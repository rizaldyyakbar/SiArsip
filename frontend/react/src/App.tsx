import { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  AlertTriangle,
  FolderArchive,
  Check
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
import { mockDocuments } from './mockData';
import type { DocumentItem } from './types';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Banner state
  const [isConflictAlertVisible, setIsConflictAlertVisible] = useState(true);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (d) =>
        d.filename.toLowerCase().includes(q) ||
        d.relatedName.toLowerCase().includes(q) ||
        d.relatedRoleOrNim.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [documents, searchQuery]);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const handleResolveConflict = (action: string) => {
    setIsConflictModalOpen(false);
    setIsConflictAlertVisible(false);
    showToast(`Konflik hash berhasil diselesaikan (${action})`);
  };

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    setDocuments([newDoc, ...documents]);
    showToast(`Dokumen "${newDoc.filename}" berhasil diunggah & terindeks!`);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col font-sans">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-60 flex items-center gap-2.5 rounded-2xl bg-[#00236f] px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
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
      />

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
                    <span className="rounded-md bg-[#00236f] px-2.5 py-0.5 font-bold tracking-wider text-white uppercase text-[10px]">
                      ARSIP JURUSAN RPL
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[11px]">
                      SEMESTER GANJIL 2026/2027
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
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00236f] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1e3a8a] transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Unggah Dokumen Baru</span>
                  </button>
                </div>
              </div>

              {/* Alert Duplikasi SHA-256 (Peringatan Sistem) */}
              {isConflictAlertVisible && (
                <div className="flex flex-col gap-4 rounded-2xl border border-red-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
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
                          TA_220401048_Aditya_REV2.pdf
                        </span>{' '}
                        terdeteksi memiliki signature hash SHA-256 identik dengan berkas{' '}
                        <span className="font-semibold text-[#00236f]">
                          TA_220401048_Final.pdf
                        </span>
                        . Tindakan penggabungan atau penolakan diperlukan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setIsConflictAlertVisible(false)}
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

              {/* 4 Kartu KPI Statistik Utama */}
              <KPISection />

              {/* Baris Visualisasi Data (Grid 2 Kolom) */}
              <DataVisualizationSection />

              {/* Baris Bawah: Grid 2 Kolom (8 Col vs 4 Col) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <RecentDocumentsTable
                  documents={filteredDocuments}
                  onViewDocument={(doc) => setSelectedDocument(doc)}
                  onViewAll={() => setCurrentTab('daftar-arsip')}
                />
                <AuditActivityPanel
                  onOpenAuditTrail={() => setCurrentTab('audit-log')}
                />
              </div>
            </>
          ) : (
            /* Secondary Tab Views */
            <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xs">
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
                  className="rounded-xl bg-[#00236f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3a8a]"
                >
                  Kembali ke Dashboard
                </button>
              </div>

              {currentTab === 'daftar-arsip' && (
                <div className="mt-6">
                  <RecentDocumentsTable
                    documents={filteredDocuments}
                    onViewDocument={(doc) => setSelectedDocument(doc)}
                    onViewAll={() => {}}
                  />
                </div>
              )}

              {currentTab === 'audit-log' && (
                <div className="mt-6 max-w-2xl">
                  <AuditActivityPanel onOpenAuditTrail={() => {}} />
                </div>
              )}

              {!['daftar-arsip', 'audit-log'].includes(currentTab) && (
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
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onResolve={handleResolveConflict}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <DocumentDetailModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
}

export default App;
