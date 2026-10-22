"use client";

import React, { useState } from 'react';
import { Lock, Printer, ArrowRight, Eye, EyeOff, Sun, Moon, Sparkles, ShieldCheck } from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginScreen({ onLoginSuccess, theme, toggleTheme }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(password);
      if (res.success && res.token) {
        localStorage.setItem('istakip_auth_token', res.token);
        onLoginSuccess();
      } else {
        setErrorMsg(res.message || 'Hatalı şifre girdiniz.');
      }
    } catch (err) {
      setErrorMsg('Giriş yapılırken sunucu hatası oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 shadow-sm transition"
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl relative z-10 transition-colors">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            3D Baskı İşTakip
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Güvenli Atölye Yönetim Paneli</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
              Panel Giriş Şifresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifrenizi girin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Panele Giriş Yap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Default Password Hint */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-400 text-xs border border-blue-200 dark:border-blue-900/60 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Varsayılan Şifre: <strong>123456</strong></span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Giriş yaptıktan sonra <strong>Ayarlar</strong> bölümünden şifrenizi istediğiniz zaman değiştirebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
