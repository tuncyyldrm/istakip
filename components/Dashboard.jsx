"use client";

import React, { useState } from 'react';
import { 
  ClipboardList, 
  TrendingUp, 
  Wallet, 
  Cpu, 
  Clock, 
  ChevronRight, 
  Plus, 
  ArrowRight,
  Printer,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard({ 
  dashboardData, 
  setActiveTab, 
  onNewOrderClick, 
  onUpdateOrderStatus,
  printers = []
}) {
  const [quickHours, setQuickHours] = useState(2);
  const [quickMinutes, setQuickMinutes] = useState(30);

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Atölye paneli hazırlanıyor...</span>
        </div>
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

  // Active printer stats
  const printingCount = printers.filter(p => p.status === 'Baskıda').length;

  return (
    <div className="space-y-6">
      
      {/* 1. ATELIER OPERATION BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Printer className="w-3 h-3" />
                Atölye Operasyon Masası
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Turso Cloud Çevrimiçi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Üretim Kuyruğu & Finansal Kontrol
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Anycubic Kobra 2 Plus üretim parametreleri, filament sarfiyatı, kademeli fiyatlandırma ve pazar yeri hakediş takibi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNewOrderClick()}
              className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-orange-600/25 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Sipariş</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Fiyat Hesapla</span>
            </button>
          </div>
        </div>

        {/* 2. LIVE PRINTER STATUS BAR */}
        {printers.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {printers.map((printer) => {
              const isPrinting = printer.status === 'Baskıda';
              const isIdle = printer.status === 'Boşta';
              return (
                <div 
                  key={printer.id}
                  onClick={() => setActiveTab('inventory')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40 cursor-pointer transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {printer.image ? (
                      <img src={printer.image} alt={printer.name} className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPrinting ? 'bg-amber-500/15 text-amber-500' : isIdle ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                      }`}>
                        <Printer className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {printer.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{printer.nozzleSize || '0.4 mm'}</span>
                        <span>•</span>
                        <span className="truncate">{printer.currentFilament || 'Filament takılı'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isPrinting 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                        : isIdle 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {printer.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PRECISION KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Orders */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Üretim & Sipariş</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{orderCounts?.total || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kayıtlı sipariş</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{orderCounts?.modelling || 0} Modelleme</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{orderCounts?.readyToPrint || 0} Hazır</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{orderCounts?.completed || 0} Bitti</span>
          </div>
        </div>

        {/* Card 2: Trendyol Receivable */}
        <div 
          onClick={() => setActiveTab('trendyol')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kalan Net Alacağınız</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {financials?.totalReceivable?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-emerald-600/80">₺</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Toplam Hakediş: <strong className="text-slate-700 dark:text-slate-300 font-mono">{financials?.totalHakedis?.toLocaleString('tr-TR')} ₺</strong>
            </span>
            <span className="text-orange-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-semibold">
              Detay <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Cash Register */}
        <div 
          onClick={() => setActiveTab('cash')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nakit Kasa Mevcudu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {cash?.totalAccumulated?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-base font-bold text-amber-600/80">₺</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Son Sayım: <strong className="text-slate-700 dark:text-slate-300">{cash?.latestSession?.date || '-'}</strong>
            </span>
            <span className="text-amber-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-semibold">
              Kasa <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Machine Cost Benchmark */}
        <div 
          onClick={() => setActiveTab('calculator')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Baskı Saatlik Maliyet</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{hourlyMachineCost || 27}</span>
            <span className="text-base font-bold text-slate-500">₺ / saat</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Anycubic Kobra 2 Plus</span>
            <span className="font-mono font-semibold text-orange-500">900 ₺/kg PLA</span>
          </div>
        </div>
      </div>

      {/* 4. SLICER FAST ESTIMATOR + RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Slicer Quick Pricing Calculator */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Hızlı Dilimleme Fiyatlayıcı</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                Slicer
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cura veya PrusaSlicer'dan aldığınız baskı süresini girin, anında kademeli çarpanlı satış fiyatını hesaplayın:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Baskı Saati</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={quickHours}
                    onChange={(e) => setQuickHours(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-orange-500 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">sa</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Dakika</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={quickMinutes}
                    onChange={(e) => setQuickMinutes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-orange-500 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">dk</span>
                </div>
              </div>
            </div>

            {/* Calculations breakdown */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 mb-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Ham Atölye Maliyeti:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{quickRawCost} ₺</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Kademeli Çarpan:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{mult}x</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-800 dark:text-slate-200 font-sans font-semibold">Tavsiye Elden Satış:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{quickLocalPrice} ₺</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 dark:text-slate-200 font-sans font-semibold">Trendyol Satış:</span>
                <span className="font-bold text-blue-600 dark:text-orange-400 text-sm">{quickTrendyolPrice} ₺</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNewOrderClick({ 
              printHours: quickHours, 
              printMinutes: quickMinutes, 
              price: quickLocalPrice 
            })}
            className="w-full bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>Bu Fiyatla Siparişe Dönüştür</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Orders Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <ClipboardList className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Üretim Kuyruğu (Son Siparişler)</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">En güncel üretim siparişleri</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-bold"
              >
                Tümü ({orderCounts?.total || 0})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="pb-2.5 font-semibold">Model / Parça</th>
                    <th className="pb-2.5 font-semibold">Kanal</th>
                    <th className="pb-2.5 font-semibold">Müşteri</th>
                    <th className="pb-2.5 font-semibold">Renk</th>
                    <th className="pb-2.5 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(recentOrders || []).map((order) => {
                    const statusColors = {
                      'Modelleme': 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30',
                      'Baskıya Hazır': 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30',
                      'Baskıda': 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30',
                      'Tamamlandı': 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30',
                      'Kargolandı / Teslim': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    };
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {order.image && (
                              <img
                                src={order.image}
                                alt={order.title}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="truncate">{order.title}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] font-normal">{order.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {order.channel}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">{order.customer || '-'}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-slate-400 dark:border-slate-600" 
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
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer ${
                              statusColors[order.status] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <option value="Modelleme">Modelleme</option>
                            <option value="Baskıya Hazır">Baskıya Hazır</option>
                            <option value="Baskıda">Baskıda</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                            <option value="Kargolandı / Teslim">Kargolandı / Teslim</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Toplam {orderCounts?.total || 0} adet sipariş kayıtlı</span>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-orange-600 dark:text-orange-400 hover:underline font-bold"
            >
              Kanban Üretim Panosuna Git →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
