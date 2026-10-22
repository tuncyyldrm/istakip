"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function NewSaleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  saleToEdit 
}) {
  const [isExpense, setIsExpense] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    isExpenseRow: false,
    expenseTitle: '',
    salePrice: 450,
    vatRate: 0.20,
    commissionRate: 0.04,
    realCost: 55,
    cargoBase: 95.54,
    cargoVatRate: 0.20,
    extraExpense: 13.19,
    partnerFixed: 0,
    deduction: 0
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (saleToEdit) {
      setIsExpense(Boolean(saleToEdit.isExpenseRow));
      setFormData({
        ...saleToEdit,
        date: saleToEdit.date || today,
        salePrice: saleToEdit.salePrice || 0,
        realCost: saleToEdit.realCost || 0,
        cargoBase: saleToEdit.cargoBase || 95.54,
        extraExpense: saleToEdit.extraExpense || 0,
        partnerFixed: saleToEdit.partnerFixed || 0,
        deduction: saleToEdit.deduction || 0
      });
    } else {
      setIsExpense(false);
      setFormData({
        date: today,
        isExpenseRow: false,
        expenseTitle: '',
        salePrice: 450,
        vatRate: 0.20,
        commissionRate: 0.04,
        realCost: 55,
        cargoBase: 95.54,
        cargoVatRate: 0.20,
        extraExpense: 13.19,
        partnerFixed: 0,
        deduction: 0
      });
    }
  }, [saleToEdit, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...formData,
      isExpenseRow: isExpense
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            {saleToEdit ? 'Finans Kaydını Düzenle' : 'Yeni Satış veya Mahsuplaşma Satırı Ekle'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsExpense(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                !isExpense ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Normal Trendyol Satışı
            </button>
            <button
              type="button"
              onClick={() => setIsExpense(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                isExpense ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Harici Masraf / Mahsuplaşma
            </button>
          </div>

          {!isExpense ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Satış Tarihi</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Satış Fiyatı (KDV Dahil)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Komisyon (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(formData.commissionRate * 100).toFixed(1)}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) / 100 })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Gerçek Maliyet (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.realCost}
                    onChange={(e) => setFormData({ ...formData, realCost: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Kargo Matrah (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cargoBase}
                    onChange={(e) => setFormData({ ...formData, cargoBase: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Ekstra Paket/Gider (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.extraExpense}
                    onChange={(e) => setFormData({ ...formData, extraExpense: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Arkadaş Sabit Payı (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.partnerFixed}
                    onChange={(e) => setFormData({ ...formData, partnerFixed: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Masraf / Mahsuplaşma Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: sarı taksi, natro-domain, iade kesintisi..."
                  value={formData.expenseTitle}
                  onChange={(e) => setFormData({ ...formData, expenseTitle: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Tutar (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 transition"
                  required
                />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">
                  Masraf satırlarında Gelir Vergisi (%20) kesilerek kalanı alacağınız hanesine yazılır.
                </span>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs px-4 py-2 rounded-xl transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition shadow-lg shadow-emerald-600/30"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
