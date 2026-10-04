import React, { useState } from 'react';
import { UploadCloud, X, Hash, AlertCircle, Loader2 } from 'lucide-react';
import type { DocumentItem, AcademicYearMaster, LamInfokomCriterion } from '../types';
import { mockAcademicYears, mockLamInfokomCriteria } from '../mockData';
import { getCategoryTheme } from '../api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
  onUpload?: (
    formData: FormData,
    simulatedDoc: DocumentItem
  ) => Promise<{ success: boolean; conflict?: any }>;
  academicYears?: AcademicYearMaster[];
  criteria?: LamInfokomCriterion[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onUpload,
  academicYears = mockAcademicYears,
  criteria = mockLamInfokomCriteria
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tugas Akhir');
  const [documentNumber, setDocumentNumber] = useState('');
  const [nip, setNip] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [academicYear, setAcademicYear] = useState(
    academicYears.find((ay) => ay.isActive)?.label || academicYears[0]?.label || '2026/2027 Ganjil'
  );
  const [accreditationInstrument, setAccreditationInstrument] = useState('LAM INFOKOM 2.1');
  const [accreditationCriterion, setAccreditationCriterion] = useState(
    criteria[0]?.title || 'C.1 - Visi, Misi, Tujuan, dan Strategi (VMTS)'
  );
  const [evidenceType, setEvidenceType] = useState('Dokumen kebijakan / pedoman');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isAccreditation = category === 'Akreditasi';

  if (!isOpen) return null;

  const handleSimulatedFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg(null);

    const activeAY = academicYear || academicYears[0]?.label || '2026/2027 Ganjil';
    const cleanDate = documentDate || new Date().toISOString().slice(0, 10);
    const simulatedDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      archiveNumber: `ARS-2026-${String(Date.now()).slice(-6)}`,
      documentNumber,
      documentDate: cleanDate,
      academicYear: activeAY,
      previewUrl,
      accreditationInstrument: isAccreditation ? accreditationInstrument : undefined,
      accreditationCriterion: isAccreditation ? accreditationCriterion : undefined,
      evidenceType: isAccreditation ? evidenceType : undefined,
      filename: fileName || `[${category.slice(0, 3).toUpperCase()}]_${title.replace(/\s+/g, '_')}_2026.pdf`,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.1 MB',
      shaHash: '9a3c...b841',
      category,
      categoryTheme: getCategoryTheme(category),
      responsibleIdentifier: nip ? `NIP: ${nip}` : 'Unit Akademik RPL',
      uploadDate: 'Baru saja',
      status: 'Aktif'
    };

    try {
      if (onUpload) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('document_number', documentNumber);
        formData.append('document_date', cleanDate);
        formData.append('academic_year', activeAY);
        if (nip) formData.append('nip', nip);
        if (isAccreditation) {
          if (accreditationInstrument) formData.append('accreditation_instrument', accreditationInstrument);
          if (accreditationCriterion) formData.append('accreditation_criterion', accreditationCriterion);
          if (evidenceType) formData.append('evidence_type', evidenceType);
        }
        if (selectedFile) {
          formData.append('file', selectedFile);
        } else {
          const blob = new Blob([`Berkas: ${title}\nNo: ${documentNumber}\nTgl: ${cleanDate}`], {
            type: 'application/pdf'
          });
          formData.append('file', blob, `${title.replace(/\s+/g, '_')}.pdf`);
        }

        const res = await onUpload(formData, simulatedDoc);
        if (res.success) {
          onSuccess(simulatedDoc);
          onClose();
        } else if (res.conflict) {
          onClose();
        }
      } else {
        onSuccess(simulatedDoc);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah berkas. Periksa koneksi backend.');
    } finally {
      setIsUploading(false);
    }
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
                NIP Dosen Penanggung Jawab
              </label>
              <input
                type="text"
                required={!isAccreditation}
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: 198501012010121001"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Cukup masukkan NIP (nama dosen tidak diperlukan)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. Dokumen Resmi <span className="text-[#c8102e]">*</span>
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Contoh: 004/TA/RPL/IX/2026"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Dokumen <span className="text-[#c8102e]">*</span>
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
              Master Data Tahun Akademik <span className="text-[#c8102e]">*</span>
            </label>
            <select
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.label}>
                  {ay.label} {ay.isActive ? '(Aktif Saat Ini)' : ''}
                </option>
              ))}
            </select>
          </div>

          {isAccreditation && (
            <div className="space-y-3 rounded-2xl border border-red-100 bg-[#fff8f8] p-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e1025]">
                  Akreditasi LAM INFOKOM (Instrumen 2.1)
                </span>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#9e1025]">
                  IAPS 2.1
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Instrumen Akreditasi
                  </label>
                  <select
                    value={accreditationInstrument}
                    onChange={(e) => setAccreditationInstrument(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] outline-hidden"
                  >
                    <option value="LAM INFOKOM 2.1">LAM INFOKOM - Instrumen 2.1</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kriteria LAM INFOKOM 2.1
                  </label>
                  <select
                    value={accreditationCriterion}
                    onChange={(e) => setAccreditationCriterion(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] outline-hidden"
                  >
                    {criteria.map((c) => (
                      <option key={c.code} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Bukti Dokumen
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] outline-hidden"
                >
                  <option>Laporan Evaluasi Diri (LED)</option>
                  <option>Dokumen kebijakan / pedoman / SOP</option>
                  <option>SK Penetapan / Surat Tugas</option>
                  <option>Berita Acara / Laporan Kinerja</option>
                  <option>Dokumen Kurikulum & RPS</option>
                  <option>Bukti Pendukung Tambahan</option>
                </select>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[11px] text-[#ba1a1a] border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
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
              disabled={isUploading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-[#9e1025] disabled:opacity-50 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Berkas...</span>
                </>
              ) : (
                <span>Unggah & Indeks</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
