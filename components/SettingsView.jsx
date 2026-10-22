"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Tag, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Layers
} from 'lucide-react';
import { resetDatabase, updateSettings } from '@/lib/api';

export default function SettingsView({ settings, onSettingsUpdated }) {
  const [newCategory, setNewCategory] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

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
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Google Sheets 'ayarlar' Modülü</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Sistem & Kategori Ayarları</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            İş kategorileri, satış platformları ve veritabanı sıfırlama yönetimi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            title="Google Sheets verilerini yeniden yükle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isResetting ? 'Sıfırlanıyor...' : 'Sheets Verilerine Sıfırla'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Manager */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span>İş & Ürün Kategorileri</span>
            </h3>
            <span className="text-xs text-gray-400">{categories.length} Kategori</span>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Yeni kategori adı (Örn: mimari-maket, figür-anime...)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ekle</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat}
                className="bg-gray-800 border border-gray-700/80 rounded-lg px-3 py-1.5 text-xs text-gray-300 flex items-center gap-2"
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-gray-500 hover:text-red-400 p-0.5 transition"
                  title="Kategoriyi Sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Channels & Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-gray-800">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Satış Kanalları & Entegrasyonlar</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Sipariş kabul ettiğiniz aktif platformlar.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {channels.map((ch) => (
              <div 
                key={ch} 
                className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 text-center"
              >
                <span className="text-xs font-bold uppercase text-white block">{ch}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Aktif Kanal</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 text-xs text-gray-300 space-y-1">
            <span className="font-bold text-cyan-400 block mb-1">Turso + Next.js Veri Bütünlüğü:</span>
            <p>
              Bu sistem, Google Sheets projenizdeki 5 sayfayı (<code>Sipariş</code>, <code>tanımlar</code>, <code>ayarlar</code>, <code>trendyol satış</code>, <code>Nakit Kasa</code>) Turso Serverless SQLite veritabanına bağlamıştır. Vercel üzerinde %100 kalıcıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
