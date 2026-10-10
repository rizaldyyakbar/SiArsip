import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  GraduationCap,
  Briefcase,
  AlertCircle,
  X,
  Phone,
  Mail
} from 'lucide-react';
import {
  fetchUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  type CreateUserData
} from '../api/users';
import type { UserAccount, UserRole } from '../types';

interface UserManagementProps {
  currentUser?: UserAccount | null;
  onShowToast: (msg: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
  onShowToast
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form states - Create
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('dosen');
  const [newNip, setNewNip] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - Reset Password
  const [newResetPassword, setNewResetPassword] = useState('');

  const loadUserList = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      console.warn('Gagal memuat pengguna:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserList();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'Semua' && u.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.nip && u.nip.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    });
  }, [users, roleFilter, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      setFormError('Username, Password, dan Nama Lengkap wajib diisi.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setFormError('Password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserData = {
        username: newUsername.trim(),
        password: newPassword.trim(),
        name: newName.trim(),
        role: newRole,
        nip: newNip.trim() || undefined,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined
      };
      await createUser(payload);
      onShowToast(`Pengguna '${payload.name}' berhasil dibuat.`);
      setIsAddModalOpen(false);
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewNip('');
      setNewEmail('');
      setNewPhone('');
      setNewRole('dosen');
      await loadUserList();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        nip: editingUser.nip || undefined,
        email: editingUser.email || undefined,
        phone: editingUser.phone || undefined,
        isActive: editingUser.isActive
      });
      onShowToast(`Data pengguna '${editingUser.name}' diperbarui.`);
      setEditingUser(null);
      await loadUserList();
    } catch (err: any) {
      onShowToast(`Gagal update: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newResetPassword.trim().length < 6) {
      onShowToast('Password baru minimal 6 karakter');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetUserPassword(resettingUser.id, newResetPassword.trim());
      onShowToast(`Password untuk '${resettingUser.name}' berhasil direset.`);
      setResettingUser(null);
      setNewResetPassword('');
    } catch (err: any) {
      onShowToast(`Gagal reset password: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(deletingUser.id);
      onShowToast(`Pengguna '${deletingUser.name}' berhasil dihapus.`);
      setDeletingUser(null);
      await loadUserList();
    } catch (err: any) {
      onShowToast(`Gagal menghapus: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'kaprodi':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-[#c8102e] border border-red-200">
            <Shield className="h-3 w-3" />
            Kaprodi
          </span>
        );
      case 'dosen':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
            <GraduationCap className="h-3 w-3" />
            Dosen Tetap
          </span>
        );
      case 'staf_prodi':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <Briefcase className="h-3 w-3" />
            Staf Prodi
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Kelola Pengguna Sistem
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Daftar akun pengguna untuk Kaprodi, Dosen Tetap, dan Staf Administrasi Prodi RPL
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9b0d23] to-[#c8102e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#c8102e]/20 hover:from-[#820a1c] hover:to-[#a01616] transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Pengguna</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-red-600 uppercase">Kaprodi</p>
          <p className="mt-1 text-2xl font-black text-[#c8102e]">
            {users.filter((u) => u.role === 'kaprodi').length}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-blue-600 uppercase">Dosen Tetap</p>
          <p className="mt-1 text-2xl font-black text-blue-700">
            {users.filter((u) => u.role === 'dosen').length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase">Staf Prodi</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {users.filter((u) => u.role === 'staf_prodi').length}
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, username, NIP, atau email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#c8102e] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#c8102e] focus:outline-none"
          >
            <option value="Semua">Semua Peran</option>
            <option value="kaprodi">Kaprodi</option>
            <option value="dosen">Dosen Tetap</option>
            <option value="staf_prodi">Staf Prodi</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Peran / Hak Akses</th>
                <th className="px-5 py-3.5">Kontak</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    Tidak ada pengguna yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-xs font-bold text-white shadow-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {user.name}
                          </p>
                          <p className="mt-0.5 text-[11px] font-mono text-slate-500">
                            @{user.username} {user.nip ? `• NIP: ${user.nip}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
                        {user.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {!user.email && !user.phone && (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                          <XCircle className="h-3 w-3" />
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setResettingUser(user);
                            setNewResetPassword('');
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingUser({ ...user })}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          disabled={currentUser?.id === user.id}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Akun Pengguna Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. hendra.wijaya"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Hendra Wijaya, Ph.D."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Peran (Role) *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  >
                    <option value="dosen">Dosen Tetap</option>
                    <option value="kaprodi">Ketua Prodi (Kaprodi)</option>
                    <option value="staf_prodi">Staf Administrasi Prodi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="e.g. 198811252015041002"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@kampus.ac.id"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="081234567890"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#a01616] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pengguna */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Pengguna: @{editingUser.username}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Peran</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  >
                    <option value="dosen">Dosen Tetap</option>
                    <option value="kaprodi">Ketua Prodi (Kaprodi)</option>
                    <option value="staf_prodi">Staf Administrasi Prodi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">NIP</label>
                  <input
                    type="text"
                    value={editingUser.nip || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, nip: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">No. Telepon</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#c8102e] focus:ring-[#c8102e]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Akun Aktif (Bisa Login)</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#a01616] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Reset Password Pengguna
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Masukkan password baru untuk akun <strong>{resettingUser.name}</strong> (@{resettingUser.username})
            </p>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Mereset...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Hapus Akun Pengguna?
            </h3>
            <p className="mt-1.5 text-xs text-slate-500">
              Akun <strong>{deletingUser.name}</strong> (@{deletingUser.username}) akan dihapus secara permanen dari sistem.
            </p>

            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
