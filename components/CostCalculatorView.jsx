"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Clock, 
  Cpu, 
  Layers, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { calculateCost, fetchSavedParts, createSavedPart, deleteSavedPart, updateSettings } from '@/lib/api';

export default function CostCalculatorView({ 
  settings, 
  onSettingsUpdated,
  onNewOrderWithValues 
}) {
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);
  const [calcResult, setCalcResult] = useState(null);

  const [parts, setParts] = useState([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartHours, setNewPartHours] = useState(1);
  const [newPartMinutes, setNewPartMinutes] = useState(40);

  const [editableSettings, setEditableSettings] = useState(settings || {});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    async function doCalc() {
      try {
        const res = await calculateCost(hours, minutes);
        if (res.success) {
          setCalcResult(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    doCalc();
  }, [hours, minutes]);

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    if (settings) {
      setEditableSettings(settings);
    }
  }, [settings]);

  async function loadParts() {
    try {
      const res = await fetchSavedParts();
      if (res.success) {
        setParts(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddPart(e) {
    e.preventDefault();
    if (!newPartName.trim()) return;
    try {
      const res = await createSavedPart({
        name: newPartName.trim(),
        hours: Number(newPartHours) || 0,
        minutes: Number(newPartMinutes) || 0
      });
      if (res.success) {
        setNewPartName('');
        setNewPartHours(1);
        setNewPartMinutes(40);
        loadParts();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePart(id) {
    try {
      await deleteSavedPart(id);
      loadParts();
    } catch (err) {
      console.error(err);
    }
  }

  const totalPartMinutes = parts.reduce((acc, p) => acc + (Number(p.hours) || 0) * 60 + (Number(p.minutes) || 0), 0);
  const cumHours = Math.floor(totalPartMinutes / 60);
  const cumMinutes = totalPartMinutes % 60;
  const cumRawCost = Math.round(((settings?.hourlyBaseCost || 27) / 60) * totalPartMinutes);
  let cumMult = 3.6;
  if (cumRawCost <= 11) cumMult = 6.0;
  else if (cumRawCost <= 25) cumMult = 5.0;
  else if (cumRawCost <= 55) cumMult = 4.0;
  else if (cumRawCost <= 100) cumMult = 3.8;
  const cumLocalPrice = (cumRawCost * cumMult).toFixed(2);

  async function handleSaveSettings() {
    setIsSavingSettings(true);
    setSaveSuccessMsg('');
    try {
      const res = await updateSettings(editableSettings);
      if (res.success) {
        setSaveSuccessMsg('Parametreler ve saatlik maliyet başarıyla güncellendi!');
        onSettingsUpdated(res.data);
        const cRes = await calculateCost(hours, minutes);
        if (cRes.success) setCalcResult(cRes.data);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>3D Atölye Hassas Maliyet & Fiyat Motoru</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">3D Baskı Maliyet & Akıllı Fiyatlandırma</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Süreye dayalı üretim maliyeti, kademeli çarpan kuralı ve pazaryeri komisyon/KDV hesapları.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Cpu className="w-4 h-4 text-orange-500" />
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">Aktif Saat Maliyeti:</span>{' '}
            <strong className="text-orange-600 dark:text-orange-400 font-mono text-sm">{settings?.hourlyBaseCost || 27} ₺ / sa</strong>
          </div>
        </div>
      </div>

      {/* Top Section: Interactive Calculator & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Slicer Time Input (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-base mb-2">
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Dilimleme (Slicer) Süresi Girişi</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Bambu Studio, Cura veya PrusaSlicer'ın verdiği toplam baskı süresini girin:
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Baskı Saati
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:border-cyan-500 transition"
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400 dark:text-gray-500 font-medium">saat</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Baskı Dakikası
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:border-cyan-500 transition"
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400 dark:text-gray-500 font-medium">dakika</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mb-6">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Sık Kullanılan Süreler:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '30 dk', h: 0, m: 30 },
                  { label: '1 sa', h: 1, m: 0 },
                  { label: '1 sa 40 dk', h: 1, m: 40 },
                  { label: '3 sa', h: 3, m: 0 },
                  { label: '5 sa 30 dk', h: 5, m: 30 },
                  { label: '10 sa', h: 10, m: 0 }
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setHours(p.h); setMinutes(p.m); }}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNewOrderWithValues({
              printHours: hours,
              printMinutes: minutes,
              price: calcResult?.localPrice || 0
            })}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm py-3 rounded-xl shadow-md shadow-orange-600/25 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Bu Hesaplamayla Sipariş Oluştur</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Calculated Price Cards (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Hesaplanan Maliyet ve Satış Fiyatları</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Toplam Süre: <strong className="text-cyan-600 dark:text-cyan-400">{hours} sa {minutes} dk</strong> ({calcResult?.totalMinutes || 0} dk)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Box 1: Raw Cost */}
              <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-xl p-4">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Ham Üretim Maliyeti</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {calcResult?.rawCost || 0}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">₺</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                  (27 ₺ / 60) x {calcResult?.totalMinutes || 0} dakika
                </p>
              </div>

              {/* Box 2: Local Recommended Price */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Tavsiye Lokal Satış</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {calcResult?.localPrice?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80">₺</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                  <span>Çarpan: {calcResult?.localMultiplier}x</span>
                </div>
              </div>

              {/* Box 3: Trendyol Recommended Price */}
              <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">Pazaryeri / Trendyol</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
                    {calcResult?.trendyolPrice?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xs font-semibold text-cyan-600/80 dark:text-cyan-400/80">₺</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                  Komisyon, risk, KDV ve 130 ₺ kargo dahil
                </p>
              </div>
            </div>

            {/* Pricing Formula Logic Box */}
            <div className="bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Kademeli Çarpan Fiyatlandırma Kuralı (Tanımlar Sayfası)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                <div className={`p-2 rounded border ${calcResult?.rawCost <= 11 ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <div className="font-bold">≤ 11 ₺</div>
                  <div>Maliyet x 6.0</div>
                </div>
                <div className={`p-2 rounded border ${calcResult?.rawCost > 11 && calcResult?.rawCost <= 25 ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <div className="font-bold">11 - 25 ₺</div>
                  <div>Maliyet x 5.0</div>
                </div>
                <div className={`p-2 rounded border ${calcResult?.rawCost > 25 && calcResult?.rawCost <= 55 ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <div className="font-bold">25 - 55 ₺</div>
                  <div>Maliyet x 4.0</div>
                </div>
                <div className={`p-2 rounded border ${calcResult?.rawCost > 55 && calcResult?.rawCost <= 100 ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <div className="font-bold">55 - 100 ₺</div>
                  <div>Maliyet x 3.8</div>
                </div>
                <div className={`p-2 rounded border ${calcResult?.rawCost > 100 ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <div className="font-bold">&gt; 100 ₺</div>
                  <div>Maliyet x 3.6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Multi-Part Accumulator */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Çoklu Parça / Montaj Süre Toplayıcı</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Çok parçalı projelerde (örneğin üst kapak 1, üst kapak 2, gövde vb.) süreleri toplayarak kümülatif maliyeti bulun.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Kümülatif Toplam:</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                {cumHours} sa {cumMinutes} dk
              </span>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Top. Satış:</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {cumLocalPrice} ₺
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddPart} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Parça Adı (Örn: Üst Kapak 5, Yan Panel...)"
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="number"
              min="0"
              placeholder="Saat"
              value={newPartHours}
              onChange={(e) => setNewPartHours(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Dakika"
              value={newPartMinutes}
              onChange={(e) => setNewPartMinutes(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Parça Ekle</span>
            </button>
          </div>
        </form>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Parça Adı</th>
                <th className="py-2.5 px-4 font-semibold">Süre</th>
                <th className="py-2.5 px-4 font-semibold">Parça Ham Maliyet</th>
                <th className="py-2.5 px-4 font-semibold text-right">Sil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400 dark:text-gray-500">
                    Henüz kayıtlı parça yok. Yukarıdan ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const pMins = (Number(part.hours) || 0) * 60 + (Number(part.minutes) || 0);
                  const pCost = Math.round(((settings?.hourlyBaseCost || 27) / 60) * pMins);
                  return (
                    <tr key={part.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                      <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-gray-200">
                        {part.name}
                      </td>
                      <td className="py-2.5 px-4 text-cyan-600 dark:text-cyan-400 font-medium">
                        {part.hours} sa {part.minutes} dk
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">
                        {pCost} ₺
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 transition"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {parts.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-950/80 font-semibold border-t border-gray-200 dark:border-gray-800 text-xs">
                <tr>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">TOPLAM ({parts.length} Parça)</td>
                  <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400 font-bold">{cumHours} sa {cumMinutes} dk</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{cumRawCost} ₺ ham maliyet</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNewOrderWithValues({
                        title: 'Çok Parçalı Montaj',
                        description: `${parts.length} parça: ${parts.map(p => p.name).join(', ')}`,
                        printHours: cumHours,
                        printMinutes: cumMinutes,
                        price: cumLocalPrice
                      })}
                      className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 text-[11px] font-bold underline"
                    >
                      Siparişe Aktar
                    </button>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Bottom Section: Hourly Cost Parameters Inspector & Editor */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Maliyet Parametreleri & Tarife Değerleri</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Filament fiyatı, elektrik tarifesi, amortisman ve pay oranları değiştiğinde saatlik maliyet otomatik hesaplanır.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingSettings ? 'Kaydediliyor...' : 'Parametreleri Kaydet'}</span>
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">1. Filament (PLA)</span>
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Kg Fiyatı (₺)</label>
              <input
                type="number"
                value={editableSettings?.filament?.kgPrice || 900}
                onChange={(e) => setEditableSettings({
                  ...editableSettings,
                  filament: { ...editableSettings.filament, kgPrice: Number(e.target.value) }
                })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700/60 flex justify-between">
              <span>Saat Başına Sarfiyat:</span>
              <strong className="text-gray-900 dark:text-white">12,00 ₺/sa</strong>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">2. Cihaz Amortismanı</span>
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Cihaz Fiyatı (Anycubic Kobra 2 Plus)</label>
              <input
                type="number"
                value={editableSettings?.machine?.price || 30000}
                onChange={(e) => setEditableSettings({
                  ...editableSettings,
                  machine: { ...editableSettings.machine, price: Number(e.target.value) }
                })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700/60 flex justify-between">
              <span>28 Ay / 250 Sa:</span>
              <strong className="text-gray-900 dark:text-white">4,29 ₺/sa</strong>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">3. Elektrik & Bakım</span>
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Elektrik Tarifesi (₺/kWh)</label>
              <input
                type="number"
                step="0.1"
                value={editableSettings?.machine?.electricityKwhPrice || 4.5}
                onChange={(e) => setEditableSettings({
                  ...editableSettings,
                  machine: { ...editableSettings.machine, electricityKwhPrice: Number(e.target.value) }
                })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700/60 flex justify-between">
              <span>300W Elektrik + Bakım:</span>
              <strong className="text-gray-900 dark:text-white">3,96 ₺/sa</strong>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">4. Paylar & Risk</span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Fire Payı:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">%10 (2,02 ₺)</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Kâr Payı:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">%20 (4,05 ₺)</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Risk Payı:</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">%5 (1,01 ₺)</span>
              </div>
            </div>
            <div className="text-xs pt-2 border-t border-gray-200 dark:border-gray-700/60 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Saat Maliyeti:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{settings?.hourlyBaseCost || 27} ₺ / sa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
