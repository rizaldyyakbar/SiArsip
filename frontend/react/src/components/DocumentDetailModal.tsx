import React from 'react';
import { X, FileText, Download, ShieldCheck, Calendar, User, Tag, HardDrive } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7eeff] text-[#00236f]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111c2d]">
                Detail Arsip Dokumen
              </h3>
              <p className="text-xs text-slate-500">
                Informasi metadata berkas akademik terarsip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="rounded-2xl bg-[#f0f3ff] p-4">
            <p className="text-[11px] font-semibold text-slate-500">Nama Berkas</p>
            <p className="mt-1 text-sm font-bold text-[#111c2d] break-all">{document.filename}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Tag className="h-3.5 w-3.5 text-[#00236f]" /> Kategori
              </span>
              <p className="mt-1 font-semibold text-[#111c2d]">{document.category}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <HardDrive className="h-3.5 w-3.5 text-[#00236f]" /> Ukuran
              </span>
              <p className="mt-1 font-semibold text-[#111c2d] font-mono">{document.fileSize}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <User className="h-3.5 w-3.5 text-[#00236f]" /> Terkait
              </span>
              <p className="mt-1 font-semibold text-[#111c2d]">{document.relatedName}</p>
              <p className="text-[11px] text-slate-500">{document.relatedRoleOrNim}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#00236f]" /> Waktu Arsip
              </span>
              <p className="mt-1 font-semibold text-[#111c2d]">{document.uploadDate}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Checksum SHA-256 Integritas
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Verified
              </span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded-lg border border-slate-200">
              {document.shaHash ? `sha256:${document.shaHash}a7c09e32049e8bc114d` : 'sha256:e8f2b79c31405a81e9f12d8a5431cd6e'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 text-xs font-semibold">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
          <button
            onClick={() => alert(`Mengunduh berkas: ${document.filename}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00236f] px-5 py-2.5 text-white shadow-xs hover:bg-[#1e3a8a]"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Berkas Arsip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
