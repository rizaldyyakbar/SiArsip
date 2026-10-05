import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Search,
  FileText,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Palette
} from 'lucide-react';
import type { CategoryItem } from '../types';

interface CategoriesManagementProps {
  categories: CategoryItem[];
  onAddCategory: (data: {
    name: string;
    code: string;
    description: string;
    colorBg: string;
    colorText: string;
  }) => Promise<void>;
  onUpdateCategory: (
    id: number,
    data: {
      name: string;
      code: string;
      description: string;
      colorBg: string;
      colorText: string;
    }
  ) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

const COLOR_PRESETS = [
  { label: 'Crimson Red', bg: '#fff0f2', text: '#ba1a1a' },
  { label: 'Navy Blue', bg: '#f0f3ff', text: '#00236f' },
  { label: 'Emerald Green', bg: '#e7f9ef', text: '#056434' },
  { label: 'Amber Orange', bg: '#fff8e1', text: '#b25e00' },
  { label: 'Royal Purple', bg: '#f3e8ff', text: '#6b21a8' },
  { label: 'Teal Cyan', bg: '#e0f7fa', text: '#006064' },
  { label: 'Indigo Sky', bg: '#e8eaf6', text: '#1a237e' },
  { label: 'Rose Pink', bg: '#fce4ec', text: '#880e4f' },
];

export const CategoriesManagement: React.FC<CategoriesManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColorBg, setFormColorBg] = useState('#fff0f2');
  const [formColorText, setFormColorText] = useState('#ba1a1a');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormColorBg('#fff0f2');
    setFormColorText('#ba1a1a');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormCode(cat.code);
    setFormDescription(cat.description || '');
    setFormColorBg(cat.colorBg || '#fff0f2');
    setFormColorText(cat.colorText || '#ba1a1a');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setFormError('Nama dan Kode Kategori wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          description: formDescription.trim(),
          colorBg: formColorBg,
          colorText: formColorText
        });
      } else {
        await onAddCategory({
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          description: formDescription.trim(),
          colorBg: formColorBg,
          colorText: formColorText
        });
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) return;
    try {
      await onDeleteCategory(cat.id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kategori');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [categories, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#6b21a8]">
              <Tags className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-extrabold text-[#111c2d]">Master Kategori & Tag</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Klasifikasi tipe arsip akademik prodi RPL dengan kustomisasi tema badge warna
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#9e1025] hover:shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori Baru</span>
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
            placeholder="Cari nama atau kode kategori..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-800">{categories.length}</span> kategori terdaftar
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <span
                  className="rounded-lg px-3 py-1 text-xs font-bold shadow-2xs"
                  style={{
                    backgroundColor: cat.colorBg || '#fff0f2',
                    color: cat.colorText || '#ba1a1a'
                  }}
                >
                  {cat.name}
                </span>

                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {cat.code}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {cat.description || 'Tidak ada deskripsi untuk kategori ini.'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>{cat.documentCount ?? 0} berkas terarsip</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  title="Edit Kategori"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#111c2d]">
                {editingCategory ? 'Edit Data Kategori' : 'Tambah Kategori Baru'}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Sertifikasi Kompetensi"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Singkatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="SKOMP"
                    maxLength={10}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono uppercase text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Penjelasan berkas atau peruntukan dokumen dalam kategori ini..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
                />
              </div>

              {/* Tema Badge & Pilihan Warna */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#c8102e]" />
                  <span>Pilihan Warna Tema Badge</span>
                </label>

                {/* Preset Palettes */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFormColorBg(preset.bg);
                        setFormColorText(preset.text);
                      }}
                      className={`flex items-center gap-2 rounded-xl p-2 text-[11px] font-semibold transition-all border ${
                        formColorBg === preset.bg && formColorText === preset.text
                          ? 'border-[#c8102e] ring-2 ring-[#c8102e]/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.text }}
                      />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Live Preview */}
                <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Pratinjau Badge:</span>
                  <span
                    className="rounded-lg px-3 py-1 text-xs font-bold shadow-2xs"
                    style={{
                      backgroundColor: formColorBg,
                      color: formColorText
                    }}
                  >
                    {formName.trim() || 'Contoh Kategori'} ({formCode.trim() || 'KOD'})
                  </span>
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
                  {isSubmitting ? 'Menyimpan...' : editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
