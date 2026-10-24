"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit3,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowDownRight,
  CheckCircle2,
  X,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function TrendyolFinanceView({ 
  sales = [], 
  onNewSaleClick, 
  onToggleSale, 
  onDeleteSale,
  onEditSale 
}) {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL'); // 'ALL' | 'SALES' | 'DEDUCTIONS' | 'EXPENSES'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [sortBy, setSortBy] = useState('date_desc');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Safe currency formatter to guarantee NO "NaN ₺" under any circumstance
  const safeFormat = (val, fallback = '0.00 ₺') => {
    const n = Number(val);
    if (isNaN(n) || n === null || n === undefined) return fallback;
    return `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
  };

  // Safe cargo with VAT calculation
  const getCargoWithVat = (row) => {
    const base = Number(row?.cargoBase);
    const safeBase = isNaN(base) ? 0 : base;
    const vat = Number(row?.cargoVatRate);
    const safeVat = isNaN(vat) ? 0.20 : vat;
    return safeBase * (1 + safeVat);
  };

  // Active items for KPI totals
  const activeItems = (sales || []).filter(s => s.included !== false);

  // KPI Calculations
  const totalHakedis = activeItems.reduce((acc, s) => acc + (Number(s.hakedis) || 0), 0);
  const totalPartnerShare = activeItems.reduce((acc, s) => acc + (Number(s.partnerTotalShare) || 0), 0);
  const totalReceivable = activeItems.reduce((acc, s) => acc + (Number(s.myReceivable) || 0) + (Number(s.deduction) || 0), 0);
  const totalNetProfit = activeItems.reduce((acc, s) => acc + (Number(s.myNetProfit) || 0) + (Number(s.deduction) || 0), 0);
  const totalNetVat = activeItems.reduce((acc, s) => acc + (Number(s.netVat) || 0), 0);
  const totalIncomeTax = activeItems.reduce((acc, s) => acc + (Number(s.incomeTax) || 0), 0);
  const totalGrossSale = activeItems.reduce((acc, s) => acc + (Number(s.salePrice) || 0), 0);
  const totalRealCost = activeItems.reduce((acc, s) => acc + (Number(s.realCost) || 0), 0);

  // Count breakdowns
  const salesCount = (sales || []).filter(s => !s.isExpenseRow && Number(s.deduction || 0) === 0).length;
  const deductionsCount = (sales || []).filter(s => Number(s.deduction || 0) < 0).length;
  const expensesCount = (sales || []).filter(s => s.isExpenseRow).length;
  const totalDeductionsAmount = Math.abs(
    activeItems.filter(s => Number(s.deduction || 0) < 0).reduce((acc, s) => acc + Number(s.deduction), 0)
  );

  const profitMarginPercent = totalGrossSale > 0 
    ? Math.max(0, Math.round((totalNetProfit / totalGrossSale) * 100))
    : 0;

  // Filter & Search
  let processedList = (sales || []).filter((row) => {
    if (filterActiveOnly && !row.included) return false;

    const isDeduction = Number(row.deduction) < 0;
    const isExpense = Boolean(row.isExpenseRow);
    const isNormalSale = !isDeduction && !isExpense;

    if (activeCategoryFilter === 'SALES' && !isNormalSale) return false;
    if (activeCategoryFilter === 'DEDUCTIONS' && !isDeduction) return false;
    if (activeCategoryFilter === 'EXPENSES' && !isExpense) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (row.id || '').toLowerCase().includes(q);
      const matchDate = (row.date || '').toLowerCase().includes(q);
      const matchTitle = (row.expenseTitle || '').toLowerCase().includes(q);
      const matchPrice = String(row.salePrice || '').includes(q) || String(row.deduction || '').includes(q);
      if (!matchId && !matchDate && !matchTitle && !matchPrice) return false;
    }

    return true;
  });

  // Sorting
  processedList.sort((a, b) => {
    if (sortBy === 'date_asc') return (a.date || '').localeCompare(b.date || '');
    if (sortBy === 'profit_desc') {
      const valA = Number(a.deduction) < 0 ? Number(a.deduction) : Number(a.myNetProfit || 0);
      const valB = Number(b.deduction) < 0 ? Number(b.deduction) : Number(b.myNetProfit || 0);
      return valB - valA;
    }
    return (b.date || '').localeCompare(a.date || '');
  });

  function toggleRowExpand(id) {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  const isAllExpanded = processedList.length > 0 && processedList.every(r => expandedRows[r.id]);

  function toggleExpandAll() {
    if (isAllExpanded) {
      setExpandedRows({});
    } else {
      const all = {};
      processedList.forEach(r => { all[r.id] = true; });
      setExpandedRows(all);
    }
  }

  function handleExportCSV() {
    const headers = [
      "Kayıt No", "Dahil", "Tarih", "Açıklama", "Tür", "Satış Fiyatı (TL)",
      "Komisyon Oranı", "Gerçek Maliyet (TL)", "Kargo Matrah (TL)", "Hakediş (TL)",
      "Net KDV (TL)", "Gelir Vergisi (TL)", "Ortak Payı (TL)",
      "Sizin Alacağınız (TL)", "Net Kârınız (TL)", "Kesinti (TL)"
    ];
    
    const rows = processedList.map(s => [
      s.id,
      s.included ? "EVET" : "HAYIR",
      s.date || "",
      `"${(s.expenseTitle || (Number(s.deduction) < 0 ? "İade Kesintisi" : "")).replace(/"/g, '""')}"`,
      s.isExpenseRow ? "Harici Masraf" : Number(s.deduction) < 0 ? "İade Kesintisi" : "Normal Satış",
      Number(s.salePrice || 0).toFixed(2),
      Number(s.commissionRate || 0).toFixed(4),
      Number(s.realCost || 0).toFixed(2),
      Number(s.cargoBase || 0).toFixed(2),
      Number(s.hakedis || 0).toFixed(2),
      Number(s.netVat || 0).toFixed(2),
      Number(s.incomeTax || 0).toFixed(2),
      Number(s.partnerTotalShare || 0).toFixed(2),
      Number(s.myReceivable || 0).toFixed(2),
      Number(s.myNetProfit || 0).toFixed(2),
      Number(s.deduction || 0).toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trendyol_finans_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleCopySummary() {
    const summary = `📊 TRENDYOL FİNANS MUTABAKAT ÖZETİ (${new Date().toLocaleDateString('tr-TR')}):
• Toplam Aktif İşlem: ${activeItems.length} kayıt
• Trendyol Net Hakediş: ${safeFormat(totalHakedis)}
• İş Ortaklığı & Vergi Payı: ${safeFormat(totalPartnerShare)}
• SİZİN NET ALACAĞINIZ: ${safeFormat(totalReceivable)}
• KENDİ NET KÂRINIZ: ${safeFormat(totalNetProfit)}`;
    
    navigator.clipboard.writeText(summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2200);
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Pazar Yeri Hakediş & Dağıtım Masası
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Trendyol Finans & Kâr Paylaşımı
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Satış gelirleri, komisyon, kargo, vergi ve net kârınızı şeffaf dökümle yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95"
            title="Excel uyumlu CSV indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV İndir</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95"
            title="Özeti kopyala"
          >
            {copyFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Layers className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copyFeedback ? 'Kopyalandı' : 'Özet Kopyala'}</span>
          </button>

          <button
            onClick={() => onNewSaleClick()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Kayıt</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Hakedis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Trendyol Hakediş</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded font-mono">
              Net Aktarılan
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {totalHakedis.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-blue-600/80">₺</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Brüt Satış - Komisyon - Kargo - Ekstra</p>
        </div>

        {/* Card 2: Partner Share */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Vergi & Ortak Payı</span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded font-mono">
              KDV + Stopaj
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {totalPartnerShare.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-purple-600/80">₺</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Net KDV: <strong className="text-slate-700 dark:text-slate-300 font-mono">{totalNetVat.toFixed(1)} ₺</strong></span>
            <span>Stopaj: <strong className="text-slate-700 dark:text-slate-300 font-mono">{totalIncomeTax.toFixed(1)} ₺</strong></span>
          </div>
        </div>

        {/* Card 3: Sizin Alacağınız */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 ring-1 ring-emerald-500/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>SİZİN NET ALACAĞINIZ</span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
              Kalan Bakiye
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalReceivable.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-600/80">₺</span>
          </div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Hakedişten ortaklık payı ve iadeler düşüldükten sonra</p>
        </div>

        {/* Card 4: Sizin Net Kârınız */}
        <div className="bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 ring-1 ring-cyan-500/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cyan-700 dark:text-cyan-400 font-semibold">
            <span>KENDİ NET KÂRINIZ</span>
            <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/15 px-1.5 py-0.2 rounded font-mono">
              %{profitMarginPercent} Marj
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {totalNetProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-cyan-600/80">₺</span>
          </div>
          <p className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80 mt-1">
            Üretim maliyeti ({safeFormat(totalRealCost)}) düşüldükten sonra net kazanç
          </p>
        </div>
      </div>

      {/* 3. DEDUCTION NOTICE BANNER (If deductions exist) */}
      {deductionsCount > 0 && (
        <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-red-800 dark:text-red-300">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              <strong>{deductionsCount} İade & Kesinti:</strong> Masraflar doğrudan alacağınızdan ve kârınızdan düşülmüştür.
            </span>
          </div>
          <span className="font-mono font-bold text-red-600 dark:text-red-400">
            -{safeFormat(totalDeductionsAmount)}
          </span>
        </div>
      )}

      {/* 4. TOOLBAR: SEARCH & CATEGORY PILLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Kayıt no (TS-006), tarih veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills & Actions */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-0.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            {[
              { id: 'ALL', label: 'Tümü', count: (sales || []).length },
              { id: 'SALES', label: 'Satışlar', count: salesCount },
              { id: 'DEDUCTIONS', label: 'İadeler (-)', count: deductionsCount },
              { id: 'EXPENSES', label: 'Masraflar', count: expensesCount }
            ].map((tab) => {
              const isSelected = activeCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Included Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 whitespace-nowrap select-none hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className="text-[11px] font-medium">Sadece Dahil Olanlar ({activeItems.length})</span>
          </label>

          {/* Expand / Collapse All Details */}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 whitespace-nowrap select-none hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
            title={isAllExpanded ? "Tüm ayrıntıları gizle" : "Tüm ayrıntıları aç"}
          >
            {isAllExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{isAllExpanded ? 'Ayrıntıları Gizle' : 'Tümünü Aç'}</span>
          </button>
        </div>
      </div>

      {/* 5. STREAMLINED 6-COLUMN TABLE (NO HORIZONTAL MOUSE SCROLLING!) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3 text-center w-10">Dahil</th>
                <th className="py-3 px-3.5">Kayıt / Tarih</th>
                <th className="py-3 px-3.5">Brüt Tutar</th>
                <th className="py-3 px-3.5 text-blue-600 dark:text-blue-400">Trendyol Hakediş</th>
                <th className="py-3 px-3.5 text-purple-600 dark:text-purple-400">Ortak Payı</th>
                <th className="py-3 px-3.5 text-cyan-600 dark:text-cyan-400">Net Kârınız</th>
                <th className="py-3 px-3.5 text-right">Ayrıntılar & İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {processedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Kriterlere uygun finansal kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                processedList.map((row) => {
                  const isExpense = row.isExpenseRow;
                  const isDeduction = Number(row.deduction) < 0;
                  const isExpanded = Boolean(expandedRows[row.id]);
                  const cargoTotal = getCargoWithVat(row);

                  return (
                    <React.Fragment key={row.id}>
                      {/* MAIN COMPACT ROW */}
                      <tr 
                        onClick={() => toggleRowExpand(row.id)}
                        className={`transition cursor-pointer select-none ${
                          !row.included 
                            ? 'opacity-40 bg-slate-50/50 dark:bg-slate-950/30' 
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        } ${
                          isExpanded ? 'bg-slate-50/90 dark:bg-slate-800/60' : ''
                        }`}
                      >
                        {/* 1. Included Checkbox */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onToggleSale(row.id)}
                            className="text-slate-400 hover:text-emerald-600 transition p-1"
                            title={row.included ? "Hesaplamadan çıkar" : "Hesaplamaya dahil et"}
                          >
                            {row.included ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* 2. ID, Date & Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {row.id}
                            </span>
                            {isExpense ? (
                              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded font-bold border border-amber-500/20">
                                MASRAF
                              </span>
                            ) : isDeduction ? (
                              <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.2 rounded font-bold border border-red-500/20">
                                İADE KESİNTİSİ
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-emerald-500/20">
                                SATIŞ
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {row.date || '-'} {row.expenseTitle ? `• ${row.expenseTitle}` : ''}
                          </div>
                        </td>

                        {/* 3. Sale Price or Deduction */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono font-semibold">
                          {isDeduction ? (
                            <span className="text-red-600 dark:text-red-400 font-bold">
                              {safeFormat(row.deduction)}
                            </span>
                          ) : (
                            <span className="text-slate-800 dark:text-slate-200">
                              {safeFormat(row.salePrice)}
                            </span>
                          )}
                        </td>

                        {/* 4. Hakedis */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400">
                          {isDeduction ? '-' : safeFormat(row.hakedis)}
                        </td>

                        {/* 5. Partner Share */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-purple-600 dark:text-purple-400">
                          {isDeduction ? '-' : safeFormat(row.partnerTotalShare)}
                        </td>

                        {/* 6. Net Profit */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {isDeduction ? (
                            <span className="text-red-600 dark:text-red-400">
                              {safeFormat(row.deduction)}
                            </span>
                          ) : (
                            safeFormat(row.myNetProfit)
                          )}
                        </td>

                        {/* 7. Accordion Toggle & Actions */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleRowExpand(row.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                                isExpanded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 border border-slate-200 dark:border-slate-700'
                              }`}
                              title={isExpanded ? "Ayrıntıları Gizle" : "Ayrıntıları Göster"}
                            >
                              <span>Ayrıntı</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onEditSale(row)}
                              className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Düzenle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSale(row.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDABLE ACCORDION DRAWER (FULL WATERFALL BREAKDOWN) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl p-4 shadow-xs">
                              
                              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-mono text-slate-900 dark:text-white">{row.id}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-600 dark:text-slate-300">
                                    {isDeduction ? 'İade & Ceza Kesintisi Dökümü' : isExpense ? 'Harici Masraf Dökümü' : 'Kuruşu Kuruşuna Finansal Hesaplama'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">{row.date}</span>
                              </div>

                              {isDeduction ? (
                                <div className="space-y-2 text-xs text-red-800 dark:text-red-300">
                                  <p>
                                    Bu işlem Trendyol tarafından yansıtılan bir iade kargo ve ceza kesintisidir. Komisyon ve KDV hesaplanmadan doğrudan <strong>Alacağınızdan ({safeFormat(row.deduction)})</strong> ve <strong>Kârınızdan ({safeFormat(row.deduction)})</strong> düşülmüştür.
                                  </p>
                                </div>
                              ) : isExpense ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] text-slate-400 block">Harcanan Tutar</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{safeFormat(row.salePrice)}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] text-slate-400 block">Ortak Stopaj Payı (%20)</span>
                                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{safeFormat(row.incomeTax)}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] text-slate-400 block">Sizin Net Alacağınız</span>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{safeFormat(row.myReceivable)}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  
                                  {/* Col 1: Platform & Hakedis */}
                                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                                      1. Satış & Trendyol Kesintileri
                                    </span>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Satış Fiyatı:</span>
                                      <span className="font-mono font-semibold">{safeFormat(row.salePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Komisyon (%{((Number(row.commissionRate ?? 0.04)) * 100).toFixed(1)}):</span>
                                      <span className="font-mono text-red-500">
                                        -{safeFormat((Number(row.salePrice || 0) * Number(row.commissionRate || 0.04)))}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Kargo (KDV Dahil):</span>
                                      <span className="font-mono text-red-500">
                                        -{safeFormat(cargoTotal)}
                                      </span>
                                    </div>
                                    {Number(row.cargoBase || 0) > 0 && (
                                      <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                                        <span>Matrah: {safeFormat(row.cargoBase)} + KDV %20</span>
                                        <span className="font-mono">{safeFormat(Number(row.cargoBase || 0) * 0.20)}</span>
                                      </div>
                                    )}
                                    {Number(row.extraExpense || 0) > 0 && (
                                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Ek Masraf:</span>
                                        <span className="font-mono text-red-500">-{safeFormat(row.extraExpense)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                                      <span>Trendyol Hakediş:</span>
                                      <span className="font-mono">{safeFormat(row.hakedis)}</span>
                                    </div>
                                  </div>

                                  {/* Col 2: Taxes & Partner */}
                                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block mb-1">
                                      2. Vergi & Ortaklık Payı
                                    </span>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Net KDV Borcu:</span>
                                      <span className="font-mono">{safeFormat(row.netVat)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Gelir Vergisi (Stopaj):</span>
                                      <span className="font-mono">{safeFormat(row.incomeTax)}</span>
                                    </div>
                                    {Number(row.partnerFixed || 0) > 0 && (
                                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Ortak Sabit Payı:</span>
                                        <span className="font-mono">{safeFormat(row.partnerFixed)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400">
                                      <span>Toplam Ortak Payı:</span>
                                      <span className="font-mono">{safeFormat(row.partnerTotalShare)}</span>
                                    </div>
                                  </div>

                                  {/* Col 3: Profit */}
                                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                                      3. Sizin Net Kazancınız
                                    </span>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Ortaktan Alacağınız:</span>
                                      <span className="font-mono font-semibold">{safeFormat(row.myReceivable)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>Filament / Maliyet:</span>
                                      <span className="font-mono text-slate-400">-{safeFormat(row.realCost)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400 text-sm">
                                      <span>Kendi Net Kârınız:</span>
                                      <span className="font-mono">{safeFormat(row.myNetProfit)}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
