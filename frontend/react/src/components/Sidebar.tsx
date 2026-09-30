import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  UploadCloud,
  Users,
  Tags,
  Trash2,
  UserCog,
  FileClock,
  HardDrive,
  CheckCircle2,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onOpenUpload
}) => {
  const navMain = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daftar-arsip', label: 'Daftar Arsip', icon: FolderArchive },
    { id: 'unggah-berkas', label: 'Unggah Berkas', icon: UploadCloud, badge: 'BARU', isAction: true },
  ];

  const navManagement = [
    { id: 'mahasiswa-dosen', label: 'Mahasiswa & Dosen', icon: Users },
    { id: 'kategori-tag', label: 'Kategori & Tag', icon: Tags },
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between bg-[#00236f] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-2 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#5bb8fe] text-white shadow-md shadow-[#00236f]/50">
                <FolderArchive className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                  Arsip Digital
                </h1>
                <p className="text-[10px] font-semibold tracking-wider text-[#b6c4ff] uppercase">
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
                        ? 'bg-[#1e3a8a] text-white shadow-sm ring-1 ring-white/20'
                        : 'text-[#dce1ff] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#b6c4ff]'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="rounded-md bg-[#5bb8fe] px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#00236f] uppercase shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Management Section */}
            <div>
              <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-[#b6c4ff]/80 uppercase">
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
                          ? 'bg-[#1e3a8a] text-white shadow-sm'
                          : 'text-[#dce1ff] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#b6c4ff]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Section */}
            <div>
              <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-[#b6c4ff]/80 uppercase">
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
                          ? 'bg-[#1e3a8a] text-white shadow-sm'
                          : 'text-[#dce1ff] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#b6c4ff]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Capacity Cloud Card */}
        <div className="p-4">
          <div className="rounded-2xl bg-[#004a32] p-4 text-white shadow-lg border border-[#006040]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#dce1ff]">
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-[#85f8c4]" />
                <span>Kapasitas Cloud</span>
              </div>
              <span className="font-mono text-[#cce5ff] font-bold">42%</span>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#93ccff] to-[#85f8c4] transition-all duration-500"
                style={{ width: '42.8%' }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#b6c4ff]">42.8 GB / 100 GB</span>
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
      </aside>
    </>
  );
};
