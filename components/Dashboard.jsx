"use client";

import React, { useState } from 'react';
import { 
  ClipboardList, 
  TrendingUp, 
  Wallet, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function Dashboard({ 
  dashboardData, 
  setActiveTab, 
  onNewOrderClick, 
  onUpdateOrderStatus 
}) {
  const [quickHours, setQuickHours] = useState(2);
  const [quickMinutes, setQuickMinutes] = useState(30);

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const { orderCounts, financials, cash, hourlyMachineCost, recentOrders } = dashboardData;

  // Quick estimation calculation
  const totalMin = (Number(quickHours) || 0) * 60 + (Number(quickMinutes) || 0);
  const quickRawCost = Math.round(((hourlyMachineCost || 27) / 60) * totalMin);
  let mult = 3.6;
  if (quickRawCost <= 11) mult = 6.0;
  else if (quickRawCost <= 25) mult = 5.0;
  else if (quickRawCost <= 55) mult = 4.0;
  else if (quickRawCost <= 100) mult = 3.8;
  const quickLocalPrice = (quickRawCost * mult).toFixed(2);
  const quickTrendyolPrice = (((Number(quickLocalPrice) + 10) / (0.96 * 0.95 * 0.80)) + 130).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Atölye Operasyon Merkezi (Next.js + Turso)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              İş Takip & Finansal Kontrol Paneli
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Anycubic Kobra 2 Plus üretim maliyetleri, kademeli fiyatlandırma ve Trendyol kâr paylaşım takibi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNewOrderClick()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Sipariş Ekle</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Maliyet Hesapla</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Orders */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-gray-900/80 border border-gray-800 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Aktif & Toplam Sipariş</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{orderCounts?.total || 0}</span>
            <span className="text-xs text-gray-400">sipariş kaydı</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs pt-3 border-t border-gray-800">
            <span className="text-amber-400 font-medium">{orderCounts?.modelling || 0} Modelleme</span>
            <span className="text-gray-600">•</span>
            <span className="text-cyan-400 font-medium">{orderCounts?.readyToPrint || 0} Hazır</span>
            <span className="text-gray-600">•</span>
            <span className="text-emerald-400 font-medium">{orderCounts?.completed || 0} Bitti</span>
          </div>
        </div>

        {/* Card 2: Trendyol Alacak */}
        <div 
          onClick={() => setActiveTab('trendyol')}
          className="bg-gray-900/80 border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Sizin Kalan Alacağınız</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-400">
              {financials?.totalReceivable?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-emerald-400/80">₺</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-800">
            <span className="text-gray-400">Hakediş: <strong className="text-gray-200">{financials?.totalHakedis?.toLocaleString('tr-TR')} ₺</strong></span>
            <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Detay <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Nakit Kasa */}
        <div 
          onClick={() => setActiveTab('cash')}
          className="bg-gray-900/80 border border-gray-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Nakit Kasa Mevcudu</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-amber-400">
              {cash?.totalAccumulated?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-base font-bold text-amber-400/80">₺</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-800">
            <span className="text-gray-400">
              Son Sayım: <strong className="text-gray-200">{cash?.latestSession?.date || '-'}</strong>
            </span>
            <span className="text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Sayım Yap <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Machine Cost & Rate */}
        <div 
          onClick={() => setActiveTab('calculator')}
          className="bg-gray-900/80 border border-gray-800 hover:border-cyan-500/40 rounded-2xl p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">3D Yazıcı Saat Maliyeti</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-cyan-400">{hourlyMachineCost || 27}</span>
            <span className="text-base font-bold text-cyan-400/80">₺ / saat</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-800">
            <span className="text-gray-400">Anycubic Kobra 2 Plus</span>
            <span className="text-cyan-400 font-medium">900 ₺/kg PLA</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Slicer Calculator & Fast Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Slicer Estimator */}
        <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-900/90 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-white text-sm">Hızlı Dilimleme Fiyatlayıcı</h3>
            </div>
            <span className="text-[11px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">Canlı</span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Dilimleyicinizden (Slicer) aldığınız baskı süresini girin, anında maliyet ve tavsiye fiyatı görün:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[11px] text-gray-400 font-medium block mb-1">Saat</label>
              <input
                type="number"
                min="0"
                value={quickHours}
                onChange={(e) => setQuickHours(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 font-medium block mb-1">Dakika</label>
              <input
                type="number"
                min="0"
                max="59"
                value={quickMinutes}
                onChange={(e) => setQuickMinutes(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Results box */}
          <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-3 space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Ham Maliyet:</span>
              <span className="font-semibold text-gray-200">{quickRawCost} ₺</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Kademeli Çarpan:</span>
              <span className="font-semibold text-amber-400">{mult}x</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-800">
              <span className="text-gray-300 font-medium">Lokal Satış Fiyatı:</span>
              <span className="font-bold text-emerald-400 text-sm">{quickLocalPrice} ₺</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">Trendyol Fiyatı:</span>
              <span className="font-bold text-cyan-400 text-sm">{quickTrendyolPrice} ₺</span>
            </div>
          </div>

          <button
            onClick={() => onNewOrderClick({ 
              printHours: quickHours, 
              printMinutes: quickMinutes, 
              price: quickLocalPrice 
            })}
            className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>Bu Fiyatla Siparişe Dönüştür</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Son Siparişler</h3>
                  <span className="text-[11px] text-gray-400">Üretim kuyruğundaki son işler</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                Tümünü Gör ({orderCounts?.total})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-2 font-medium">Sipariş / Model</th>
                    <th className="pb-2 font-medium">Kanal</th>
                    <th className="pb-2 font-medium">Müşteri</th>
                    <th className="pb-2 font-medium">Renk</th>
                    <th className="pb-2 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {(recentOrders || []).map((order) => {
                    const statusColors = {
                      'Modelleme': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                      'Baskıya Hazır': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                      'Baskıda': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                      'Tamamlandı': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    };
                    return (
                      <tr key={order.id} className="hover:bg-gray-800/40 transition">
                        <td className="py-2.5 font-medium text-white">
                          <div>{order.title}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[140px]">{order.description}</div>
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-gray-800 text-gray-300 border border-gray-700">
                            {order.channel}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-300">{order.customer || '-'}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1 text-gray-300">
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-gray-700" 
                              style={{ 
                                backgroundColor: 
                                  order.color?.toLowerCase().includes('beyaz') ? '#ffffff' :
                                  order.color?.toLowerCase().includes('yeşil') ? '#22c55e' :
                                  order.color?.toLowerCase().includes('kırmızı') ? '#ef4444' :
                                  order.color?.toLowerCase().includes('turuncu') ? '#f97316' :
                                  order.color?.toLowerCase().includes('mavi') ? '#3b82f6' :
                                  order.color?.toLowerCase().includes('gri') ? '#9ca3af' : '#6b7280'
                              }}
                            />
                            <span>{order.color}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                              statusColors[order.status] || 'bg-gray-800 text-gray-300 border-gray-700'
                            }`}
                          >
                            <option value="Modelleme">Modelleme</option>
                            <option value="Baskıya Hazır">Baskıya Hazır</option>
                            <option value="Baskıda">Baskıda</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                            <option value="Kargolandı / Teslim">Kargolandı</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Toplam {orderCounts?.total || 0} adet sipariş kayıtlı</span>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Kanban Panosunu Aç →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
