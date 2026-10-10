import React, { useState } from 'react';
import {
  FolderArchive,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { login } from '../api/auth';
import type { UserAccount } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickLogins = [
    {
      role: 'Kaprodi',
      name: 'Dr. Eng. Ratna Indah',
      badge: 'Kaprodi',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      user: 'kaprodi',
      pass: 'kaprodi123'
    },
    {
      role: 'Dosen',
      name: 'Ahmad Fauzi, M.Kom.',
      badge: 'Dosen Tetap',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      user: 'dosen',
      pass: 'dosen123'
    },
    {
      role: 'Staf Prodi',
      name: 'Staf Administrasi RPL',
      badge: 'Staf Prodi',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      user: 'staf',
      pass: 'staf123'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap isi username atau NIP dan kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(username.trim(), password.trim());
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali username dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 selection:bg-[#c8102e] selection:text-white sm:px-6 lg:px-8">
      {/* Dynamic Background pattern & glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#c8102e]/20 blur-[130px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-rose-600/15 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-slate-800/40 blur-[160px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Top Brand Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9b0d23] via-[#c8102e] to-[#ff4d6d] shadow-lg shadow-[#c8102e]/30 ring-4 ring-red-100">
              <FolderArchive className="h-8 w-8 text-white" />
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
              SiArsip Digital
            </h1>
            <p className="mt-1 text-xs font-bold tracking-wider text-[#c8102e] uppercase">
              Prodi Rekayasa Perangkat Lunak
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Sistem Informasi Arsip & Bukti Akreditasi LAM INFOKOM
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-800 animate-in fade-in zoom-in-95">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Username atau NIP Dosen
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. kaprodi atau 198503152010121002"
                  disabled={isLoading}
                  autoComplete="username"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-4 pl-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-10 pl-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9b0d23] via-[#c8102e] to-[#ba1a1a] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#c8102e]/25 hover:from-[#820a1c] hover:to-[#a01616] hover:shadow-xl hover:shadow-[#c8102e]/35 focus:ring-2 focus:ring-[#c8102e] focus:ring-offset-2 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memverifikasi akun...</span>
                </div>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Lecturer & Testing */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#c8102e]" />
                Akun Demo & Uji Coba:
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk isi instan</span>
            </div>

            <div className="mt-3 space-y-2">
              {quickLogins.map((item) => (
                <button
                  key={item.user}
                  type="button"
                  onClick={() => fillQuickLogin(item.user, item.pass)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-left hover:border-[#c8102e]/40 hover:bg-red-50/40 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 group-hover:border-[#c8102e] group-hover:text-[#c8102e]">
                      {item.role.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        user: <span className="font-semibold text-slate-700">{item.user}</span> | pass: <span className="font-semibold text-slate-700">{item.pass}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Security Info */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Terotentikasi & terlindungi SHA-256 / JWT</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          Proyek KP — Arsip Digital Rekayasa Perangkat Lunak &copy; 2026
        </p>
      </div>
    </div>
  );
};
