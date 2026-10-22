"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
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
    notes: ''
  });

  const [autoCalculatePrice, setAutoCalculatePrice] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (orderToEdit) {
      setFormData({
        ...orderToEdit,
        date: orderToEdit.date || today,
        printHours: orderToEdit.printHours || 0,
        printMinutes: orderToEdit.printMinutes || 0,
        price: orderToEdit.price || 0
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
        printHours: initialValues.printHours || 2,
        printMinutes: initialValues.printMinutes || 30,
        price: initialValues.price || 0,
        notes: ''
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
        notes: ''
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
  const colors = ['Beyaz', 'Siyah', 'Gri', 'Kırmızı', 'Mavi', 'Yeşil', 'Turuncu', 'Sarı'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">
            {orderToEdit ? 'Siparişi Düzenle' : 'Yeni 3D Baskı Siparişi Ekle'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Sipariş Tarihi</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Satış Kanalı</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-cyan-500"
              >
                {channels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Müşteri / Kullanıcı Adı</label>
              <input
                type="text"
                placeholder="Örn: dolap8058575, ezm..."
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">İş / Marka / Kategori</label>
              <input
                type="text"
                placeholder="Örn: Fiat, Bina, Ayraç, Organizer..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Açıklama / Model Detayı</label>
            <input
              type="text"
              placeholder="Örn: Egea Cross, Panpa 1.4, Yaşasın Cumhuriyet 26 Adet..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Filament Rengi</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {colors.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Üretim Durumu</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Modelleme">Modelleme</option>
                <option value="Baskıya Hazır">Baskıya Hazır</option>
                <option value="Baskıda">Baskıda</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Kargolandı / Teslim">Kargolandı / Teslim</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Baskı Süresi & Fiyat</span>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-cyan-400 cursor-pointer font-normal">
                <input
                  type="checkbox"
                  checked={autoCalculatePrice}
                  onChange={(e) => setAutoCalculatePrice(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700 text-cyan-500"
                />
                <span>Formülle Otomatik Hesapla</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Saat</label>
                <input
                  type="number"
                  min="0"
                  value={formData.printHours}
                  onChange={(e) => setFormData({ ...formData, printHours: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Dakika</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.printMinutes}
                  onChange={(e) => setFormData({ ...formData, printMinutes: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Satış Fiyatı (₺)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs px-4 py-2 rounded-xl transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              {orderToEdit ? 'Değişiklikleri Kaydet' : 'Siparişi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
