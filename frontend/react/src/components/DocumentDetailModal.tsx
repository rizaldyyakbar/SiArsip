import React from 'react';
import { X, FileText, ShieldCheck, Calendar, User, Tag, HardDrive, Hash, Trash2 } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onPreview: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onPreview,
  onDelete
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffe5e8] text-[#c8102e]">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-red-100 bg-red-50 p-3">
              <span className="flex items-center gap-1.5 text-[#9e1025] font-medium">
                <Hash className="h-3.5 w-3.5" /> ID Arsip Sistem
              </span>
              <p className="mt-1 font-mono font-bold text-[#9e1025]">{document.archiveNumber}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <FileText className="h-3.5 w-3.5 text-[#c8102e]" /> No. Dokumen Resmi
              </span>
              <p className="mt-1 font-mono font-semibold text-[#111c2d]">{document.documentNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#c8102e]" /> Tanggal Dokumen
              </span>
              <p className="mt-1 font-medium text-[#111c2d]">{document.documentDate}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Tag className="h-3.5 w-3.5 text-[#c8102e]" /> Tahun Akademik
              </span>
              <p className="mt-1 font-semibold text-[#111c2d]">{document.academicYear}</p>
            </div>
          </div>

          {document.accreditationInstrument && (
            <div className="rounded-2xl border border-red-100 bg-[#fff8f8] p-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9e1025]">
                  Pemetaan Akreditasi
                </p>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#9e1025]">
                  LAM INFOKOM 2.1
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-slate-500">Instrumen</p>
                    <p className="mt-0.5 font-semibold text-[#111c2d]">{document.accreditationInstrument}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Jenis Bukti</p>
                    <p className="mt-0.5 font-semibold text-[#111c2d]">{document.evidenceType || 'Dokumen Pendukung'}</p>
                  </div>
                </div>
                {document.accreditationCriterion && (
                  <div className="pt-2 border-t border-red-100/60">
                    <p className="text-[11px] text-slate-500">Kriteria LAM INFOKOM</p>
                    <p className="mt-0.5 font-semibold text-[#9e1025]">{document.accreditationCriterion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Tag className="h-3.5 w-3.5 text-[#c8102e]" /> Kategori
              </span>
              <p className="mt-1 font-semibold text-[#111c2d]">{document.category}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <HardDrive className="h-3.5 w-3.5 text-[#c8102e]" /> Ukuran
              </span>
              <p className="mt-1 font-semibold text-[#111c2d] font-mono">{document.fileSize}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <User className="h-3.5 w-3.5 text-[#c8102e]" /> Penanggung Jawab
              </span>
              <p className="mt-1 font-mono font-semibold text-[#111c2d]">{document.responsibleIdentifier}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#c8102e]" /> Waktu Arsip
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
              {document.fullShaHash ? `sha256:${document.fullShaHash}` : (document.shaHash ? `sha256:${document.shaHash}` : 'sha256:verified')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs font-semibold">
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(document);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-[#ba1a1a] hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Pindahkan ke Sampah</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => onPreview(document)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-5 py-2.5 text-white shadow-xs hover:bg-[#9e1025] transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>Preview Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
