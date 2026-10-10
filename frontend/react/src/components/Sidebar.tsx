import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  UploadCloud,
  Users,
  Tags,
  Calendar,
  Trash2,
  UserCog,
  FileClock,
  HardDrive,
  CheckCircle2,
  X
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenUpload: () => void;
  documents?: DocumentItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onOpenUpload,
  documents = []
}) => {
  const navMain = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daftar-arsip', label: 'Daftar Arsip', icon: FolderArchive },
    { id: 'unggah-berkas', label: 'Unggah Berkas', icon: UploadCloud, isAction: true },
  ];

  const navManagement = [
    { id: 'dosen', label: 'Dosen', icon: Users },
    { id: 'kategori-tag', label: 'Kategori & Tag', icon: Tags },
    { id: 'tahun-akademik', label: 'Tahun Akademik', icon: Calendar },
    { id: 'tempat-sampah', label: 'Tempat Sampah', icon: Trash2 },
  ];

  const navSystem = [
    { id: 'kelola-pengguna', label: 'Kelola Pengguna', icon: UserCog },
    { id: 'audit-log', label: 'Audit Log', icon: FileClock },
  ];

  const handleNavClick = (id: string, isAction?: boolean) => {
    if (isAction && id === 'unggah-berkas') {
      onOpenUpload();
    } else {
      onTabChange(id);
    }
    if (isOpenMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between bg-[#c8102e] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-2 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white shadow-md shadow-[#8f0d24]/40">
                <FolderArchive className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                  Arsip Digital
                </h1>
                <p className="text-[10px] font-semibold tracking-wider text-[#ffd6dc] uppercase">
                  PRODI REKAYASA PERANGKAT LUNAK
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-6">
            {/* Primary Nav */}
            <div className="space-y-1">
              {navMain.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.isAction)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#8f0d24] text-white shadow-sm ring-1 ring-white/20'
                        : 'text-[#ffe5e8] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#ffd6dc]'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Management Section */}
            <div>
                <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-[#ffd6dc]/80 uppercase">
                MANAJEMEN
              </p>
              <div className="space-y-1">
                {navManagement.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#8f0d24] text-white shadow-sm'
                          : 'text-[#ffe5e8] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#ffd6dc]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Section */}
            <div>
                <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-[#ffd6dc]/80 uppercase">
                SISTEM
              </p>
              <div className="space-y-1">
                {navSystem.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#8f0d24] text-white shadow-sm'
                          : 'text-[#ffe5e8] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#ffd6dc]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Capacity Cloud Card */}
        {(() => {
          const totalMB = documents.reduce((acc, doc) => {
            const raw = doc.fileSize || '';
            const match = raw.match(/([\d.]+)\s*(MB|KB|GB|B)/i);
            if (!match) return acc;
            const num = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit === 'GB') return acc + num * 1024;
            if (unit === 'MB') return acc + num;
            if (unit === 'KB') return acc + num / 1024;
            return acc;
          }, 0);

          const usedDisplay = totalMB >= 1024 ? `${(totalMB / 1024).toFixed(2)} GB` : `${totalMB.toFixed(1)} MB`;
          const pct = Math.min(100, Math.max(0.1, (totalMB / (100 * 1024)) * 100)).toFixed(1);

          return (
            <div className="p-4">
              <div className="rounded-2xl bg-[#004a32] p-4 text-white shadow-lg border border-[#006040]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#dce1ff]">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-[#85f8c4]" />
                    <span>Kapasitas Cloud</span>
                  </div>
                  <span className="font-mono text-[#cce5ff] font-bold">{pct}%</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 h-2 w-full rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#93ccff] to-[#85f8c4] transition-all duration-500"
                    style={{ width: `${Math.max(2, parseFloat(pct))}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#b6c4ff]">{usedDisplay} / 100 GB</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#85f8c4]">
                    <CheckCircle2 className="h-3 w-3" />
                    Sehat
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] text-[#b6c4ff]">
                  <span>v1.0 Internal RPL</span>
                  <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                    STABLE
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </aside>
    </>
  );
};
