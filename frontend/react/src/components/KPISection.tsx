import React from 'react';
import {
  FolderArchive,
  UploadCloud,
  FileEdit,
  HardDrive,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const KPISection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Total Dokumen Tersimpan */}
      <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#444651] uppercase">
              TOTAL DOKUMEN TERSIMPAN
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7eeff] text-[#00236f] transition-transform group-hover:scale-105">
              <FolderArchive className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              3.482
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12.4%</span>
              <span className="text-[10px] font-normal text-slate-400">MoM</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="rounded-md bg-[#dee8ff] px-2 py-0.5 text-[11px] font-semibold text-[#00236f]">
            98.4% Terindeks Lengkap
          </span>
          <span className="font-mono text-[11px] text-slate-400">RPL-DB</span>
        </div>
      </div>

      {/* KPI 2: Unggahan Bulan Ini */}
      <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#444651] uppercase">
              UNGGAHAN BULAN INI (SEP 2026)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f5fe] text-[#006398] transition-transform group-hover:scale-105">
              <UploadCloud className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              148
            </span>
            <span className="text-sm font-medium text-slate-500">Berkas</span>
            <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+24%</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">vs Agustus 2026</p>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs">
            <div className="h-2 w-32 rounded-full bg-[#f0f3ff] overflow-hidden">
              <div className="h-full rounded-full bg-[#006398]" style={{ width: '74%' }} />
            </div>
            <span className="text-[11px] font-bold text-[#444651]">74% Target</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Dokumen Status Draft */}
      <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#444651] uppercase">
              DOKUMEN STATUS DRAFT
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dee8ff] text-[#444651] transition-transform group-hover:scale-105">
              <FileEdit className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              12
            </span>
            <span className="text-sm font-medium text-slate-500">Dokumen</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#ba1a1a]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="font-semibold">Perlu Verifikasi</span>
            <span className="text-slate-400">• 4 tertahan</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="rounded-md bg-[#ffdad6] px-2 py-0.5 text-[11px] font-semibold text-[#93000a]">
            Butuh Kelengkapan Metadata
          </span>
        </div>
      </div>

      {/* KPI 4: Penyimpanan Terpakai */}
      <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#444651] uppercase">
              PENYIMPANAN TERPAKAI
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#004a32] transition-transform group-hover:scale-105">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              42.8
            </span>
            <span className="font-mono text-sm font-semibold text-slate-500">/ 100 GB</span>
            <span className="ml-auto rounded-md bg-[#85f8c4]/60 px-2 py-0.5 font-mono text-[11px] font-bold text-[#002114]">
              42.8%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Kapasitas aman & stabil</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003120]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Sehat (Prodi RPL Cloud)
          </span>
          <span className="text-[11px] text-slate-400">Sisa 57.2 GB</span>
        </div>
      </div>
    </div>
  );
};
