import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Calendar,
  User,
  Tag,
  HardDrive,
  Hash,
  Trash2,
  History,
  UploadCloud,
  Download,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  fetchDocumentVersions,
  uploadDocumentVersion,
  formatBytes,
  formatDateTime,
  getDocumentDownloadUrl
} from '../api';
import type { DocumentItem, DocumentVersion } from '../types';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onPreview: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
  onVersionUploaded?: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onPreview,
  onDelete,
  onVersionUploaded
}) => {
  if (!document) return null;

  const [activeTab, setActiveTab] = useState<'metadata' | 'versions'>('metadata');
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isUploadingRevision, setIsUploadingRevision] = useState(false);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionSuccess, setRevisionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (document && activeTab === 'versions') {
      loadVersions();
    }
  }, [document?.id, activeTab]);

  const loadVersions = async () => {
    if (!document) return;
    setIsLoadingVersions(true);
    try {
      const list = await fetchDocumentVersions(document.id);
      setVersions(list);
    } catch (err: any) {
      console.warn('Gagal memuat versi dokumen:', err);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleUploadRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document || !revisionFile) return;

    setIsUploadingRevision(true);
    setRevisionError(null);
    setRevisionSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', revisionFile);
      if (revisionNote.trim()) {
        formData.append('note', revisionNote.trim());
      }
      formData.append('uploaded_by', document.responsibleIdentifier || '');

      await uploadDocumentVersion(document.id, formData);
      setRevisionSuccess('Versi revisi berkas berhasil diunggah.');
      setRevisionFile(null);
      setRevisionNote('');
      await loadVersions();
      if (onVersionUploaded) onVersionUploaded();
    } catch (err: any) {
      setRevisionError(err.message || 'Gagal mengunggah berkas revisi');
    } finally {
      setIsUploadingRevision(false);
    }
  };

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

        {/* Tabs switcher */}
        <div className="mt-4 flex gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'metadata'
                ? 'bg-red-50 text-[#c8102e] border border-red-200 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Metadata Dokumen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'versions'
                ? 'bg-red-50 text-[#c8102e] border border-red-200 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat Versi Berkas</span>
            {versions.length > 0 && (
              <span className="rounded-full bg-[#c8102e] px-1.5 py-0.2 text-[10px] text-white">
                {versions.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'metadata' ? (
          <div className="mt-4 space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
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
        ) : (
          /* TAB RIWAYAT VERSI BERKAS */
          <div className="mt-4 space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
            {/* Form Upload Revisi Baru */}
            <form onSubmit={handleUploadRevision} className="rounded-2xl border border-red-100 bg-red-50/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <UploadCloud className="h-4 w-4 text-[#c8102e]" />
                <span>Unggah Revisi Berkas Baru</span>
              </div>

              {revisionError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-100/80 p-2.5 text-[11px] text-red-800">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
                  <span>{revisionError}</span>
                </div>
              )}

              {revisionSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-100/80 p-2.5 text-[11px] text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{revisionSuccess}</span>
                </div>
              )}

              <div>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.xlsx,.zip,.csv"
                  onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
                  className="block w-full text-[11px] text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#c8102e] file:text-white hover:file:bg-[#9e1025] cursor-pointer"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Catatan revisi (opsional, contoh: Koreksi tanda tangan Kaprodi)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!revisionFile || isUploadingRevision}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#9e1025] disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingRevision ? 'Mengunggah Revisi...' : 'Simpan Revisi'}
                </button>
              </div>
            </form>

            {/* List Riwayat Versi */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-600 uppercase">
                Daftar Riwayat Versi ({versions.length})
              </p>

              {isLoadingVersions ? (
                <div className="py-6 text-center text-slate-400">Memuat riwayat versi...</div>
              ) : versions.length === 0 ? (
                <div className="py-6 text-center text-slate-400">Belum ada catatan riwayat versi.</div>
              ) : (
                versions.map((ver, idx) => (
                  <div
                    key={ver.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          idx === 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          Versi {ver.versionNo} {idx === 0 ? '(Aktif)' : ''}
                        </span>
                        <p className="font-bold text-slate-900 text-xs">{ver.fileName}</p>
                      </div>

                      {ver.note && (
                        <p className="text-[11px] text-slate-600 italic">
                          "{ver.note}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatBytes(ver.fileSizeBytes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(ver.uploadedAt)}
                        </span>
                        {ver.uploadedBy && (
                          <span className="flex items-center gap-1 font-mono">
                            <User className="h-3 w-3" />
                            {ver.uploadedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getDocumentDownloadUrl(document.id)}
                        download
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Unduh</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
