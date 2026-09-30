import React from 'react';
import { X, ShieldAlert, FileText } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (action: string) => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  onClose,
  onResolve
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-[#ba1a1a]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111c2d]">
                  Resolusi Konflik Duplikasi SHA-256
                </h3>
                <span className="rounded-md bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold text-[#93000a]">
                  HASH MATCH
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Integritas berkas mendeteksi checksum identik 100% pada repositori
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

        {/* SHA comparison box */}
        <div className="mt-5 rounded-2xl bg-[#f0f3ff] p-4 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700">Identical Cryptographic Signature</span>
            <span className="font-mono font-bold text-[#00236f]">SHA-256 Algorithm</span>
          </div>
          <div className="mt-2 rounded-xl bg-white p-3 font-mono text-[11px] text-slate-800 break-all border border-slate-200">
            e8f2b79c31405a81e9f12d8a5431cd6e9021b34fae891b2c4e5f7a8b9c0d1e2f
          </div>
        </div>

        {/* Side-by-side files */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* File Baru */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
            <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#93000a] uppercase">
              Berkas Baru Diunggah
            </span>
            <div className="mt-2 flex items-start gap-2.5">
              <FileText className="h-5 w-5 text-[#ba1a1a] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900 break-all">
                  TA_220401048_Aditya_REV2.pdf
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Ukuran: 4.2 MB • Diunggah: 28 Sep 2026, 14:10
                </p>
                <p className="text-[11px] text-slate-500">
                  Oleh: Aditya Pratama (Mahasiswa)
                </p>
              </div>
            </div>
          </div>

          {/* File Eksisting */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#00236f] uppercase">
              Berkas Eksisting di Repositori
            </span>
            <div className="mt-2 flex items-start gap-2.5">
              <FileText className="h-5 w-5 text-[#00236f] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900 break-all">
                  TA_220401048_Final.pdf
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Ukuran: 4.2 MB • Terindeks: 15 Agu 2026
                </p>
                <p className="text-[11px] text-slate-500">
                  Status: Berkas Resmi Tugas Akhir
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action recommendations */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4 text-xs font-semibold">
          <button
            onClick={() => onResolve('tolak')}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
          >
            Tolak Berkas Baru
          </button>
          <button
            onClick={() => onResolve('versi')}
            className="rounded-xl bg-[#f0f3ff] px-4 py-2.5 text-[#00236f] hover:bg-[#dee8ff]"
          >
            Arsipkan Sebagai Revisi
          </button>
          <button
            onClick={() => onResolve('timpa')}
            className="rounded-xl bg-[#ba1a1a] px-4 py-2.5 text-white shadow-xs hover:bg-[#93000a]"
          >
            Timpa & Perbarui Metadata
          </button>
        </div>
      </div>
    </div>
  );
};
