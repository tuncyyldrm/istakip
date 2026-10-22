"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Tag, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Layers,
  Lock,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { resetDatabase, updateSettings, changePassword } from '@/lib/api';

export default function SettingsView({ settings, onSettingsUpdated }) {
  const [newCategory, setNewCategory] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  const categories = settings?.categories || [];
  const channels = settings?.channels || [];

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const cat = newCategory.trim();
    if (categories.includes(cat)) return;
    const updated = [...categories, cat];
    try {
      const res = await updateSettings({ categories: updated });
      if (res.success) {
        onSettingsUpdated(res.data);
        setNewCategory('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteCategory(cat) {
    const updated = categories.filter(c => c !== cat);
    try {
      const res = await updateSettings({ categories: updated });
      if (res.success) {
        onSettingsUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifre en az 4 karakter olmalıdır.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifreler birbiriyle uyuşmuyor.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: res.message || 'Şifre başarıyla güncellendi!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.message || 'Şifre değiştirilemedi.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Sunucu hatası oluştu.' });
      console.error(err);
    } finally {
      setIsChangingPass(false);
    }
  }

  async function handleResetData() {
    if (!window.confirm('Veritabanını Google Sheets projesindeki orijinal verilere sıfırlamak istediğinize emin misiniz?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await resetDatabase();
      if (res.success) {
        setStatusMsg('Veriler Google Sheets orijinal haline başarıyla sıfırlandı!');
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Sistem & Güvenlik Yapılandırması</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sistem & Kategori Ayarları</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            İş kategorileri, satış platformları ve şifre/güvenlik yönetimi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="bg-red-50 hover:bg-red-100 dark:bg-red-600/20 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            title="Google Sheets verilerini yeniden yükle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isResetting ? 'Sıfırlanıyor...' : 'Sheets Verilerine Sıfırla'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Security Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Giriş Şifresini Değiştir</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              Aktif Koruma
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Paneli internete (Vercel) aldığınızda yabancıların erişmemesi için şifrenizi güncelleyin:
          </p>

          {passwordMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${
              passwordMsg.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Mevcut Şifre</label>
              <input
                type="password"
                placeholder="Mevcut şifreniz (varsayılan: 123456)"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  placeholder="En az 4 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  placeholder="Yeni şifreyi onaylayın"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition active:scale-98 disabled:opacity-50"
            >
              {isChangingPass ? 'Güncelleniyor...' : 'Yeni Şifreyi Kaydet'}
            </button>
          </form>
        </div>

        {/* Categories Manager */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>İş & Ürün Kategorileri</span>
            </h3>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{categories.length} Kategori</span>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Yeni kategori adı (Örn: mimari-maket, figür-anime...)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ekle</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat}
                className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 shadow-sm"
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-gray-400 hover:text-red-500 p-0.5 transition"
                  title="Kategoriyi Sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Channels & Info */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Aktif Satış Platformları</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sipariş kabul ettiğiniz aktif platformlar ve kanallar.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {channels.map((ch) => (
              <div 
                key={ch} 
                className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-center shadow-sm"
              >
                <span className="text-xs font-bold uppercase text-gray-900 dark:text-white block">{ch}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Aktif Kanal</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-4 text-xs text-gray-700 dark:text-gray-300">
            <span className="font-bold text-blue-700 dark:text-cyan-400 block mb-1">Turso Cloud & Vercel Güvencesi:</span>
            <p>
              Bu sistem Google Sheets tablonuzdaki 5 sayfayı (<code>Sipariş</code>, <code>tanımlar</code>, <code>ayarlar</code>, <code>trendyol satış</code>, <code>Nakit Kasa</code>) Turso Serverless SQLite veritabanına bağlamıştır. Vercel üzerinde %100 kalıcıdır ve şifre korumalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
