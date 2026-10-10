import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Upload,
  Bell,
  ChevronDown,
  Menu,
  Command,
  User,
  LogOut,
  X,
  Eye,
  FileText,
  FileCode,
  ArrowRight,
  ExternalLink,
  SearchX
} from 'lucide-react';
import type { AuditLogItem, DocumentItem, UserAccount } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenUpload: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isBackendOnline?: boolean | null;
  onRefresh?: () => void;
  auditLogs?: AuditLogItem[];
  conflictInfo?: any;
  documents?: DocumentItem[];
  onSelectDocument?: (doc: DocumentItem) => void;
  onPreviewDocument?: (doc: DocumentItem) => void;
  onViewAllResults?: () => void;
  disableSearchPopup?: boolean;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenUpload,
  searchQuery,
  onSearchChange,
  isBackendOnline,
  onRefresh,
  auditLogs = [],
  conflictInfo,
  documents = [],
  onSelectDocument,
  onPreviewDocument,
  onViewAllResults,
  disableSearchPopup = false,
  currentUser,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter documents in real time based on search query
  const matchingDocuments = useMemo(() => {
    if (!documents || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return documents.filter((d) => {
      return (
        d.filename.toLowerCase().includes(q) ||
        d.responsibleIdentifier.toLowerCase().includes(q) ||
        d.documentNumber.toLowerCase().includes(q) ||
        d.archiveNumber.toLowerCase().includes(q) ||
        d.academicYear.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.accreditationCriterion && d.accreditationCriterion.toLowerCase().includes(q))
      );
    });
  }, [documents, searchQuery]);

  // Click outside to close search pop-up
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        if (!disableSearchPopup && searchQuery.trim().length > 0) {
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchQuery, disableSearchPopup]);

  // Handle arrow keys and enter in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
      return;
    }
    if (disableSearchPopup || !isSearchOpen || matchingDocuments.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matchingDocuments.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingDocuments.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetDoc = selectedIndex >= 0 ? matchingDocuments[selectedIndex] : matchingDocuments[0];
      if (targetDoc) {
        setIsSearchOpen(false);
        onSelectDocument?.(targetDoc);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left side: Hamburger (mobile) + Global Search Bar */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Buka navigasi"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Search Input Bar & Floating Results Pop-up */}
        <div ref={searchContainerRef} className="relative flex max-w-xl flex-1 items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              onSearchChange(val);
              setSelectedIndex(-1);
              if (!disableSearchPopup && val.trim().length > 0) {
                setIsSearchOpen(true);
              } else {
                setIsSearchOpen(false);
              }
            }}
            onFocus={() => {
              if (!disableSearchPopup && searchQuery.trim().length > 0) {
                setIsSearchOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari judul berkas, NIP, nomor dokumen, SK..."
            className="w-full rounded-2xl border-0 bg-[#fff0f2] py-2.5 pr-20 pl-10 text-sm text-[#111c2d] placeholder-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-[#c8102e] focus:outline-hidden"
          />

          {/* Quick Clear or Shortcut Indicator */}
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsSearchOpen(false);
                setSelectedIndex(-1);
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Hapus pencarian (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 hidden items-center gap-1 rounded-md bg-[#ffe5e8] px-2 py-1 text-[11px] font-semibold text-[#9e1025] sm:flex">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          )}

          {/* Floating Search Pop-up Results */}
          {!disableSearchPopup && isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Pop-up Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Hasil Pencarian</span>
                  <span className="rounded-full bg-[#ffe5e8] px-2 py-0.5 text-[10px] font-bold text-[#c8102e]">
                    {matchingDocuments.length} berkas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Tutup (Esc)
                </button>
              </div>

              {/* Pop-up Body: Document List or Empty State */}
              <div className="mt-2">
                {matchingDocuments.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-[#c8102e]">
                      <SearchX className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Berkas Tidak Ditemukan</p>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      Tidak ada dokumen yang cocok dengan &ldquo;<span className="font-semibold text-slate-700">{searchQuery}</span>&rdquo;.
                      <br />Coba cari dengan nomor SK, NIP, atau kata kunci nama berkas.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                    {matchingDocuments.map((doc, idx) => {
                      const isSelected = selectedIndex === idx;
                      const isDraft = doc.status === 'Draft';
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onSelectDocument?.(doc);
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-50/80 ring-1 ring-[#c8102e]/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* File Icon & Metadata */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                isDraft ? 'bg-blue-100 text-[#006398]' : 'bg-red-50 text-[#ba1a1a]'
                              }`}
                            >
                              {doc.filename.endsWith('.docx') ? (
                                <FileCode className="h-4.5 w-4.5" />
                              ) : (
                                <FileText className="h-4.5 w-4.5" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-xs text-[#111c2d] truncate group-hover:text-[#c8102e] transition-colors">
                                  {doc.filename}
                                </p>
                                <span
                                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                                  style={{
                                    backgroundColor: doc.categoryTheme.bg,
                                    color: doc.categoryTheme.text
                                  }}
                                >
                                  {doc.category}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                                <span className="font-mono text-[#9e1025] font-semibold">
                                  {doc.archiveNumber}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-slate-600 truncate max-w-[130px]">
                                  No. {doc.documentNumber}
                                </span>
                                <span>•</span>
                                <span className="text-slate-600 truncate max-w-[140px]">
                                  {doc.responsibleIdentifier}
                                </span>
                                <span>•</span>
                                <span className="text-slate-400">{doc.fileSize}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {onPreviewDocument && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsSearchOpen(false);
                                  onPreviewDocument(doc);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#fff0f2] hover:text-[#c8102e] hover:border-[#ffccd2] transition-all"
                                title="Buka Pratinjau Dokumen Inline"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Pratinjau</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsSearchOpen(false);
                                onSelectDocument?.(doc);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all"
                              title="Lihat Detail Metadata Dokumen"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Detail</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pop-up Footer */}
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 px-2 text-xs">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                  <span>
                    <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">↑</kbd>{' '}
                    <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">↓</kbd> Navigasi
                  </span>
                  <span>•</span>
                  <span>
                    <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">↵</kbd> Buka
                  </span>
                </div>

                {onViewAllResults && matchingDocuments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      onViewAllResults();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8102e] hover:text-[#9e1025] hover:underline ml-auto"
                  >
                    <span>Lihat Semua di Daftar Arsip</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Unggah CTA, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        {/* Backend Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5">
          {isBackendOnline ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-[11px] font-semibold text-emerald-800"
              title="Backend Go terhubung aktif"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live API
            </span>
          ) : (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 transition-colors"
              title="Klik untuk mencoba koneksi ulang ke backend Go"
            >
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              Mode Demo
            </button>
          )}
        </div>

        {/* Unggah Dokumen CTA */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#9e1025] hover:shadow-md active:scale-95"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Unggah Dokumen</span>
        </button>

        {/* Notifications Button with Dynamic Badge */}
        {(() => {
          const notifications: { id: string; title: string; desc: string; isAlert: boolean }[] = [];
          if (conflictInfo) {
            notifications.push({
              id: 'conflict',
              title: 'Peringatan Duplikasi SHA-256',
              desc: `File "${conflictInfo.newFilename}" memiliki hash yang identik dengan arsip yang ada.`,
              isAlert: true
            });
          }
          auditLogs.slice(0, 3).forEach((log) => {
            notifications.push({
              id: log.id,
              title: log.title,
              desc: log.description,
              isAlert: false
            });
          });

          const notifCount = notifications.length;

          return (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Pemberitahuan"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold text-white shadow-xs">
                    {notifCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                    <span className="text-xs font-bold text-slate-900">Pemberitahuan</span>
                    {notifCount > 0 && (
                      <span
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-[#c8102e] font-semibold cursor-pointer hover:underline"
                      >
                        Tutup
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-2 text-xs max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">
                        <p className="text-xs font-medium">Tidak ada pemberitahuan baru</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded-xl p-2.5 border ${
                            n.isAlert
                              ? 'bg-red-50 text-red-900 border-red-100'
                              : 'bg-[#f0f3ff] text-[#111c2d] border-[#dee8ff]'
                          }`}
                        >
                          <p
                            className={`font-semibold text-xs ${
                              n.isAlert ? 'text-[#93000a]' : 'text-[#00236f]'
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                            {n.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Vertical Divider */}
        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* Profile Card / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-slate-100 sm:px-2.5"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#c8102e] to-[#ff7186] text-xs font-bold text-white shadow-xs ring-2 ring-white">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                : 'RI'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-[#111c2d] leading-none">
                {currentUser?.name || 'Dr. Eng. Ratna Indah'}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-500 leading-none">
                {currentUser?.role === 'kaprodi'
                  ? 'Ketua Program Studi RPL'
                  : currentUser?.role === 'dosen'
                  ? 'Dosen Tetap RPL'
                  : 'Staf Administrasi & Akademik'}
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="border-b border-slate-100 px-3 py-2 text-xs">
                <p className="font-bold text-slate-900">{currentUser?.name || 'Ratna Indah'}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {currentUser?.email || (currentUser?.username ? `@${currentUser.username}` : 'admin.rpl@kampus.ac.id')}
                </p>
                {currentUser?.nip && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {currentUser.nip}</p>
                )}
              </div>
              <div className="mt-1 space-y-0.5 text-xs font-medium text-slate-700">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100 cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Profil Pengguna
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer font-bold"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Keluar dari Sistem
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
