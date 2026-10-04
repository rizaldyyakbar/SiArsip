import React, { useState } from 'react';
import { Calendar, X, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface AddAcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (year: string, semester: 'Ganjil' | 'Genap') => Promise<void>;
}

export const AddAcademicYearModal: React.FC<AddAcademicYearModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanYear = year.trim();
    if (!cleanYear) {
      setErrorMsg('Tahun akademik wajib diisi');
      return;
    }
    // Validasi format tahun (misal: 2026/2027)
    if (!/^\d{4}\/\d{4}$/.test(cleanYear)) {
      setErrorMsg('Format tahun harus YYYY/YYYY (contoh: 2026/2027)');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(cleanYear, semester);
      setYear('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan tahun akademik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00236f] text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111c2d]">
                Tambah Tahun Akademik
              </h3>
              <p className="text-xs text-slate-500">
                Master data acuan semester dan pengarsipan berkas
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tahun Akademik <span className="text-[#c8102e]">*</span>
            </label>
            <input
              type="text"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Contoh: 2027/2028"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] outline-hidden font-mono"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Gunakan format tahun ajaran dengan garis miring (e.g. 2027/2028)
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Semester <span className="text-[#c8102e]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSemester('Ganjil')}
                className={`flex items-center justify-center rounded-xl py-2.5 font-semibold text-xs border transition-all ${
                  semester === 'Ganjil'
                    ? 'border-[#00236f] bg-[#e8f0fe] text-[#00236f]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Ganjil (Gasal)
              </button>
              <button
                type="button"
                onClick={() => setSemester('Genap')}
                className={`flex items-center justify-center rounded-xl py-2.5 font-semibold text-xs border transition-all ${
                  semester === 'Genap'
                    ? 'border-[#00236f] bg-[#e8f0fe] text-[#00236f]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Genap
              </button>
            </div>
          </div>

          {/* Label Preview */}
          {year && (
            <div className="rounded-xl bg-[#f0f3ff] p-3 text-slate-600">
              <span className="text-[11px] text-slate-400 block">Label yang akan dibuat:</span>
              <span className="font-mono font-bold text-xs text-[#00236f]">
                {year.trim()} {semester}
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[11px] text-[#ba1a1a] border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-[#9e1025] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Simpan Master</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
