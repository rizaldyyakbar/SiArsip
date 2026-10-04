import React, { useState } from 'react';
import { UploadCloud, X, Hash } from 'lucide-react';
import type { DocumentItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tugas Akhir');
  const [documentNumber, setDocumentNumber] = useState('');
  const [nip, setNip] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [accreditationInstrument, setAccreditationInstrument] = useState('2.1');
  const [evidenceType, setEvidenceType] = useState('Dokumen kebijakan / pedoman');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const isAccreditation = category === 'Akreditasi';

  if (!isOpen) return null;

  const handleSimulatedFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        archiveNumber: `ARS-2026-${String(Date.now()).slice(-6)}`,
        documentNumber,
        documentDate,
        academicYear,
        previewUrl,
        accreditationInstrument: isAccreditation ? accreditationInstrument : undefined,
        evidenceType: isAccreditation ? evidenceType : undefined,
        filename: fileName || `[${category.slice(0, 3).toUpperCase()}]_${title.replace(/\s+/g, '_')}_2026.pdf`,
        fileSize: '3.1 MB',
        shaHash: '9a3c...b841',
        category,
        categoryTheme: {
          bg: '#e8f0fe',
          text: '#00236f',
        },
        responsibleIdentifier: `NIP: ${nip}`,
        uploadDate: 'Baru saja',
        status: 'Aktif'
      };

      onSuccess(newDoc);
      setIsUploading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c8102e] text-white">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111c2d]">
                Unggah Dokumen Baru
              </h3>
              <p className="text-xs text-slate-500">
                Penyimpanan arsip digital dengan verifikasi hash SHA-256 otomatis
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* File input drag and drop area */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-[#f9f9ff] p-6 text-center hover:border-[#00236f] transition-colors">
            <UploadCloud className="h-8 w-8 text-[#c8102e]" />
            <p className="mt-2 font-semibold text-slate-800">
              {fileName ? fileName : 'Pilih berkas atau seret ke sini'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Format didukung: PDF, DOCX, XLSX (Maks. 25 MB)
            </p>
            <input
              type="file"
              onChange={handleSimulatedFileDrop}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Form fields */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Judul Dokumen / Nama Berkas
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Laporan Skripsi Implementasi Sistem Arsip..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Dokumen
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
              >
                <option value="Tugas Akhir">Tugas Akhir / Skripsi</option>
                <option value="Laporan PKL">Laporan PKL & Magang</option>
                <option value="Kurikulum & RPS">Kurikulum & RPS</option>
                <option value="SK & Surat">SK & Surat Keputusan</option>
                <option value="Berita Acara">Berita Acara & Nilai</option>
                <option value="Akreditasi">Dokumen Akreditasi</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP Penanggung Jawab
              </label>
              <input
                type="text"
                required={!isAccreditation}
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder={isAccreditation ? 'Opsional jika bukti terkait dosen' : 'Contoh: 198501012010121001'}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. Dokumen Resmi
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Nomor yang tercetak di berkas"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Dokumen
              </label>
              <input
                type="date"
                required
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tahun Akademik
            </label>
            <select
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
            >
              <option value="2026/2027">2026/2027</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

          {isAccreditation && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-red-100 bg-[#fff8f8] p-4 sm:grid-cols-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instrumen Akreditasi
                </label>
                <select
                  value={accreditationInstrument}
                  onChange={(e) => setAccreditationInstrument(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] outline-hidden"
                >
                  <option value="2.1">LAM INFOKOM - Instrumen 2.1</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Bukti
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] outline-hidden"
                >
                  <option>Dokumen kebijakan / pedoman</option>
                  <option>SK atau surat keputusan</option>
                  <option>Berita acara / laporan</option>
                  <option>Bukti pendukung lainnya</option>
                </select>
              </div>
            </div>
          )}

          {/* SHA Integrity preview */}
          <div className="flex items-center gap-2 rounded-xl bg-[#e7eeff] p-3 text-[11px] text-[#00236f]">
            <Hash className="h-4 w-4 shrink-0" />
            <span>Sistem akan mengkalkulasi digest hash SHA-256 saat berkas diproses untuk mencegah duplikasi.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-[#c8102e] px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-[#9e1025] disabled:opacity-50"
            >
              {isUploading ? 'Memproses Berkas...' : 'Unggah & Indeks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
