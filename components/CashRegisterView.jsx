"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Trash2, 
  Calendar, 
  Coins, 
  Receipt
} from 'lucide-react';

export default function CashRegisterView({ 
  cashSessions, 
  onAddCashSession, 
  onDeleteCashSession 
}) {
  const [sessionDate, setSessionDate] = useState('');

  useEffect(() => {
    setSessionDate(new Date().toISOString().split('T')[0]);
  }, []);

  const [denoms, setDenoms] = useState({
    "200": 0,
    "100": 0,
    "50": 0,
    "20": 0,
    "10": 0,
    "5": 0
  });
  const [note, setNote] = useState('');

  const entryTotal = Object.entries(denoms).reduce((acc, [k, v]) => acc + Number(k) * (Number(v) || 0), 0);
  const grandTotal = (cashSessions || []).reduce((acc, s) => acc + (Number(s.total) || 0), 0);

  function handleDenomChange(nominal, count) {
    setDenoms({
      ...denoms,
      [nominal]: Math.max(0, parseInt(count) || 0)
    });
  }

  function handleSaveSession(e) {
    e.preventDefault();
    if (entryTotal <= 0) {
      alert('Lütfen en az bir banknot adedi girin.');
      return;
    }

    onAddCashSession({
      date: sessionDate,
      denominations: denoms,
      note: note.trim()
    });

    setDenoms({ "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 });
    setNote('');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Google Sheets 'Nakit Kasa' Modülü</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Nakit Kasa & Gün Sonu Kupür Sayımı</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Elden yapılan nakit tahsilatların banknot bazlı kupür sayımı ve kasa mevcudu takibi.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 px-5 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium block">Toplam Kasa Mevcudu (B3)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {grandTotal.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs font-bold text-amber-600/80 dark:text-amber-400/80">₺</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Yeni Gün Sonu Sayımı</span>
            </h3>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              Kupür Hesabı
            </span>
          </div>

          <form onSubmit={handleSaveSession} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Sayım Tarihi
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">Banknot Kupür Adetleri:</span>
              {[200, 100, 50, 20, 10, 5].map((nom) => {
                const count = denoms[String(nom)] || 0;
                const subTotal = nom * count;
                return (
                  <div key={nom} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl border border-gray-200 dark:border-gray-700/60">
                    <div className="w-16 font-bold text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-2 py-1.5 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                      {nom} ₺
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="Adet"
                        value={count === 0 ? '' : count}
                        onChange={(e) => handleDenomChange(nom, e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 text-center font-semibold transition"
                      />
                    </div>
                    <div className="w-24 text-right font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {subTotal.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Açıklama / Not (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: Hafta sonu atölye tahsilatı..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Bu Sayımın Toplamı:</span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {entryTotal.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-lg shadow-amber-600/25 transition active:scale-98"
            >
              Sayımı Kaydet ve Kasaya Ekle
            </button>
          </form>
        </div>

        {/* Right: History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Kasa Sayım Geçmişi</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-0.5 rounded-full">
                {(cashSessions || []).length} Sayım Kaydı
              </span>
            </div>

            <div className="space-y-4">
              {(cashSessions || []).map((session) => (
                <div 
                  key={session.id} 
                  className="bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl p-4 transition shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700/60 mb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{session.date}</span>
                      {session.note && (
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 italic">({session.note})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        {session.total?.toLocaleString('tr-TR')} ₺
                      </span>
                      <button
                        onClick={() => onDeleteCashSession(session.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 transition"
                        title="Sayımı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px]">
                    {[200, 100, 50, 20, 10, 5].map((nom) => {
                      const count = session.denominations?.[String(nom)] || 0;
                      return (
                        <div 
                          key={nom} 
                          className={`p-1.5 rounded-lg border text-center ${
                            count > 0 
                              ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 font-medium' 
                              : 'bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          <div className="text-[9px] text-gray-500 dark:text-gray-400">{nom} ₺</div>
                          <div className="font-bold">{count} adet</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {(cashSessions || []).length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-xs">
                  Henüz kayıtlı nakit sayımı bulunmuyor.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center mt-6">
            <span>Tüm geçmiş sayımların toplamı kasaya işlenmiştir.</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{grandTotal.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      </div>
    </div>
  );
}
