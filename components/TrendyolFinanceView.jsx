"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit3
} from 'lucide-react';

export default function TrendyolFinanceView({ 
  sales, 
  onNewSaleClick, 
  onToggleSale, 
  onDeleteSale,
  onEditSale 
}) {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const displayList = filterActiveOnly ? (sales || []).filter(s => s.included) : (sales || []);

  const activeItems = (sales || []).filter(s => s.included !== false);
  const totalHakedis = activeItems.reduce((acc, s) => acc + (Number(s.hakedis) || 0), 0);
  const totalPartnerShare = activeItems.reduce((acc, s) => acc + (Number(s.partnerTotalShare) || 0), 0);
  const totalReceivable = activeItems.reduce((acc, s) => acc + (Number(s.myReceivable) || 0) + (Number(s.deduction) || 0), 0);
  const totalNetProfit = activeItems.reduce((acc, s) => acc + (Number(s.myNetProfit) || 0) + (Number(s.deduction) || 0), 0);
  const totalNetVat = activeItems.reduce((acc, s) => acc + (Number(s.netVat) || 0), 0);
  const totalIncomeTax = activeItems.reduce((acc, s) => acc + (Number(s.incomeTax) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Google Sheets 'trendyol satış' Modülü</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Trendyol Finans, Hakediş & Kâr Paylaşımı</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Satış gelirleri, platform komisyonları, KDV borcu, gelir vergisi ve ortaklık payı hesapları.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNewSaleClick()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Satış / Masraf Ekle</span>
          </button>
        </div>
      </div>

      {/* Top Financial KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hakedis */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Trendyol Net Hakediş (L2)</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-semibold">
              =SUMIF(A:A, TRUE, L:L)
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {totalHakedis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80">₺</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            Satış - Komisyon - Kargo - Ekstra Giderler
          </p>
        </div>

        {/* Card 2: Partner / Friend Share */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Arkadaş Toplam Payı (O Sütunu)</span>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-mono font-semibold">
              Vergi + Pay
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {totalPartnerShare.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-purple-600/80 dark:text-purple-400/80">₺</span>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-between">
            <span>Net KDV: {totalNetVat.toFixed(1)} ₺</span>
            <span>Gelir V.: {totalIncomeTax.toFixed(1)} ₺</span>
          </div>
        </div>

        {/* Card 3: Your Total Receivable */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
            <span>SİZİN KALAN ALACAĞINIZ (P2)</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
              Net Bakiye
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {totalReceivable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-emerald-600/80 dark:text-emerald-400/80">₺</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-gray-400 mt-2">
            Hakedişten arkadaş payı ve kesintiler düşüldükten sonra kalan
          </p>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-cyan-800 dark:text-cyan-400 font-semibold">
            <span>KENDİ NET KÂRINIZ (Q Sütunu)</span>
            <span className="text-[10px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded font-bold">
              Temiz Kâr
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
              {totalNetProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-cyan-600/80 dark:text-cyan-400/80">₺</span>
          </div>
          <p className="text-[11px] text-cyan-700/80 dark:text-gray-400 mt-2">
            Alacağınız - Gerçek Filament & Üretim Maliyeti
          </p>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Detaylı Satış & Mahsuplaşma Tablosu</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
              {displayList.length} Satır
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Sadece Dahil Olanları Göster</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-3 text-center">Dahil</th>
                <th className="py-3 px-3">Tarih / Açıklama</th>
                <th className="py-3 px-3">Satış Fiyatı</th>
                <th className="py-3 px-3">Komisyon</th>
                <th className="py-3 px-3">Gerçek Maliyet</th>
                <th className="py-3 px-3">Kargo (KDV'li)</th>
                <th className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">Hakediş (L)</th>
                <th className="py-3 px-3 text-purple-600 dark:text-purple-400 font-bold">Net KDV Borcu (M)</th>
                <th className="py-3 px-3 text-purple-600 dark:text-purple-400 font-bold">Gelir Vergisi (N)</th>
                <th className="py-3 px-3 text-purple-600 dark:text-purple-400 font-extrabold">Arkadaş Toplam Payı (O)</th>
                <th className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold">Sizin Alacağınız (P)</th>
                <th className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-extrabold">Kendi Kârınız (Q)</th>
                <th className="py-3 px-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {displayList.map((row) => {
                const isExpense = row.isExpenseRow;
                const isDeduction = Number(row.deduction) < 0;

                return (
                  <tr 
                    key={row.id} 
                    className={`transition ${!row.included ? 'opacity-40 bg-gray-50 dark:bg-gray-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'} ${isExpense ? 'bg-amber-50/60 dark:bg-amber-950/10' : ''}`}
                  >
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onToggleSale(row.id)}
                        className="text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                      >
                        {row.included ? (
                          <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">
                      {isExpense ? (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          <span>{row.expenseTitle || 'Masraf / Kesinti'}</span>
                        </div>
                      ) : isDeduction ? (
                        <div className="text-red-500 dark:text-red-400 font-bold">
                          {row.date || 'İade Kesintisi'}
                        </div>
                      ) : (
                        <div className="text-gray-800 dark:text-gray-200">
                          {row.date || '-'}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">
                      {isDeduction ? (
                        <span className="text-red-500 dark:text-red-400 font-bold">{row.deduction} ₺</span>
                      ) : (
                        `${row.salePrice?.toFixed(2)} ₺`
                      )}
                    </td>

                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      {isExpense || isDeduction ? '-' : `%${((row.commissionRate || 0.04) * 100).toFixed(1)}`}
                    </td>

                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      {isExpense || isDeduction ? '-' : `${row.realCost || 0} ₺`}
                    </td>

                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      {isExpense || isDeduction ? '-' : `${(row.cargoBase * (1 + (row.cargoVatRate || 0.2))).toFixed(2)} ₺`}
                    </td>

                    <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">
                      {isDeduction ? '-' : `${row.hakedis?.toFixed(2)} ₺`}
                    </td>

                    <td className="py-3 px-3 text-purple-600 dark:text-purple-300">
                      {isExpense || isDeduction ? '0.00 ₺' : `${row.netVat?.toFixed(2)} ₺`}
                    </td>

                    <td className="py-3 px-3 text-purple-600 dark:text-purple-300">
                      {isDeduction ? '-' : `${row.incomeTax?.toFixed(2)} ₺`}
                    </td>

                    <td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-400">
                      {isDeduction ? '-' : `${row.partnerTotalShare?.toFixed(2)} ₺`}
                    </td>

                    <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {isDeduction ? (
                        <span className="text-red-500 dark:text-red-400 font-bold">{row.deduction} ₺</span>
                      ) : (
                        `${row.myReceivable?.toFixed(2)} ₺`
                      )}
                    </td>

                    <td className="py-3 px-3 font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">
                      {isDeduction ? (
                        <span className="text-red-500 dark:text-red-400 font-bold">{row.deduction} ₺</span>
                      ) : (
                        `${row.myNetProfit?.toFixed(2)} ₺`
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditSale(row)}
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSale(row.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-950/90 font-bold border-t border-gray-200 dark:border-gray-700 text-xs">
              <tr>
                <td colSpan="6" className="py-3.5 px-3 text-right text-gray-500 dark:text-gray-400">
                  TOPLAM (Aktif Seçilenler):
                </td>
                <td className="py-3.5 px-3 text-blue-600 dark:text-blue-400 text-sm">
                  {totalHakedis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>
                <td className="py-3.5 px-3 text-purple-600 dark:text-purple-300">
                  {totalNetVat.toFixed(2)} ₺
                </td>
                <td className="py-3.5 px-3 text-purple-600 dark:text-purple-300">
                  {totalIncomeTax.toFixed(2)} ₺
                </td>
                <td className="py-3.5 px-3 text-purple-600 dark:text-purple-400 text-sm">
                  {totalPartnerShare.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>
                <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400 text-base">
                  {totalReceivable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>
                <td className="py-3.5 px-3 text-cyan-600 dark:text-cyan-400 text-base">
                  {totalNetProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
