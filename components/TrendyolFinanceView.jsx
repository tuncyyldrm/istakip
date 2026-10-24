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
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  ArrowDownRight,
  Receipt,
  Sparkles,
  Layers,
  Percent,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  X
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
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'profit_desc'
  const [copyFeedback, setCopyFeedback] = useState(false);

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

  // Estimated profit margin percentage
  const profitMarginPercent = totalGrossSale > 0 
    ? Math.max(0, Math.round((totalNetProfit / totalGrossSale) * 100))
    : 0;

  // Filter & Search
  let processedList = (sales || []).filter((row) => {
    // 1. Included filter
    if (filterActiveOnly && !row.included) return false;

    // 2. Category filter
    const isDeduction = Number(row.deduction) < 0;
    const isExpense = Boolean(row.isExpenseRow);
    const isNormalSale = !isDeduction && !isExpense;

    if (activeCategoryFilter === 'SALES' && !isNormalSale) return false;
    if (activeCategoryFilter === 'DEDUCTIONS' && !isDeduction) return false;
    if (activeCategoryFilter === 'EXPENSES' && !isExpense) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = row.id?.toLowerCase().includes(q);
      const matchDate = row.date?.toLowerCase().includes(q);
      const matchTitle = row.expenseTitle?.toLowerCase().includes(q);
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
    // default date_desc
    return (b.date || '').localeCompare(a.date || '');
  });

  // Toggle row expansion for waterfall detail
  function toggleRowExpand(id) {
    setExpandedRowId(prev => prev === id ? null : id);
  }

  // Export to Excel / CSV with Turkish character support (UTF-8 BOM)
  function handleExportCSV() {
    const headers = [
      "Kayıt No", "Dahil", "Tarih", "Açıklama", "Kayıt Türü", "Satış Fiyatı (TL)",
      "Komisyon Oranı", "Gerçek Maliyet (TL)", "Kargo Matrah (TL)", "Hakediş L (TL)",
      "Net KDV M (TL)", "Gelir Vergisi N (TL)", "Ortak Payı O (TL)",
      "Sizin Alacağınız P (TL)", "Kendi Net Kârınız Q (TL)", "Kesinti (TL)"
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

  // Quick summary copy
  function handleCopySummary() {
    const summary = `📊 TRENDYOL FİNANS MUTABAKAT ÖZETİ (${new Date().toLocaleDateString('tr-TR')}):
• Toplam Aktif İşlem: ${activeItems.length} kayıt
• Trendyol Net Hakediş (L): ${totalHakedis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
• İş Ortaklığı & Vergi Payı (O): ${totalPartnerShare.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
• SİZİN NET ALACAĞINIZ (P): ${totalReceivable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
• KENDİ NET KÂRINIZ (Q): ${totalNetProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    
    navigator.clipboard.writeText(summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pazar Yeri Hakediş & Kâr Dağıtım Masası</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Trendyol Finans, Hakediş & Kâr Paylaşımı
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Satış gelirleri, platform komisyonları, iade kesintileri, KDV borcu, gelir vergisi ve net kârınız.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
            title="Excel uyumlu CSV indir"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Excel / CSV İndir</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
            title="Finansal özeti panoya kopyala"
          >
            {copyFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            <span className="hidden sm:inline">{copyFeedback ? 'Kopyalandı!' : 'Özeti Kopyala'}</span>
          </button>

          <button
            onClick={() => onNewSaleClick()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Satış / İade / Masraf</span>
          </button>
        </div>
      </div>

      {/* 2. TOP FINANCIAL KPI METRICS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Trendyol Net Hakedis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Trendyol Net Hakediş (L)</span>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold border border-blue-200 dark:border-blue-500/20">
              Yatacak Tutar
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {totalHakedis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80">₺</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Brüt Satış - Komisyon - Kargo - Ekstra
          </p>
        </div>

        {/* Card 2: Partner & Tax Share */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">İş Ortaklığı & Vergi Payı (O)</span>
            <span className="text-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded font-mono font-bold border border-purple-200 dark:border-purple-500/20">
              Vergi + Pay
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
              {totalPartnerShare.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-purple-600/80 dark:text-purple-400/80">₺</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Net KDV: <strong className="text-slate-700 dark:text-slate-300 font-mono">{totalNetVat.toFixed(1)} ₺</strong></span>
            <span>Gelir V.: <strong className="text-slate-700 dark:text-slate-300 font-mono">{totalIncomeTax.toFixed(1)} ₺</strong></span>
          </div>
        </div>

        {/* Card 3: Your Total Receivable (Primary Focus) */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
            <span>SİZİN KALAN ALACAĞINIZ (P)</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-500/30">
              Net Bakiye
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {totalReceivable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-emerald-600/80">₺</span>
          </div>
          <p className="text-[11px] text-emerald-700/90 dark:text-slate-400 mt-2">
            Hakedişten ortaklık payı ve iade kesintileri düşüldükten sonra kalan
          </p>
        </div>

        {/* Card 4: Your Real Net Profit (Clean Profit) */}
        <div className="bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-cyan-800 dark:text-cyan-400 font-semibold">
            <span>KENDİ NET KÂRINIZ (Q)</span>
            <span className="text-[10px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-300 dark:border-cyan-500/30">
              Temiz Kâr (%{profitMarginPercent})
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {totalNetProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-cyan-600/80">₺</span>
          </div>
          <p className="text-[11px] text-cyan-700/90 dark:text-slate-400 mt-2">
            Net Alacağınız - Gerçek Filament & Üretim Maliyeti ({totalRealCost.toLocaleString('tr-TR')} ₺)
          </p>
        </div>
      </div>

      {/* 3. DEDUCTIONS & RETURNS ALERT BANNER (If there are return deductions) */}
      {deductionsCount > 0 && (
        <div className="bg-red-50/80 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-800 dark:text-red-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 font-bold">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                İade & Ceza Kesintileri: Toplam {deductionsCount} Adet Kayıt
              </span>
              <p className="text-[11px] text-red-700/80 dark:text-red-400/80 mt-0.5">
                İade kargo masrafları ve platform kesintileri doğrudan Alacağınızdan (P) ve Net Kârınızdan (Q) düşülmüştür.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-black font-mono text-sm text-red-600 dark:text-red-400">
              -{totalDeductionsAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
            <button
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'DEDUCTIONS' ? 'ALL' : 'DEDUCTIONS')}
              className="text-[11px] font-bold bg-white dark:bg-slate-900 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800/80 px-2.5 py-1 rounded-lg transition"
            >
              {activeCategoryFilter === 'DEDUCTIONS' ? 'Tümünü Göster' : 'Sadece İadeleri Filtrele'}
            </button>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL TABLE CONTROLS & FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm transition-colors">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Kayıt no (TS-006), tarih veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills & Included Checkbox */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          
          {/* Category Tabs with counters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            {[
              { id: 'ALL', label: 'Tümü', count: (sales || []).length },
              { id: 'SALES', label: 'Satışlar', count: salesCount },
              { id: 'DEDUCTIONS', label: 'İadeler (-)', count: deductionsCount, color: 'text-red-500' },
              { id: 'EXPENSES', label: 'Masraflar', count: expensesCount, color: 'text-amber-500' }
            ].map((tab) => {
              const isSelected = activeCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Included Only Filter */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 whitespace-nowrap select-none hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className="text-[11px] font-semibold">Sadece Dahil Olanlar ({activeItems.length})</span>
          </label>
        </div>
      </div>

      {/* 5. FINANCIAL TABLE WITH SUPER-HEADER GROUPING */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            
            {/* SUPER HEADER ROW (GROUPINGS) */}
            <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              <tr>
                <th colSpan="3" className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-left">
                  📦 Sipariş / İşlem Bilgisi
                </th>
                <th colSpan="4" className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-left text-blue-600 dark:text-blue-400">
                  🏢 Pazar Yeri & Lojistik (Trendyol)
                </th>
                <th colSpan="3" className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-left text-purple-600 dark:text-purple-400">
                  🏛️ Vergi & Ortaklık Payı (O Sütunu)
                </th>
                <th colSpan="2" className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-left text-emerald-600 dark:text-emerald-400">
                  💰 Sizin Net Kazancınız
                </th>
                <th className="py-2 px-3 text-right">
                  İşlem
                </th>
              </tr>

              {/* SUB HEADER ROW (INDIVIDUAL COLUMNS) */}
              <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                <th className="py-2.5 px-3 text-center w-10">Dahil</th>
                <th className="py-2.5 px-3">Tarih / Açıklama</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800">Satış Fiyatı</th>
                
                <th className="py-2.5 px-3">Komisyon</th>
                <th className="py-2.5 px-3">Maliyet (₺)</th>
                <th className="py-2.5 px-3">Kargo (KDV'li)</th>
                <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-extrabold border-r border-slate-200 dark:border-slate-800">
                  Hakediş (L)
                </th>

                <th className="py-2.5 px-3 text-purple-600 dark:text-purple-300">Net KDV (M)</th>
                <th className="py-2.5 px-3 text-purple-600 dark:text-purple-300">Gelir V. (N)</th>
                <th className="py-2.5 px-3 text-purple-600 dark:text-purple-400 font-extrabold border-r border-slate-200 dark:border-slate-800">
                  Ortak Payı (O)
                </th>

                <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold">
                  Alacağınız (P)
                </th>
                <th className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-extrabold border-r border-slate-200 dark:border-slate-800">
                  Net Kârınız (Q)
                </th>

                <th className="py-2.5 px-3 text-right">Yönet</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processedList.length === 0 ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Kriterlere uygun finansal kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                processedList.map((row) => {
                  const isExpense = row.isExpenseRow;
                  const isDeduction = Number(row.deduction) < 0;
                  const isExpanded = expandedRowId === row.id;

                  return (
                    <React.Fragment key={row.id}>
                      <tr 
                        className={`transition cursor-pointer select-none ${
                          !row.included 
                            ? 'opacity-40 bg-slate-50 dark:bg-slate-950/40' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        } ${
                          isExpense ? 'bg-amber-50/50 dark:bg-amber-950/15' : ''
                        } ${
                          isDeduction ? 'bg-red-50/60 dark:bg-red-950/20' : ''
                        } ${
                          isExpanded ? 'ring-1 ring-inset ring-emerald-500/30' : ''
                        }`}
                        onClick={() => toggleRowExpand(row.id)}
                      >
                        {/* 1. Included Checkbox */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onToggleSale(row.id)}
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition p-1"
                            title={row.included ? "Hesaplamadan çıkar" : "Hesaplamaya dahil et"}
                          >
                            {row.included ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                            )}
                          </button>
                        </td>

                        {/* 2. Date & Title / Badges */}
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {row.id}
                            </span>

                            {isExpense ? (
                              <div>
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                                    MASRAF
                                  </span>
                                  <span>{row.expenseTitle || 'Masraf / Kesinti'}</span>
                                </div>
                                {row.date && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {row.date}
                                  </div>
                                )}
                              </div>
                            ) : isDeduction ? (
                              <div>
                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                                  <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                                    İADE / KESİNTİ
                                  </span>
                                  <span>{row.expenseTitle || 'İade Kesintisi'}</span>
                                </div>
                                {row.date && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {row.date}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
                                  {row.date || '-'}
                                </div>
                                {row.expenseTitle && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                                    {row.expenseTitle}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Sale Price */}
                        <td className="py-3 px-3 font-semibold font-mono text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                          {isDeduction ? (
                            <span className="text-red-600 dark:text-red-400 font-bold">
                              {Number(row.deduction).toFixed(2)} ₺
                            </span>
                          ) : (
                            `${Number(row.salePrice || 0).toFixed(2)} ₺`
                          )}
                        </td>

                        {/* 4. Commission */}
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
                          {isExpense || isDeduction ? '-' : `%${(() => {
                            const raw = Number(row.commissionRate ?? 0.04) * 100;
                            return raw % 1 === 0 ? raw.toFixed(1) : String(Number(raw.toFixed(3)));
                          })()}`}
                        </td>

                        {/* 5. Real Cost */}
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
                          {isExpense || isDeduction ? '-' : `${row.realCost ?? 0} ₺`}
                        </td>

                        {/* 6. Cargo Total */}
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
                          {isExpense || isDeduction ? '-' : `${(Number(row.cargoBase || 0) * (1 + Number(row.cargoVatRate || 0.20))).toFixed(2)} ₺`}
                        </td>

                        {/* 7. Hakedis (L) */}
                        <td className="py-3 px-3 font-bold font-mono text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                          {isDeduction ? '-' : `${Number(row.hakedis || 0).toFixed(2)} ₺`}
                        </td>

                        {/* 8. Net KDV (M) */}
                        <td className="py-3 px-3 text-purple-600 dark:text-purple-300 font-mono">
                          {isExpense || isDeduction ? '0.00 ₺' : `${Number(row.netVat || 0).toFixed(2)} ₺`}
                        </td>

                        {/* 9. Income Tax (N) */}
                        <td className="py-3 px-3 text-purple-600 dark:text-purple-300 font-mono">
                          {isDeduction ? '-' : `${Number(row.incomeTax || 0).toFixed(2)} ₺`}
                        </td>

                        {/* 10. Partner Total Share (O) */}
                        <td className="py-3 px-3 font-bold font-mono text-purple-600 dark:text-purple-400 border-r border-slate-100 dark:border-slate-800">
                          {isDeduction ? '-' : `${Number(row.partnerTotalShare || 0).toFixed(2)} ₺`}
                        </td>

                        {/* 11. Your Receivable (P) */}
                        <td className="py-3 px-3 font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                          {isDeduction ? (
                            <span className="text-red-600 dark:text-red-400">
                              {Number(row.deduction).toFixed(2)} ₺
                            </span>
                          ) : (
                            `${Number(row.myReceivable || 0).toFixed(2)} ₺`
                          )}
                        </td>

                        {/* 12. Your Net Profit (Q) */}
                        <td className="py-3 px-3 font-black font-mono text-cyan-600 dark:text-cyan-400 text-sm border-r border-slate-100 dark:border-slate-800">
                          {isDeduction ? (
                            <span className="text-red-600 dark:text-red-400">
                              {Number(row.deduction).toFixed(2)} ₺
                            </span>
                          ) : (
                            `${Number(row.myNetProfit || 0).toFixed(2)} ₺`
                          )}
                        </td>

                        {/* 13. Actions & Expand Chevron */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleRowExpand(row.id)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Hesaplama detayını göster"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onEditSale(row)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

                      {/* INLINE WATERFALL DETAIL DRAWER FOR EXPANDED ROW */}
                      {isExpanded && (
                        <tr className="bg-slate-100/70 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800 text-xs">
                          <td colSpan="13" className="p-4 sm:p-5">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-orange-500 text-xs">{row.id}</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {isDeduction ? 'İade & Ceza Kesintisi Dökümü' : isExpense ? 'Harici Ortaklık Gideri Dökümü' : 'Kuruşu Kuruşuna Finansal Şelale Dökümü'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono">Tarih: {row.date || 'Belirtilmedi'}</span>
                              </div>

                              {isDeduction ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 space-y-1">
                                    <span className="font-bold block">İade Kesintisi Nedir?</span>
                                    <p className="text-[11px] text-red-700/80 dark:text-red-300/80 leading-relaxed">
                                      Müşteri iadesi veya kargo iade masrafı gibi durumlarda Trendyol tarafından faturadan kesilen doğrudan giderdir. Vergi ve ortaklık payı uygulanmaz; doğrudan Sizin Alacağınızdan (P) ve Net Kârınızdan (Q) düşülür.
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Kesinti Tutarı:</span>
                                      <strong className="text-red-600 dark:text-red-400 font-mono font-bold">{row.deduction} ₺</strong>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                                      <span className="text-slate-500">Alacaktan / Kârdan Net Düşüş:</span>
                                      <strong className="text-red-600 dark:text-red-400 font-mono font-bold">{row.deduction} ₺</strong>
                                    </div>
                                  </div>
                                </div>
                              ) : isExpense ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Yapılan Harcama</span>
                                    <span className="text-base font-black font-mono text-slate-900 dark:text-white">{Number(row.salePrice).toFixed(2)} ₺</span>
                                    <p className="text-[10px] text-slate-500">Ortaklık adına cebinizden çıkan gider</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Gelir Vergisi Payı (%20)</span>
                                    <span className="text-base font-black font-mono text-purple-600 dark:text-purple-400">{Number(row.incomeTax).toFixed(2)} ₺</span>
                                    <p className="text-[10px] text-slate-500">Şirket vergisi için ayrılan pay</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
                                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold block">3. Alacağınıza Yansıyan</span>
                                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{Number(row.myReceivable).toFixed(2)} ₺</span>
                                    <p className="text-[10px] text-emerald-700/80">Cebinize geri dönecek net bakiye</p>
                                  </div>
                                </div>
                              ) : (
                                /* Normal Sale 4-Step Waterfall */
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                  
                                  {/* Step 1: Gross Sale */}
                                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Müşteri Satış Fiyatı</span>
                                    <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                                      {Number(row.salePrice).toFixed(2)} ₺
                                    </div>
                                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                                      <div className="flex justify-between">
                                        <span>KDV Oranı:</span>
                                        <span className="font-mono">%{(Number(row.vatRate || 0.2) * 100).toFixed(0)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>KDV Hariç Matrah:</span>
                                        <span className="font-mono">{(Number(row.salePrice) / 1.20).toFixed(2)} ₺</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Step 2: Trendyol Deductions */}
                                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">2. Trendyol Hakediş (L)</span>
                                    <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                                      {Number(row.hakedis).toFixed(2)} ₺
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-blue-200 dark:border-blue-900/40">
                                      <div className="flex justify-between">
                                        <span>Komisyon (%{(() => {
                                          const raw = Number(row.commissionRate ?? 0.04) * 100;
                                          return raw % 1 === 0 ? raw.toFixed(1) : String(Number(raw.toFixed(3)));
                                        })()}):</span>
                                        <span className="font-mono text-red-500">-{(Number(row.salePrice || 0) * Number(row.commissionRate ?? 0.04)).toFixed(2)} ₺</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Kargo (KDV Dahil):</span>
                                        <span className="font-mono text-red-500">-{(Number(row.cargoBase || 0) * (1 + Number(row.cargoVatRate || 0.20))).toFixed(2)} ₺</span>
                                      </div>
                                      {Number(row.extraExpense) > 0 && (
                                        <div className="flex justify-between">
                                          <span>Ekstra Gider:</span>
                                          <span className="font-mono text-red-500">-{Number(row.extraExpense).toFixed(2)} ₺</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Step 3: Tax & Partner Share */}
                                  <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">3. Vergi & Ortak Payı (O)</span>
                                    <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                                      {Number(row.partnerTotalShare).toFixed(2)} ₺
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-purple-200 dark:border-purple-900/40">
                                      <div className="flex justify-between">
                                        <span>Net KDV Borcu (M):</span>
                                        <span className="font-mono">{Number(row.netVat).toFixed(2)} ₺</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Gelir Vergisi (%20 N):</span>
                                        <span className="font-mono">{Number(row.incomeTax).toFixed(2)} ₺</span>
                                      </div>
                                      {Number(row.partnerFixed) > 0 && (
                                        <div className="flex justify-between">
                                          <span>Ortak Sabit Pay:</span>
                                          <span className="font-mono">{Number(row.partnerFixed).toFixed(2)} ₺</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Step 4: Net Payout & Profit */}
                                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">4. Sizin Net Kazancınız</span>
                                    <div className="flex items-baseline justify-between">
                                      <span className="text-xs text-slate-500">Kalan Alacak (P):</span>
                                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                                        {Number(row.myReceivable).toFixed(2)} ₺
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-emerald-200 dark:border-emerald-500/30">
                                      <div className="flex justify-between">
                                        <span>Filament & Baskı Maliyeti:</span>
                                        <span className="font-mono text-red-500">-{Number(row.realCost || 0).toFixed(2)} ₺</span>
                                      </div>
                                      <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                                        <span className="text-cyan-800 dark:text-cyan-400">TEMİZ NET KÂR (Q):</span>
                                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold">+{Number(row.myNetProfit).toFixed(2)} ₺</span>
                                      </div>
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

            {/* TABLE FOOTER (ACTIVE TOTALS) */}
            <tfoot className="bg-slate-100 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <tr>
                <td colSpan="3" className="py-4 px-3 text-right text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  TOPLAM (Aktif Dahil Edilenler - {activeItems.length} Kalem):
                </td>
                
                <td colSpan="3" className="py-4 px-3 text-slate-400 font-normal text-right">
                  Brüt Ciro: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalGrossSale.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                </td>

                <td className="py-4 px-3 text-blue-600 dark:text-blue-400 text-sm font-mono border-r border-slate-200 dark:border-slate-800">
                  {totalHakedis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>

                <td className="py-4 px-3 text-purple-600 dark:text-purple-300 font-mono">
                  {totalNetVat.toFixed(2)} ₺
                </td>

                <td className="py-4 px-3 text-purple-600 dark:text-purple-300 font-mono">
                  {totalIncomeTax.toFixed(2)} ₺
                </td>

                <td className="py-4 px-3 text-purple-600 dark:text-purple-400 text-sm font-mono border-r border-slate-200 dark:border-slate-800">
                  {totalPartnerShare.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>

                <td className="py-4 px-3 text-emerald-600 dark:text-emerald-400 text-base font-black font-mono">
                  {totalReceivable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>

                <td className="py-4 px-3 text-cyan-600 dark:text-cyan-400 text-base font-black font-mono border-r border-slate-200 dark:border-slate-800">
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