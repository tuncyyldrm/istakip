"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  ArrowDownRight, 
  Receipt, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function NewSaleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  saleToEdit 
}) {
  // 'sale' | 'deduction' | 'expense'
  const [entryType, setEntryType] = useState('sale');

  // Common fields
  const [date, setDate] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');

  // Deduction specific fields (TS-006, TS-008 type)
  const [deductionAmount, setDeductionAmount] = useState('242.51');

  // Normal sale & Expense fields (stored as strings to allow typing '-', ',', '.')
  const [salePrice, setSalePrice] = useState('450');
  const [commissionRate, setCommissionRate] = useState('4.0');
  const [realCost, setRealCost] = useState('55');
  const [cargoBase, setCargoBase] = useState('95.54');
  const [extraExpense, setExtraExpense] = useState('13.19');
  const [partnerFixed, setPartnerFixed] = useState('0');

  // Helper to parse strings cleanly with comma or period
  const parseNumeric = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    let clean = String(val).replace(',', '.').trim();
    if (clean === '-' || clean === '+') return 0;
    if (clean.startsWith('--')) clean = clean.replace(/^-+/, '-');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    if (saleToEdit) {
      const isDeductionRow = 
        Number(saleToEdit.deduction) < 0 || 
        (saleToEdit.deduction && Number(saleToEdit.deduction) !== 0);

      const isExpRow = Boolean(saleToEdit.isExpenseRow);

      if (isDeductionRow) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEntryType('deduction');
        setDate(saleToEdit.date || today);
        const ded = Number(saleToEdit.deduction);
        setDeductionAmount(String(!isNaN(ded) ? (ded < 0 ? ded : -ded) : -242.51));
        setExpenseTitle(saleToEdit.expenseTitle || 'İade Kesintisi');
      } else if (isExpRow) {
        setEntryType('expense');
        setDate(saleToEdit.date || today);
        setExpenseTitle(saleToEdit.expenseTitle || '');
        setSalePrice(String(saleToEdit.salePrice || 0));
      } else {
        setEntryType('sale');
        setDate(saleToEdit.date || today);
        setExpenseTitle(saleToEdit.expenseTitle || '');
        setSalePrice(String(saleToEdit.salePrice !== undefined && saleToEdit.salePrice !== null ? saleToEdit.salePrice : 450));
        
        let commPct = '4.0';
        if (saleToEdit.commissionRate !== undefined && saleToEdit.commissionRate !== null) {
          const rawPct = Number(saleToEdit.commissionRate) * 100;
          commPct = rawPct % 1 === 0 ? rawPct.toFixed(1) : String(Number(rawPct.toFixed(4)));
        }
        setCommissionRate(commPct);
        
        setRealCost(String(saleToEdit.realCost !== undefined && saleToEdit.realCost !== null ? saleToEdit.realCost : 55));
        setCargoBase(String(saleToEdit.cargoBase !== undefined && saleToEdit.cargoBase !== null ? saleToEdit.cargoBase : 89.70));
        setExtraExpense(String(saleToEdit.extraExpense !== undefined && saleToEdit.extraExpense !== null ? saleToEdit.extraExpense : 13.19));
        setPartnerFixed(String(saleToEdit.partnerFixed !== undefined && saleToEdit.partnerFixed !== null ? saleToEdit.partnerFixed : 0));
      }
    } else {
      // Default initial values for new entry
      setEntryType('sale');
      setDate(today);
      setExpenseTitle('');
      setDeductionAmount('-242.51');
      setSalePrice('450');
      setCommissionRate('4.0');
      setRealCost('55');
      setCargoBase('89.70');
      setExtraExpense('13.19');
      setPartnerFixed('0');
    }
  }, [saleToEdit, isOpen]);

  if (!isOpen) return null;

  // Live calculations for Normal Sale preview
  const numericSalePrice = parseNumeric(salePrice);
  const numericCommRate = parseNumeric(commissionRate) / 100;
  const numericRealCost = parseNumeric(realCost);
  const numericCargoBase = parseNumeric(cargoBase);
  const numericExtra = parseNumeric(extraExpense);
  const numericPartnerFixed = parseNumeric(partnerFixed);

  const prevCommAmount = numericSalePrice * numericCommRate;
  const prevCargoTotal = numericCargoBase * 1.20;
  const prevHakedis = numericSalePrice - prevCommAmount - prevCargoTotal - numericExtra;

  const prevSaleVat = numericSalePrice - (numericSalePrice / 1.20);
  const prevCommVat = prevCommAmount - (prevCommAmount / 1.20);
  const prevCargoVat = numericCargoBase * 0.20;
  const prevNetVat = Math.max(0, prevSaleVat - (prevCommVat + prevCargoVat));

  const prevIncomeTaxBase = (numericSalePrice / 1.20) - ((prevCommAmount / 1.20) + numericCargoBase);
  const prevIncomeTax = prevIncomeTaxBase > 0 ? prevIncomeTaxBase * 0.20 : 0;
  const prevPartnerTotal = prevNetVat + prevIncomeTax + numericPartnerFixed;
  const prevMyReceivable = prevHakedis - prevPartnerTotal;
  const prevMyNetProfit = prevMyReceivable - numericRealCost;

  // Live calculation for Deduction preview
  const parsedDeduction = parseNumeric(deductionAmount);
  const finalDeductionPreview = -Math.abs(parsedDeduction);

  function handleSubmit(e) {
    e.preventDefault();

    if (entryType === 'deduction') {
      const deductionVal = -Math.abs(parseNumeric(deductionAmount));
      onSave({
        id: saleToEdit?.id,
        included: saleToEdit ? saleToEdit.included : true,
        date: date || new Date().toISOString().split('T')[0],
        isExpenseRow: false,
        expenseTitle: expenseTitle.trim() || 'İade Kesintisi',
        salePrice: 0,
        vatRate: 0.20,
        commissionRate: 0.04,
        realCost: 0,
        cargoBase: 0,
        cargoVatRate: 0.20,
        extraExpense: 0,
        partnerFixed: 0,
        deduction: deductionVal
      });
    } else if (entryType === 'expense') {
      onSave({
        id: saleToEdit?.id,
        included: saleToEdit ? saleToEdit.included : true,
        date: date || new Date().toISOString().split('T')[0],
        isExpenseRow: true,
        expenseTitle: expenseTitle.trim() || 'Masraf / Kesinti',
        salePrice: parseNumeric(salePrice),
        vatRate: 0.20,
        commissionRate: 0.04,
        realCost: 0,
        cargoBase: 0,
        cargoVatRate: 0.20,
        extraExpense: 0,
        partnerFixed: 0,
        deduction: 0
      });
    } else {
      // Normal sale
      onSave({
        id: saleToEdit?.id,
        included: saleToEdit ? saleToEdit.included : true,
        date: date || new Date().toISOString().split('T')[0],
        isExpenseRow: false,
        expenseTitle: expenseTitle.trim(),
        salePrice: parseNumeric(salePrice),
        vatRate: saleToEdit?.vatRate ?? 0.20,
        commissionRate: parseNumeric(commissionRate) / 100,
        realCost: parseNumeric(realCost),
        cargoBase: parseNumeric(cargoBase),
        cargoVatRate: saleToEdit?.cargoVatRate ?? 0.20,
        extraExpense: parseNumeric(extraExpense),
        partnerFixed: parseNumeric(partnerFixed),
        deduction: 0
      });
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {saleToEdit ? `Kayıt: ${saleToEdit.id}` : 'Trendyol Finans & Mahsuplaşma'}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {saleToEdit 
                ? (entryType === 'deduction' ? 'İade / Kesinti Kaydını Düzenle' : entryType === 'expense' ? 'Masraf Kaydını Düzenle' : 'Satış Kaydını Düzenle') 
                : 'Yeni Satış, İade veya Masraf Ekle'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entry Type Selector (3 Tabs) */}
        <div className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl">
            {/* Tab 1: Normal Sale */}
            <button
              type="button"
              onClick={() => setEntryType('sale')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                entryType === 'sale'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="truncate">Normal Satış</span>
            </button>

            {/* Tab 2: Deduction (TS-006, TS-008) */}
            <button
              type="button"
              onClick={() => setEntryType('deduction')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                entryType === 'deduction'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span className="truncate">İade / Kesinti (- Bakiye)</span>
            </button>

            {/* Tab 3: External Expense */}
            <button
              type="button"
              onClick={() => setEntryType('expense')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                entryType === 'expense'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="truncate">Harici Masraf</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* TAB 2: İADE / KESİNTİ (- BAKİYE) (TS-006, TS-008 BENZERİ) */}
          {entryType === 'deduction' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>İade Süreci & Ceza Kesintisi Mantığı (TS-006 & TS-008)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-700/90 dark:text-red-300/80">
                  Bu kayıt türü, iade edilen siparişlerin gidiş/dönüş kargo masrafları ve Trendyol platform kesintileri içindir. Tıpkı tablonuzdaki <strong>TS-006</strong> ve <strong>TS-008</strong> kayıtları gibi vergi ve komisyon hesaplanmadan doğrudan <strong>Alacağınızdan (P)</strong> ve <strong>Net Kârınızdan (Q)</strong> düşülür.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Kesinti Tarihi
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Açıklama / Başlık
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: İade Kargo Kesintisi, Müşteri İadesi..."
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1 flex items-center justify-between">
                  <span>Kesilecek Tutar (₺)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Doğrudan -242.51 veya 242.51 yazabilirsiniz
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="-242.51"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-red-300 dark:border-red-800/80 rounded-xl px-3.5 py-2 text-sm font-bold font-mono text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Live Balance Preview Box */}
              <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Canlı Mahsup Önizlemesi:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Sizin Alacağınızdan Düşülecek:</span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400">
                    {finalDeductionPreview.toFixed(2)} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-2">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Kendi Net Kârınızdan Düşülecek:</span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400">
                    {finalDeductionPreview.toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: NORMAL TRENDYOL SATIŞI */}
          {entryType === 'sale' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Satış Tarihi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Satış Fiyatı (KDV Dahil ₺)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ürün / Sipariş Açıklaması (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 3D Figür Baskı, Özel Tasarım Parça..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Komisyon (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Gerçek Maliyet (₺)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={realCost}
                    onChange={(e) => setRealCost(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Kargo Matrah (₺)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cargoBase}
                    onChange={(e) => setCargoBase(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Ekstra Paket/Gider (₺)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={extraExpense}
                    onChange={(e) => setExtraExpense(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">İş Ortağı Sabit Payı (₺)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={partnerFixed}
                    onChange={(e) => setPartnerFixed(e.target.value.replace(',', '.'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Live Financial Breakdown Card */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Net Hakediş (L):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{prevHakedis.toFixed(2)} ₺</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Ortak Payı (Vergi + Sabit):</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{prevPartnerTotal.toFixed(2)} ₺</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Sizin Alacağınız (P):</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{prevMyReceivable.toFixed(2)} ₺</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Kendi Net Kârınız (Q):</span>
                  <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{prevMyNetProfit.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HARİCİ MASRAF / MAHSUPLAŞMA */}
          {entryType === 'expense' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Harici Ortaklık Gideri / Mahsuplaşma</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/80">
                  Şirket/atölye adına cebinizden yaptığınız harcamalar (örn: sarı taksi, domain faturası vb.). Bu tutardan %20 gelir vergisi düşülerek kalanı alacağınıza yansıtılır.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Masraf Tarihi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Masraf Başlığı</label>
                  <input
                    type="text"
                    placeholder="Örn: sarı taksi, natro-domain..."
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Harcanan Tutar (₺)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value.replace(',', '.'))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Gelir Vergisi Payı (%20):</span>
                  <span>{(numericSalePrice * 0.20).toFixed(2)} ₺</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>Alacağınıza Eklenecek Net Tutar:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    {(numericSalePrice * 0.80).toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs px-4 py-2.5 rounded-xl transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className={`font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md ${
                entryType === 'deduction'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : entryType === 'expense'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {saleToEdit ? 'Değişiklikleri Kaydet' : 'Kaydı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}