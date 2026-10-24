"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, UploadCloud, Trash2, Image as ImageIcon, Sparkles, FileText, Tag, User } from 'lucide-react';
import { calculateCost } from '@/lib/api';

export default function NewOrderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  orderToEdit, 
  initialValues, 
  settings 
}) {
  const [formData, setFormData] = useState({
    date: '',
    channel: 'lokal',
    customer: '',
    title: '',
    description: '',
    color: 'Beyaz',
    status: 'Modelleme',
    printHours: 2,
    printMinutes: 30,
    price: 180,
    notes: '',
    image: ''
  });

  const [autoCalculatePrice, setAutoCalculatePrice] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (orderToEdit) {
      setFormData({
        ...orderToEdit,
        date: orderToEdit.date || today,
        printHours: orderToEdit.printHours ?? 0,
        printMinutes: orderToEdit.printMinutes ?? 0,
        price: orderToEdit.price ?? 0,
        notes: orderToEdit.notes || '',
        image: orderToEdit.image || ''
      });
    } else if (initialValues) {
      setFormData({
        date: initialValues.date || today,
        channel: initialValues.channel || 'lokal',
        customer: initialValues.customer || '',
        title: initialValues.title || '',
        description: initialValues.description || '',
        color: initialValues.color || 'Beyaz',
        status: initialValues.status || 'Modelleme',
        printHours: initialValues.printHours ?? 2,
        printMinutes: initialValues.printMinutes ?? 30,
        price: initialValues.price ?? 180,
        notes: initialValues.notes || '',
        image: initialValues.image || ''
      });
    } else {
      setFormData({
        date: today,
        channel: 'lokal',
        customer: '',
        title: '',
        description: '',
        color: 'Beyaz',
        status: 'Modelleme',
        printHours: 2,
        printMinutes: 30,
        price: 180,
        notes: '',
        image: ''
      });
    }
  }, [orderToEdit, initialValues, isOpen]);

  useEffect(() => {
    if (autoCalculatePrice) {
      calculateCost(formData.printHours, formData.printMinutes).then((res) => {
        if (res.success && res.data) {
          setFormData(prev => ({
            ...prev,
            price: formData.channel === 'trendyol' ? res.data.trendyolPrice : res.data.localPrice
          }));
        }
      });
    }
  }, [formData.printHours, formData.printMinutes, formData.channel, autoCalculatePrice]);

  if (!isOpen) return null;

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
          setFormData(prev => ({ ...prev, image: webpDataUrl }));
        } catch (err) {
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, image: jpegDataUrl }));
        }
        setCompressing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setFormData(prev => ({ ...prev, image: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Lütfen bir iş / model başlığı girin.');
      return;
    }
    onSave(formData);
    onClose();
  }

  const channels = settings?.channels || ['lokal', 'dolap', 'trendyol', 'web', 'özel'];
  const colors = [
    'Beyaz', 'Siyah', 'Gri', 'Kırmızı', 'Mavi', 'Yeşil', 'Turuncu', 'Sarı', 
    'Gümüş / İpek', 'Altın / Bronz', 'Şeffaf / Naturel'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {orderToEdit ? `Siparişi Düzenle (${orderToEdit.id})` : 'Yeni 3D Baskı Siparişi Ekle'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* Row 1: Date & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Sipariş Tarihi
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Satış Kanalı
              </label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white uppercase font-bold focus:outline-none focus:border-orange-500 transition cursor-pointer"
              >
                {channels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Customer & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Müşteri / Kullanıcı Adı
              </label>
              <input
                type="text"
                placeholder="Örn: dolap8058575, ezm, mehmet..."
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                İş / Model Başlığı <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Fiat Logo, Bina Maketi, Ayraç..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-orange-500 transition"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Model Detayı / Açıklama
            </label>
            <input
              type="text"
              placeholder="Örn: Egea Cross, Panpa 1.4, Yaşasın Cumhuriyet 26 Adet..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Model Görseli / 3D Render (Opsiyonel)
            </label>

            {formData.image ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 flex items-center gap-3 shadow-inner">
                <img
                  src={formData.image}
                  alt="Önizleme"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Görsel Yüklendi</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                    ✓ WebP olarak optimize edildi (~100 KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold transition"
                  title="Görseli Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 rounded-2xl p-3 flex items-center justify-center gap-2 cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {compressing ? (
                  <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    <span>Görsel optimize ediliyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    <UploadCloud className="w-4 h-4 shrink-0 text-orange-500" />
                    <span className="font-semibold">Fotoğraf veya 3D Render Yükle</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">(Otomatik WebP)</span>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* Color & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Filament Rengi
              </label>
              <div className="relative">
                <select
                  value={colors.includes(formData.color) ? formData.color : 'Özel'}
                  onChange={(e) => {
                    if (e.target.value !== 'Özel') {
                      setFormData({ ...formData, color: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-orange-500 transition cursor-pointer"
                >
                  {colors.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                  <option value="Özel">Diğer / Özel Renk</option>
                </select>
              </div>
              {!colors.includes(formData.color) && (
                <input
                  type="text"
                  placeholder="Renk adı yazın..."
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1.5 w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Üretim Durumu
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-orange-500 transition cursor-pointer"
              >
                <option value="Modelleme">Modelleme</option>
                <option value="Baskıya Hazır">Baskıya Hazır</option>
                <option value="Baskıda">Baskıda</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Kargolandı / Teslim">Kargolandı / Teslim</option>
              </select>
            </div>
          </div>

          {/* Special Notes & Instructions (Previously Missing) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Sipariş & Üretim Notu (Opsiyonel)
            </label>
            <textarea
              rows="2"
              placeholder="Örn: Dolgu %25, nozül 0.4mm, vida yuvası temizlensin, müşteri acil kargo rica etti..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Time & Price Calculator Strip */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span>Baskı Süresi & Satış Fiyatı</span>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-orange-600 dark:text-orange-400 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={autoCalculatePrice}
                  onChange={(e) => setAutoCalculatePrice(e.target.checked)}
                  className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-0 cursor-pointer"
                />
                <span>Formülle Otomatik Hesapla</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Saat</label>
                <input
                  type="number"
                  min="0"
                  value={formData.printHours === 0 ? '0' : formData.printHours || ''}
                  onChange={(e) => setFormData({ ...formData, printHours: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Dakika</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.printMinutes === 0 ? '0' : formData.printMinutes || ''}
                  onChange={(e) => setFormData({ ...formData, printMinutes: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Fiyat (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price === 0 ? '0' : formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-black focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/25 active:scale-95"
            >
              {orderToEdit ? 'Değişiklikleri Kaydet' : 'Siparişi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
