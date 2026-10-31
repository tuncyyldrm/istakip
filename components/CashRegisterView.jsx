"use client";

import React, { useState } from 'react';
import { 
  Wallet, 
  Trash2, 
  Calendar, 
  Coins, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Search,
  X,
  Tag,
  AlertCircle,
  Package,
  Truck,
  Coffee,
  User,
  Building2,
  RotateCcw,
  Landmark,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Edit3
} from 'lucide-react';

export default function CashRegisterView({ 
  cashSessions = [], 
  onAddCashSession, 
  onUpdateCashSession,
  onDeleteCashSession 
}) {
  // Mode: 'outflow' (Para Çıkışı / Masraf) | 'inflow' (Para Girişi / Sayım)
  const [entryMode, setEntryMode] = useState('outflow');

  // Currently editing record ID (if null -> new entry mode)
  const [editingId, setEditingId] = useState(null);

  // Common date (defaults to today)
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);

  // --- OUTFLOW FORM STATES ---
  const [outflowAmount, setOutflowAmount] = useState('');
  const [outflowCategory, setOutflowCategory] = useState('Sarf & Atölye');
  const [outflowNote, setOutflowNote] = useState('');
  const [useDenomsForOutflow, setUseDenomsForOutflow] = useState(false);
  const [outflowDenoms, setOutflowDenoms] = useState({
    "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0
  });

  // --- INFLOW FORM STATES ---
  const [inflowDenoms, setInflowDenoms] = useState({
    "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0
  });
  const [inflowCategory, setInflowCategory] = useState('Nakit Tahsilat');
  const [inflowNote, setInflowNote] = useState('');

  // --- HISTORY LIST FILTER & SEARCH ---
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'INFLOW' | 'OUTFLOW'
  const [searchQuery, setSearchQuery] = useState('');

  // Predefined Outflow Categories with Icons
  const outflowCategories = [
    { label: 'Sarf & Atölye', icon: Package, desc: 'Filament, vida, alet' },
    { label: 'Kargo & Paket', icon: Truck, desc: 'Koli, bant, kargo' },
    { label: 'Yemek & Mutfak', icon: Coffee, desc: 'Atölye ikramı, çay' },
    { label: 'Şahsi / Avans', icon: User, desc: 'Ortak / şahsi nakit' },
    { label: 'Fatura & Gider', icon: Building2, desc: 'Elektrik, su, gider' },
    { label: 'Müşteri İadesi', icon: RotateCcw, desc: 'Nakit iade' },
    { label: 'Banka Yatırılan', icon: Landmark, desc: 'Hesaba aktarılan' },
    { label: 'Diğer Masraf', icon: Receipt, desc: 'Diğer nakit çıkışı' }
  ];

  // Predefined Inflow Categories
  const inflowCategories = [
    'Nakit Tahsilat',
    'Gün Sonu Sayımı',
    'Kasa Açılış / Devir',
    'Elden Ek Ödeme',
    'Diğer Giriş'
  ];

  // Quick Amount Increments for Outflow
  const quickAmountSteps = [50, 100, 200, 500, 1000];

  function addQuickAmount(val) {
    const current = parseFloat(String(outflowAmount).replace(',', '.')) || 0;
    const nextVal = current + val;
    setOutflowAmount(String(nextVal));
    if (useDenomsForOutflow) setUseDenomsForOutflow(false);
  }

  // Calculations for Inflow
  const inflowTotal = Object.entries(inflowDenoms).reduce((acc, [k, v]) => acc + Number(k) * (Number(v) || 0), 0);

  // Calculations for Outflow
  const outflowDenomTotal = Object.entries(outflowDenoms).reduce((acc, [k, v]) => acc + Number(k) * (Number(v) || 0), 0);
  const effectiveOutflowAmount = useDenomsForOutflow
    ? outflowDenomTotal
    : parseFloat(String(outflowAmount).replace(',', '.')) || 0;

  // Global Kasa Metrics
  const safeSessions = cashSessions || [];
  const totalInflows = safeSessions
    .filter(s => (Number(s.total) || 0) > 0)
    .reduce((acc, s) => acc + Number(s.total), 0);

  const totalOutflows = Math.abs(
    safeSessions
      .filter(s => (Number(s.total) || 0) < 0)
      .reduce((acc, s) => acc + Number(s.total), 0)
  );

  const netBalance = totalInflows - totalOutflows;
  const inflowCount = safeSessions.filter(s => (Number(s.total) || 0) > 0).length;
  const outflowCount = safeSessions.filter(s => (Number(s.total) || 0) < 0).length;

  // Live Simulation
  const simulatedBalanceAfter = entryMode === 'inflow'
    ? netBalance + inflowTotal
    : netBalance - effectiveOutflowAmount;

  // Handlers for Denominations
  function handleInflowDenomChange(nom, count) {
    setInflowDenoms({
      ...inflowDenoms,
      [nom]: Math.max(0, parseInt(count, 10) || 0)
    });
  }

  function handleOutflowDenomChange(nom, count) {
    const updated = {
      ...outflowDenoms,
      [nom]: Math.max(0, parseInt(count, 10) || 0)
    };
    setOutflowDenoms(updated);
    const sum = Object.entries(updated).reduce((acc, [k, v]) => acc + Number(k) * (Number(v) || 0), 0);
    setOutflowAmount(String(sum));
  }

  // Start Editing a Transaction
  function startEditing(session) {
    setEditingId(session.id);
    const rawTotal = Number(session.total) || 0;
    const isOutflow = rawTotal < 0 || session.type === 'outflow';

    setEntryMode(isOutflow ? 'outflow' : 'inflow');
    setSessionDate(session.date || new Date().toISOString().split('T')[0]);

    if (isOutflow) {
      setOutflowAmount(String(Math.abs(rawTotal)));
      setOutflowCategory(session.category || 'Diğer Masraf');
      setOutflowNote(session.note || '');
      const hasDenoms = session.denominations && 
        typeof session.denominations === 'object' && 
        Object.values(session.denominations).some(c => Number(c) > 0);
      
      if (hasDenoms) {
        setUseDenomsForOutflow(true);
        setOutflowDenoms({
          "200": Number(session.denominations["200"]) || 0,
          "100": Number(session.denominations["100"]) || 0,
          "50": Number(session.denominations["50"]) || 0,
          "20": Number(session.denominations["20"]) || 0,
          "10": Number(session.denominations["10"]) || 0,
          "5": Number(session.denominations["5"]) || 0
        });
      } else {
        setUseDenomsForOutflow(false);
        setOutflowDenoms({ "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 });
      }
    } else {
      setInflowCategory(session.category || 'Nakit Tahsilat');
      setInflowNote(session.note || '');
      setInflowDenoms({
        "200": Number(session.denominations?.["200"]) || 0,
        "100": Number(session.denominations?.["100"]) || 0,
        "50": Number(session.denominations?.["50"]) || 0,
        "20": Number(session.denominations?.["20"]) || 0,
        "10": Number(session.denominations?.["10"]) || 0,
        "5": Number(session.denominations?.["5"]) || 0
      });
    }

    // Smooth scroll into form
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Cancel Editing
  function cancelEditing() {
    setEditingId(null);
    setOutflowAmount('');
    setOutflowNote('');
    setOutflowCategory('Sarf & Atölye');
    setUseDenomsForOutflow(false);
    setOutflowDenoms({ "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 });
    setInflowDenoms({ "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 });
    setInflowNote('');
    setInflowCategory('Nakit Tahsilat');
  }

  // Submit Inflow
  function handleSaveInflow(e) {
    e.preventDefault();
    if (inflowTotal <= 0) {
      alert('Lütfen en az bir banknot adedi girin.');
      return;
    }

    const payload = {
      date: sessionDate,
      total: inflowTotal,
      type: 'inflow',
      category: inflowCategory,
      denominations: inflowDenoms,
      note: inflowNote.trim()
    };

    if (editingId && onUpdateCashSession) {
      onUpdateCashSession(editingId, payload);
      cancelEditing();
      return;
    }

    onAddCashSession(payload);
    setInflowDenoms({ "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 });
    setInflowNote('');
  }

  // Submit Outflow
  function handleSaveOutflow(e) {
    e.preventDefault();
    if (effectiveOutflowAmount <= 0) {
      alert('Lütfen geçerli bir çıkış tutarı girin.');
      return;
    }

    if (!editingId && effectiveOutflowAmount > netBalance) {
      const confirmExceed = window.confirm(
        `Uyarı: Kasadan çıkmak istediğiniz tutar (${effectiveOutflowAmount.toLocaleString('tr-TR')} ₺), mevcut kasa mevcudundan (${netBalance.toLocaleString('tr-TR')} ₺) daha fazladır. Kasa eksiye düşecektir.\n\nİşlemi onaylıyor musunuz?`
      );
      if (!confirmExceed) return;
    }

    const payload = {
      date: sessionDate,
      total: -Math.abs(effectiveOutflowAmount),
      type: 'outflow',
      category: outflowCategory,
      denominations: useDenomsForOutflow ? outflowDenoms : {},
      note: outflowNote.trim()
    };

    if (editingId && onUpdateCashSession) {
      onUpdateCashSession(editingId, payload);
      cancelEditing();
      return;
    }

    onAddCashSession(payload);
    setOutflowAmount('');
    setOutflowNote('');
    setOutflowDenoms({ "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 });
    setUseDenomsForOutflow(false);
  }

  // Processed History List
  const processedSessions = [...safeSessions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || ''))
    .filter((session) => {
      const isOutflow = (Number(session.total) || 0) < 0 || session.type === 'outflow';
      if (historyFilter === 'INFLOW' && isOutflow) return false;
      if (historyFilter === 'OUTFLOW' && !isOutflow) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = (session.note || '').toLowerCase().includes(q);
        const matchCat = (session.category || '').toLowerCase().includes(q);
        const matchDate = (session.date || '').toLowerCase().includes(q);
        const matchAmount = String(Math.abs(Number(session.total) || 0)).includes(q);
        if (!matchNote && !matchCat && !matchDate && !matchAmount) return false;
      }
      return true;
    });

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* 1. TOP HEADER & TITLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Fiziki Kasa & Nakit Akış Masası
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Nakit Kasa & Harcama Yönetimi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Elden tahsilatlar, gün sonu banknot sayımları ve atölye nakit harcamalarının anlık takibi.
          </p>
        </div>

        {/* Live Net Balance Pill in Header */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Wallet className="w-4 h-4 text-amber-500" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block leading-none">Net Kasa</span>
            <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 leading-none">
              {netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺
            </span>
          </div>
        </div>
      </div>

      {/* 2. REFINED 4-CARD KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Net Kasa Mevcudu */}
        <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Net Kasa Mevcudu</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-amber-600/80">₺</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Kasadaki fiili nakit mevcudu</p>
        </div>

        {/* Card 2: Toplam Girişler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Toplam Nakit Girişi</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +{totalInflows.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-600/80">₺</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{inflowCount} tahsilat & kupür sayımı</p>
        </div>

        {/* Card 3: Toplam Çıkışlar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-rose-600 dark:text-rose-400">Toplam Nakit Çıkışı</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              -{totalOutflows.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-rose-600/80">₺</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{outflowCount} harcama & gider ödemesi</p>
        </div>

        {/* Card 4: Toplam Hareket */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Toplam Hareket</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {safeSessions.length}
            </span>
            <span className="text-xs text-slate-400">işlem</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{inflowCount} Giriş • {outflowCount} Çıkış</p>
        </div>
      </div>

      {/* 3. WORKSPACE: LEFT ACTION FORM (5 COLS) + RIGHT HISTORY FEED (7 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: ACTION FORM WITH INTEGRATED SEGMENTED TABS   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-3.5">
          
          {/* Active Editing Notification Banner */}
          {editingId && (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold">Kayıt Düzenleniyor: <strong className="font-mono">{editingId}</strong></span>
              </div>
              <button
                type="button"
                onClick={cancelEditing}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 transition"
              >
                <X className="w-3 h-3" />
                <span>İptal / Vazgeç</span>
              </button>
            </div>
          )}

          {/* Integrated Segmented Mode Tabs directly above the Form */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 dark:border-slate-700/70">
            <button
              type="button"
              onClick={() => setEntryMode('outflow')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                entryMode === 'outflow'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nakit Çıkışı (Masraf)</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('inflow')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                entryMode === 'inflow'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nakit Girişi (Sayım)</span>
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* TAB 1: NAKİT ÇIKIŞI / MASRAF FORMU                   */}
          {/* ---------------------------------------------------- */}
          {entryMode === 'outflow' && (
            <form onSubmit={handleSaveOutflow} className="space-y-3.5 animate-fadeIn">
              
              {/* Çıkış Tutarı & Quick Increments */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Çıkış Tutarı (₺) *</span>
                  {outflowAmount && (
                    <button
                      type="button"
                      onClick={() => setOutflowAmount('')}
                      className="text-[10px] text-slate-400 hover:text-rose-500"
                    >
                      Temizle
                    </button>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold font-mono text-rose-500 text-lg">-</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={outflowAmount}
                    onChange={(e) => {
                      setOutflowAmount(e.target.value.replace(',', '.'));
                      if (useDenomsForOutflow) setUseDenomsForOutflow(false);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 rounded-xl pl-8 pr-10 py-2 text-lg font-bold font-mono text-rose-600 dark:text-rose-400 placeholder-slate-400 transition"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-sm font-bold text-slate-400">₺</span>
                </div>

                {/* Quick Add Pills */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-0.5">
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">+ Hızlı:</span>
                  {quickAmountSteps.map(step => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => addQuickAmount(step)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition shrink-0"
                    >
                      +{step} ₺
                    </button>
                  ))}
                </div>
              </div>

              {/* Çıkış Nedeni (Kategori) - Compact 4x2 Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Çıkış Kategorisi:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {outflowCategories.map((cat) => {
                    const isSelected = outflowCategory === cat.label;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setOutflowCategory(cat.label)}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold transition flex items-center gap-2 ${
                          isSelected
                            ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-400/80 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                        <span className="truncate text-[11px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Note in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Çıkış Tarihi
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Açıklama / Fiş No
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 2 rulo koli bandı..."
                    value={outflowNote}
                    onChange={(e) => setOutflowNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              {/* Optional Denomination Drawer Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setUseDenomsForOutflow(!useDenomsForOutflow)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Banknot Kupürleriyle Belirt (Opsiyonel)</span>
                  </span>
                  {useDenomsForOutflow ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {useDenomsForOutflow && (
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 animate-fadeIn">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Kasadan çıkan banknot adetleri:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[200, 100, 50, 20, 10, 5].map((nom) => (
                        <div key={nom} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                          <span className="text-[10px] font-bold text-slate-500 block">{nom} ₺</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={outflowDenoms[String(nom)] || ''}
                            onChange={(e) => handleOutflowDenomChange(nom, e.target.value)}
                            className="w-full text-center font-bold text-xs bg-slate-50 dark:bg-slate-800 rounded p-1 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Live Kasa Simulation Box (Fixed Dark Mode Bug) */}
              <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>Mevcut Kasa:</span>
                  <span className="font-mono font-semibold">{netBalance.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-[11px]">
                  <span>Düşülecek Çıkış:</span>
                  <span className="font-mono font-bold">-{effectiveOutflowAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                  <span>Çıkış Sonrası Kasa:</span>
                  <span className={`font-mono text-sm ${simulatedBalanceAfter < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {simulatedBalanceAfter.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                {simulatedBalanceAfter < 0 && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Bu çıkış kasayı eksi bakiyeye düşürecektir.</span>
                  </div>
                )}
              </div>

              {/* Submit / Update Buttons */}
              <div className="space-y-1.5">
                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-semibold text-xs sm:text-sm py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  {editingId ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : <Minus className="w-4 h-4 stroke-[2.5]" />}
                  <span>{editingId ? 'Çıkış Değişikliklerini Güncelle' : 'Nakit Çıkışını Onayla ve Kasadan Düş'}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                  >
                    Vazgeç ve Yeni Kayda Dön
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 2: NAKİT GİRİŞİ / SAYIM FORMU                    */}
          {/* ---------------------------------------------------- */}
          {entryMode === 'inflow' && (
            <form onSubmit={handleSaveInflow} className="space-y-3.5 animate-fadeIn">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Sayım Tarihi
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Giriş Türü
                  </label>
                  <select
                    value={inflowCategory}
                    onChange={(e) => setInflowCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    {inflowCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Compact 2-Column Denomination Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  Banknot Kupür Adetleri:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[200, 100, 50, 20, 10, 5].map((nom) => {
                    const count = inflowDenoms[String(nom)] || 0;
                    const subTotal = nom * count;
                    return (
                      <div 
                        key={nom} 
                        className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="w-12 font-bold text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-1 rounded text-center border border-slate-200 dark:border-slate-700 shrink-0">
                          {nom} ₺
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={count === 0 ? '' : count}
                          onChange={(e) => handleInflowDenomChange(nom, e.target.value)}
                          className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white text-center font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 w-16 text-right truncate">
                          {subTotal > 0 ? `${subTotal}₺` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Açıklama / Not (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Hafta sonu atölye tahsilatı..."
                  value={inflowNote}
                  onChange={(e) => setInflowNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Total & Simulation Box (Fixed Dark Mode Bug) */}
              <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Bu Sayımın Toplamı:</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Kasaya eklenecek</span>
                </div>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  +{inflowTotal.toLocaleString('tr-TR')} ₺
                </span>
              </div>

              {/* Submit / Update Buttons */}
              <div className="space-y-1.5">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-semibold text-xs sm:text-sm py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  {editingId ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                  <span>{editingId ? 'Sayım Değişikliklerini Güncelle' : 'Sayımı Kaydet ve Kasaya Ekle'}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                  >
                    Vazgeç ve Yeni Kayda Dön
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: CLEAN FINTECH TRANSACTION FEED (7 COLS)    */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-4">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Kasa Hareketleri Geçmişi
              </h3>
              <p className="text-[11px] text-slate-400">
                Giriş ve çıkışların kronolojik akışı ({processedSessions.length} kayıt)
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setHistoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  historyFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tümü ({safeSessions.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('INFLOW')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  historyFilter === 'INFLOW'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Girişler ({inflowCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('OUTFLOW')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  historyFilter === 'OUTFLOW'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                }`}
              >
                <Minus className="w-3 h-3" />
                <span>Çıkışlar ({outflowCount})</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Açıklama, kategori, tarih veya tutar ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Transactions Feed */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {processedSessions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Kriterlere uygun kasa hareketi bulunamadı.
              </div>
            ) : (
              processedSessions.map((session) => {
                const totalVal = Number(session.total) || 0;
                const isOutflow = totalVal < 0 || session.type === 'outflow';
                const absAmount = Math.abs(totalVal);
                const isBeingEdited = editingId === session.id;
                
                // Only show kupür if there is at least one non-zero count
                const hasValidDenoms = session.denominations && 
                  typeof session.denominations === 'object' && 
                  Object.values(session.denominations).some(c => Number(c) > 0);

                return (
                  <div
                    key={session.id}
                    className={`rounded-xl p-3 border transition-all flex items-start justify-between gap-3 ${
                      isBeingEdited
                        ? 'ring-2 ring-amber-500/80 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15'
                        : isOutflow
                          ? 'bg-rose-50/25 dark:bg-rose-950/15 border-rose-200/70 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Left Side: Icon + Details */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Round Type Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isOutflow
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isOutflow ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Title & Category */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {session.category || (isOutflow ? 'Nakit Masraf' : 'Nakit Tahsilat')}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                            isOutflow 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isOutflow ? 'ÇIKIŞ' : 'GİRİŞ'}
                          </span>
                          {isBeingEdited && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white animate-pulse">
                              DÜZENLENİYOR
                            </span>
                          )}
                        </div>

                        {/* Note & Date */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{session.date}</span>
                          </span>
                          {session.note && (
                            <>
                              <span>•</span>
                              <span className="text-slate-700 dark:text-slate-300 italic truncate max-w-xs sm:max-w-md">
                                {session.note}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Denominations breakdown (if recorded with >0 count) */}
                        {hasValidDenoms && (
                          <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                            {[200, 100, 50, 20, 10, 5].map((nom) => {
                              const count = session.denominations?.[String(nom)] || 0;
                              if (count <= 0) return null;
                              return (
                                <span 
                                  key={nom}
                                  className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                  {nom}₺: <strong>{count}</strong>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Amount & Actions (Edit + Delete) */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <span className={`font-mono font-bold text-sm sm:text-base mr-1 ${
                        isOutflow
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isOutflow ? '-' : '+'}{absAmount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => startEditing(session)}
                        className={`p-1.5 rounded-lg transition ${
                          isBeingEdited
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                        title="Bu kasa hareketini düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDeleteCashSession(session.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Bu hareketi sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Net Summary */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kasa mevcudu toplamı:</span>
            <span className="font-bold font-mono text-sm text-amber-600 dark:text-amber-400">
              {netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
