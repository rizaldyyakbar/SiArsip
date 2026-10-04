import React, { useState } from 'react';
import {
  Search,
  Upload,
  Bell,
  ChevronDown,
  Menu,
  Command,
  User,
  LogOut,
  Settings
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenUpload: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isBackendOnline?: boolean | null;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenUpload,
  searchQuery,
  onSearchChange,
  isBackendOnline,
  onRefresh
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

        {/* Global Search Input Bar */}
        <div className="relative flex max-w-xl flex-1 items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul berkas, NIP, nomor dokumen, SK..."
            className="w-full rounded-2xl border-0 bg-[#fff0f2] py-2.5 pr-20 pl-10 text-sm text-[#111c2d] placeholder-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-[#c8102e] focus:outline-hidden"
          />

          <div className="absolute right-3 hidden items-center gap-1 rounded-md bg-[#ffe5e8] px-2 py-1 text-[11px] font-semibold text-[#9e1025] sm:flex">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
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

        {/* Notifications Button with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Pemberitahuan"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold text-white shadow-xs">
              2
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="text-xs font-bold text-slate-900">Pemberitahuan</span>
                <span className="text-[11px] text-[#c8102e] font-semibold cursor-pointer">Tandai Dibaca</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-xl bg-red-50 p-2.5 text-red-900 border border-red-100">
                  <p className="font-semibold text-xs text-[#93000a]">Peringatan Integritas Arsip</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">1 file hash duplikat terdeteksi pada TA_220401048.</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-900 border border-blue-100">
                  <p className="font-semibold text-xs text-[#c8102e]">Batch Upload Berhasil</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">3 berkas Tugas Akhir berhasil diverifikasi ke repositori.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* Profile Card / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-slate-100 sm:px-2.5"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#c8102e] to-[#ff7186] text-xs font-bold text-white shadow-xs ring-2 ring-white">
              RI
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-[#111c2d] leading-none">
                Ratna Indah, S.Kom.
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-500 leading-none">
                Staf Administrasi & Akademik
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="border-b border-slate-100 px-3 py-2 text-xs">
                <p className="font-bold text-slate-900">Ratna Indah, S.Kom.</p>
                <p className="text-[11px] text-slate-500 font-mono">admin.rpl@kampus.ac.id</p>
              </div>
              <div className="mt-1 space-y-0.5 text-xs font-medium text-slate-700">
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100">
                  <User className="h-4 w-4 text-slate-400" />
                  Profil Pengguna
                </button>
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100">
                  <Settings className="h-4 w-4 text-slate-400" />
                  Pengaturan Sistem
                </button>
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4 text-red-500" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
