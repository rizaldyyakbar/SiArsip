import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  FileText,
  Edit2,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import type { Lecturer } from '../types';

interface LecturersManagementProps {
  lecturers: Lecturer[];
  onAddLecturer: (data: {
    nip: string;
    name: string;
    email: string;
    phone: string;
    position: string;
  }) => Promise<void>;
  onUpdateLecturer: (
    id: number,
    data: {
      nip: string;
      name: string;
      email: string;
      phone: string;
      position: string;
    }
  ) => Promise<void>;
  onToggleStatus: (id: number) => Promise<void>;
  onDeleteLecturer: (id: number) => Promise<void>;
}

export const LecturersManagement: React.FC<LecturersManagementProps> = ({
  lecturers,
  onAddLecturer,
  onUpdateLecturer,
  onToggleStatus,
  onDeleteLecturer
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

  // Form State
  const [formNip, setFormNip] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPosition, setFormPosition] = useState('Dosen Tetap RPL');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingLecturer(null);
    setFormNip('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPosition('Dosen Tetap RPL');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lec: Lecturer) => {
    setEditingLecturer(lec);
    setFormNip(lec.nip);
    setFormName(lec.name);
    setFormEmail(lec.email || '');
    setFormPhone(lec.phone || '');
    setFormPosition(lec.position || 'Dosen Tetap RPL');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLecturer(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNip.trim() || !formName.trim()) {
      setFormError('NIP dan Nama Dosen wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingLecturer) {
        await onUpdateLecturer(editingLecturer.id, {
          nip: formNip.trim(),
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          position: formPosition.trim()
        });
      } else {
        await onAddLecturer({
          nip: formNip.trim(),
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          position: formPosition.trim()
        });
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data dosen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lec: Lecturer) => {
    if (!window.confirm(`Yakin ingin menghapus dosen "${lec.name}"?`)) return;
    try {
      await onDeleteLecturer(lec.id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus dosen');
    }
  };

  const filteredLecturers = useMemo(() => {
    return lecturers.filter((l) => {
      if (statusFilter === 'aktif' && !l.isActive) return false;
      if (statusFilter === 'nonaktif' && l.isActive) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.nip.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.position && l.position.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [lecturers, search, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-[#ba1a1a]">
              <Users className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-extrabold text-[#111c2d]">Master Data Dosen</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Kelola data staf pengajar prodi RPL untuk penanggung jawab berkas & validasi akreditasi
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#9e1025] hover:shadow-md active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Dosen Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIP, atau jabatan dosen..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(['semua', 'aktif', 'nonaktif'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lecturers Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f0f3ff]/70 text-[11px] font-bold text-[#444651]">
                <th className="py-3.5 pl-5 pr-3">DOSEN & IDENTITAS</th>
                <th className="px-3 py-3.5">JABATAN / PERAN</th>
                <th className="px-3 py-3.5">KONTAK</th>
                <th className="px-3 py-3.5 text-center">DOKUMEN TERKAIT</th>
                <th className="px-3 py-3.5 text-center">STATUS</th>
                <th className="py-3.5 pr-5 pl-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLecturers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data dosen ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau tambah dosen baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLecturers.map((lec) => {
                  const initials = lec.name
                    .replace(/^(Dr\.|Prof\.|Ir\.|Drs\.|Dra\.)\s*/i, '')
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={lec.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & NIP */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#c8102e] to-[#ff7186] text-xs font-bold text-white shadow-2xs">
                            {initials || 'DS'}
                          </div>
                          <div>
                            <p className="font-bold text-[#111c2d] hover:text-[#c8102e] transition-colors">
                              {lec.name}
                            </p>
                            <p className="font-mono text-[11px] text-[#9e1025] font-semibold mt-0.5">
                              NIP: {lec.nip}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-3 py-3.5">
                        <span className="inline-block rounded-md bg-[#f0f3ff] px-2.5 py-1 text-[11px] font-semibold text-[#00236f]">
                          {lec.position || 'Dosen Tetap'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-3.5">
                        <div className="space-y-0.5">
                          {lec.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="font-mono truncate max-w-[180px]">{lec.email}</span>
                            </div>
                          )}
                          {lec.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{lec.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Document count */}
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          <FileText className="h-3 w-3 text-slate-400" />
                          <span>{lec.documentCount ?? 0} berkas</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 text-center">
                        <button
                          onClick={() => onToggleStatus(lec.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            lec.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Klik untuk ubah status aktif/nonaktif"
                        >
                          {lec.isActive ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(lec)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            title="Edit Data Dosen"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lec)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus Dosen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Dosen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#111c2d]">
                {editingLecturer ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP Dosen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  placeholder="Contoh: 198503152010121002"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Dr. Eng. Ratna Indah, S.Kom., M.T."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Posisi di Prodi
                </label>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  placeholder="Contoh: Ketua Program Studi RPL / Dosen Pembimbing TA"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Akademik
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@kampus.ac.id"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#9e1025] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingLecturer ? 'Simpan Perubahan' : 'Tambah Dosen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
