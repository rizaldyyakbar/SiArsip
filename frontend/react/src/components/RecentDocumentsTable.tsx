import React from 'react';
import {
  FileText,
  Eye,
  Download,
  Edit3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileCode,
  AlertCircle
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface RecentDocumentsTableProps {
  documents: DocumentItem[];
  onViewDocument: (doc: DocumentItem) => void;
  onViewAll: () => void;
}

export const RecentDocumentsTable: React.FC<RecentDocumentsTableProps> = ({
  documents,
  onViewDocument,
  onViewAll
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-8">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111c2d]">
              Dokumen Terbaru Ditambahkan
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Arsip akademik yang baru divalidasi ke dalam repositori
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c8102e] hover:text-[#9e1025] transition-colors"
          >
            <span>Lihat Semua Berkas</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f0f3ff]/70 text-[11px] font-bold tracking-wider text-[#444651]">
                <th className="py-3 pl-4 pr-3 rounded-l-xl">DOKUMEN / DISPLAY NAME</th>
                <th className="px-3 py-3">KATEGORI</th>
                <th className="px-3 py-3">TERKAIT</th>
                <th className="px-3 py-3">TANGGAL</th>
                <th className="px-3 py-3">STATUS</th>
                <th className="py-3 pr-4 pl-3 text-right rounded-r-xl">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {documents.map((doc) => {
                const isDraft = doc.status === 'Draft';
                return (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${
                      isDraft ? 'bg-[#f0f3ff]/40 hover:bg-[#e7eeff]/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Filename & Hash */}
                    <td className="py-3.5 pl-4 pr-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isDraft
                              ? 'bg-blue-100 text-[#006398]'
                              : 'bg-red-50 text-[#ba1a1a]'
                          }`}
                        >
                          {doc.filename.endsWith('.docx') ? (
                            <FileCode className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 max-w-[240px]">
                          <p className="truncate font-semibold text-[#111c2d] hover:text-[#c8102e] cursor-pointer" onClick={() => onViewDocument(doc)}>
                            {doc.filename}
                          </p>
                          {doc.issues ? (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#ba1a1a]">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span className="truncate">{doc.issues}</span>
                            </div>
                          ) : (
                            <>
                              <p className="mt-0.5 font-mono text-[10px] text-[#9e1025]">
                                {doc.archiveNumber} • No. {doc.documentNumber}
                              </p>
                              <p className="font-mono text-[11px] text-slate-400">
                                {doc.fileSize} • SHA: {doc.shaHash}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span
                        className="inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor: doc.categoryTheme.bg,
                          color: doc.categoryTheme.text,
                        }}
                      >
                        {doc.category}
                      </span>
                    </td>

                    {/* Penanggung jawab dokumen */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-[#111c2d]">{doc.relatedName}</p>
                      <p className="text-[11px] text-slate-500">{doc.responsibleIdentifier}</p>
                    </td>

                    {/* Tanggal */}
                    <td className="px-3 py-3.5 whitespace-nowrap font-mono text-slate-600">
                      {doc.uploadDate}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {doc.status === 'Aktif' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#85f8c4]/40 px-2.5 py-1 font-semibold text-[#002114]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dee8ff] px-2.5 py-1 font-semibold text-[#444651]">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                      {isDraft ? (
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#9e1025] transition-all"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewDocument(doc)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Unduh Berkas"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer Card */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f0f3ff] px-4 py-3 text-xs">
        <span className="text-slate-500">
          Menampilkan <span className="font-semibold text-slate-800">5 berkas</span> dari <span className="font-semibold text-slate-800">3.482 entri</span> repositori
        </span>

        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs font-semibold text-[#111c2d]">
            Hal 1 dari 697
          </span>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
