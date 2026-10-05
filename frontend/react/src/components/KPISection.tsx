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
import type { DocumentItem } from '../types';

interface KPISectionProps {
  documents?: DocumentItem[];
}

export const KPISection: React.FC<KPISectionProps> = ({ documents = [] }) => {
  const totalDocs = documents.length;
  const draftCount = documents.filter((d) => d.status === 'Draft').length;
  const activeCount = documents.filter((d) => d.status === 'Aktif').length;
  const activePct = totalDocs > 0 ? ((activeCount / totalDocs) * 100).toFixed(1) : '100';

  // Hitung total storage dari data berkas
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

  const usedDisplay = totalMB >= 1024 ? (totalMB / 1024).toFixed(2) : totalMB.toFixed(1);
  const usedUnit = totalMB >= 1024 ? 'GB' : 'MB';
  const storagePct = Math.max(0.1, (totalMB / (100 * 1024)) * 100).toFixed(1);

  // Nama bulan saat ini
  const monthName = new Date()
    .toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Total Dokumen Tersimpan */}
      <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#444651] uppercase">
              TOTAL DOKUMEN TERSIMPAN
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe5e8] text-[#c8102e] transition-transform group-hover:scale-105">
              <FolderArchive className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              {totalDocs.toLocaleString('id-ID')}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Aktif</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="rounded-md bg-[#ffe5e8] px-2 py-0.5 text-[11px] font-semibold text-[#9e1025]">
            {activePct}% Terindeks Lengkap
          </span>
          <span className="font-mono text-[11px] text-slate-400">PostgreSQL</span>
        </div>
      </div>

      {/* KPI 2: Unggahan Periode Ini */}
      <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#444651] uppercase">
              UNGGAHAN BULAN INI ({monthName})
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f5fe] text-[#006398] transition-transform group-hover:scale-105">
              <UploadCloud className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              {totalDocs}
            </span>
            <span className="text-sm font-medium text-slate-500">Berkas</span>
            <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Tersinkron</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Database live SiArsip</p>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs">
            <div className="h-2 w-32 rounded-full bg-[#ffe5e8] overflow-hidden">
              <div className="h-full rounded-full bg-[#c8102e]" style={{ width: `${Math.min(100, totalDocs * 10)}%` }} />
            </div>
            <span className="text-[11px] font-bold text-[#444651]">{totalDocs} Tersimpan</span>
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0c2] text-[#8a5a00] transition-transform group-hover:scale-105">
              <FileEdit className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#111c2d]">
              {draftCount}
            </span>
            <span className="text-sm font-medium text-slate-500">Dokumen</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#ba1a1a]">
            {draftCount > 0 ? (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="font-semibold">Perlu Verifikasi</span>
                <span className="text-slate-400">• {draftCount} tertahan</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Semua Terverifikasi</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="rounded-md bg-[#ffdad6] px-2 py-0.5 text-[11px] font-semibold text-[#93000a]">
            {draftCount > 0 ? 'Butuh Kelengkapan Metadata' : 'Arsip Bersih'}
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
              {usedDisplay}
            </span>
            <span className="font-mono text-sm font-semibold text-slate-500">/ 100 {usedUnit === 'GB' ? 'GB' : 'MB'}</span>
            <span className="ml-auto rounded-md bg-[#85f8c4]/60 px-2 py-0.5 font-mono text-[11px] font-bold text-[#002114]">
              {storagePct}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Penyimpanan server lokal</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003120]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Storage Aktif
          </span>
          <span className="text-[11px] text-slate-400">Total {totalDocs} Berkas</span>
        </div>
      </div>
    </div>
  );
};
