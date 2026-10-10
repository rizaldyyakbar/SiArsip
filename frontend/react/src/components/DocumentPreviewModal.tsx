import React from 'react';
import { Download, FileText, X } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

const getExtension = (filename: string) => filename.split('.').pop()?.toLowerCase() ?? '';

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose
}) => {
  if (!document) return null;

  const extension = getExtension(document.filename);
  const canEmbed = extension === 'pdf' || extension === 'txt' || extension === 'csv';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex h-[min(88vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffe5e8] text-[#c8102e]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#111c2d]">Pratinjau Dokumen</p>
              <p className="truncate text-xs text-slate-500">{document.filename}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup pratinjau"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-slate-100 p-3 sm:p-5">
          {document.previewUrl && canEmbed ? (
            <iframe
              title={`Pratinjau ${document.filename}`}
              src={document.previewUrl}
              className="h-full min-h-[420px] w-full rounded-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <div className="max-w-md">
                <FileText className="mx-auto h-10 w-10 text-[#c8102e]" />
                <h4 className="mt-4 text-sm font-bold text-[#111c2d]">
                  Pratinjau belum tersedia
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {document.previewUrl && extension === 'xlsx'
                    ? 'Format XLSX tidak dapat dirender langsung oleh browser. Unduh berkas untuk membukanya di aplikasi spreadsheet.'
                    : 'Berkas ini berasal dari data demo atau belum memiliki file fisik di browser.'}
                </p>
                {document.previewUrl && (
                  <a
                    href={document.downloadUrl || document.previewUrl}
                    download={document.filename}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9e1025]"
                  >
                    <Download className="h-4 w-4" />
                    Unduh Berkas
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
          <span className="font-mono text-[11px] text-slate-500">{document.archiveNumber}</span>
          <div className="flex items-center gap-2">
            {document.previewUrl && canEmbed && (
              <a
                href={document.downloadUrl || document.previewUrl}
                download={document.filename}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9e1025]"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
