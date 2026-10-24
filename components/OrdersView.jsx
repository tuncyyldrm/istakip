"use client";

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  Trash2, 
  Edit3, 
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  X,
  Maximize2,
  Clock,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  ArrowUpDown,
  Calendar,
  Layers,
  Send
} from 'lucide-react';

export default function OrdersView({ 
  orders = [], 
  onNewOrderClick, 
  onUpdateOrderStatus, 
  onDeleteOrder,
  onEditOrder 
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'Modelleme' | 'Baskıya Hazır' | 'Baskıda' | 'Tamamlandı' | 'Kargolandı / Teslim'
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'duration_desc'
  const [previewImage, setPreviewImage] = useState(null);

  // Keyboard close for image lightbox
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  // Channels
  const channels = ['ALL', 'lokal', 'dolap', 'trendyol', 'web', 'özel'];

  // Status definitions & Kanban Columns
  const kanbanColumns = [
    { 
      id: 'Modelleme', 
      title: 'Modelleme', 
      icon: Sparkles,
      color: 'border-amber-400/50 dark:border-amber-500/40 bg-amber-500/5', 
      headerBadge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30' 
    },
    { 
      id: 'Baskıya Hazır', 
      title: 'Baskıya Hazır', 
      icon: Layers,
      color: 'border-blue-400/50 dark:border-blue-500/40 bg-blue-500/5', 
      headerBadge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30' 
    },
    { 
      id: 'Baskıda', 
      title: 'Baskıda', 
      icon: Activity,
      color: 'border-purple-400/50 dark:border-purple-500/40 bg-purple-500/5', 
      headerBadge: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30' 
    },
    { 
      id: 'Tamamlandı', 
      title: 'Tamamlandı', 
      icon: CheckCircle2,
      color: 'border-emerald-400/50 dark:border-emerald-500/40 bg-emerald-500/5', 
      headerBadge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' 
    },
    { 
      id: 'Kargolandı / Teslim', 
      title: 'Teslim / Kargo', 
      icon: Send,
      color: 'border-slate-400/50 dark:border-slate-600/40 bg-slate-500/5', 
      headerBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' 
    }
  ];

  const allStatuses = ['Modelleme', 'Baskıya Hazır', 'Baskıda', 'Tamamlandı', 'Kargolandı / Teslim'];

  // Summary Metrics
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter(o => o.status === 'Modelleme' || o.status === 'Baskıya Hazır' || o.status === 'Baskıda');
  const completedOrders = orders.filter(o => o.status === 'Tamamlandı' || (o.status && (o.status.includes('Kargo') || o.status.includes('Teslim'))));
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.price) || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      order.title?.toLowerCase().includes(q) ||
      order.description?.toLowerCase().includes(q) ||
      order.customer?.toLowerCase().includes(q) ||
      order.color?.toLowerCase().includes(q) ||
      order.notes?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q);

    const matchesChannel = selectedChannel === 'ALL' || order.channel?.toLowerCase() === selectedChannel.toLowerCase();
    
    let matchesStatus = true;
    if (selectedStatus === 'ACTIVE') {
      matchesStatus = order.status === 'Modelleme' || order.status === 'Baskıya Hazır' || order.status === 'Baskıda';
    } else if (selectedStatus === 'COMPLETED') {
      matchesStatus = order.status === 'Tamamlandı' || (order.status && (order.status.includes('Kargo') || order.status.includes('Teslim')));
    } else if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'Kargolandı / Teslim') {
        matchesStatus = order.status && (order.status.includes('Kargo') || order.status.includes('Teslim'));
      } else {
        matchesStatus = order.status === selectedStatus;
      }
    }

    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Sorting
  filteredOrders.sort((a, b) => {
    if (sortBy === 'date_asc') return (a.date || '').localeCompare(b.date || '');
    if (sortBy === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
    if (sortBy === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
    if (sortBy === 'duration_desc') {
      const durA = ((Number(a.printHours) || 0) * 60) + (Number(a.printMinutes) || 0);
      const durB = ((Number(b.printHours) || 0) * 60) + (Number(b.printMinutes) || 0);
      return durB - durA;
    }
    // default: date_desc (newest first, falling back to id desc)
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.id || '').localeCompare(a.id || '');
  });

  // Status transitions
  const getPrevStatus = (current) => {
    let idx = allStatuses.indexOf(current);
    if (idx === -1 && current && (current.includes('Kargo') || current.includes('Teslim'))) {
      idx = 4;
    }
    if (idx > 0) return allStatuses[idx - 1];
    return null;
  };

  const getNextStatus = (current) => {
    let idx = allStatuses.indexOf(current);
    if (idx === -1 && current && (current.includes('Kargo') || current.includes('Teslim'))) {
      idx = 4;
    }
    if (idx !== -1 && idx < allStatuses.length - 1) return allStatuses[idx + 1];
    return null;
  };

  const getColorDot = (colorStr) => {
    const c = (colorStr || '').toLowerCase();
    if (c.includes('beyaz')) return '#ffffff';
    if (c.includes('siyah')) return '#111827';
    if (c.includes('gri')) return '#9ca3af';
    if (c.includes('kırmızı')) return '#ef4444';
    if (c.includes('mavi')) return '#3b82f6';
    if (c.includes('yeşil')) return '#10b981';
    if (c.includes('sarı')) return '#eab308';
    if (c.includes('turuncu')) return '#f97316';
    if (c.includes('şeffaf') || c.includes('naturel')) return '#e2e8f0';
    if (c.includes('altın') || c.includes('bronz')) return '#d97706';
    if (c.includes('gümüş') || c.includes('ipek')) return '#cbd5e1';
    return '#64748b';
  };

  const getChannelBadge = (channel) => {
    const ch = (channel || 'lokal').toLowerCase();
    if (ch === 'dolap') {
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
    }
    if (ch === 'trendyol') {
      return 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60';
    }
    if (ch === 'web') {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
    }
    if (ch === 'özel') {
      return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
    }
    return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  };

  const getStatusBadge = (status) => {
    if (status === 'Modelleme') {
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60';
    }
    if (status === 'Baskıya Hazır') {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800/60';
    }
    if (status === 'Baskıda') {
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800/60';
    }
    if (status === 'Tamamlandı') {
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  const isAnyFilterActive = searchQuery !== '' || selectedChannel !== 'ALL' || selectedStatus !== 'ALL';

  function resetAllFilters() {
    setSearchQuery('');
    setSelectedChannel('ALL');
    setSelectedStatus('ALL');
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* 1. TOP HEADER & VIEW TOGGLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Canlı Üretim & Sipariş Masası</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sipariş & Üretim Yönetimi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modelleme, dilimleme, 3D baskı ve teslimat aşamalarını görsel kanban panosundan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Kart Görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kompakt Tablo Görünümü"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tablo</span>
            </button>
          </div>

          {/* New Order Button */}
          <button
            onClick={() => onNewOrderClick()}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-600/25 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Sipariş</span>
          </button>
        </div>
      </div>

      {/* 2. ORDER QUICK KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: All Orders */}
        <div 
          onClick={() => { setSelectedStatus('ALL'); }}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition shadow-sm select-none group ${
            selectedStatus === 'ALL'
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20 dark:bg-orange-950/10'
              : 'border-slate-200 dark:border-slate-800 hover:border-orange-400/50'
          }`}
          title="Tüm siparişleri listele"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Toplam Sipariş</span>
            <ClipboardList className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{totalOrdersCount}</span>
            <span className="text-xs text-slate-400 font-medium">adet</span>
          </div>
        </div>

        {/* KPI 2: Active in Production */}
        <div 
          onClick={() => { setSelectedStatus(selectedStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE'); }}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition shadow-sm select-none group ${
            selectedStatus === 'ACTIVE'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/25 dark:bg-amber-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
          }`}
          title="Modelleme, Hazır ve Baskıdaki işleri filtrele"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Aktif Üretimde</span>
            <Activity className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{activeOrders.length}</span>
            <span className="text-xs text-slate-400 font-medium">işlemde</span>
          </div>
        </div>

        {/* KPI 3: Completed */}
        <div 
          onClick={() => { setSelectedStatus(selectedStatus === 'COMPLETED' ? 'ALL' : 'COMPLETED'); }}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition shadow-sm select-none group ${
            selectedStatus === 'COMPLETED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/25 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400/50'
          }`}
          title="Tamamlanan ve teslim edilen işleri filtrele"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Tamamlanan</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{completedOrders.length}</span>
            <span className="text-xs text-slate-400 font-medium">teslim</span>
          </div>
        </div>

        {/* KPI 4: Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Kayıtlı Ciro</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-600/80">₺</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR WITH CHANNELS, STATUSES & SORT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm transition-colors space-y-3">
        
        {/* Top Row: Search + Sort + Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Model başlığı, müşteri, kod, renk veya not ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Aramayı temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector & Reset Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="date_desc">En Yeni (Tarih Azalan)</option>
                <option value="date_asc">En Eski (Tarih Artan)</option>
                <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="duration_desc">Baskı Süresi (Uzundan Kısaya)</option>
              </select>
            </div>

            {isAnyFilterActive && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 px-2.5 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800 transition font-semibold"
                title="Tüm filtreleri ve aramayı sıfırla"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sıfırla</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Channel & Status Filter Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mr-1 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-slate-400" /> Kanal:
            </span>
            {channels.map((ch) => {
              const count = ch === 'ALL' 
                ? orders.length 
                : orders.filter(o => o.channel?.toLowerCase() === ch.toLowerCase()).length;
              const isSelected = selectedChannel === ch;

              return (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="uppercase">{ch === 'ALL' ? 'Tümü' : ch}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Badges (Quick Filter) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-slate-400" /> Aşama:
            </span>
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'Modelleme', label: 'Modelleme' },
              { id: 'Baskıya Hazır', label: 'Baskıya Hazır' },
              { id: 'Baskıda', label: 'Baskıda' },
              { id: 'Tamamlandı', label: 'Tamamlandı' },
              { id: 'Kargolandı / Teslim', label: 'Teslim / Kargo' }
            ].map((st) => {
              const count = st.id === 'ALL'
                ? orders.length
                : orders.filter(o => {
                    if (st.id === 'Kargolandı / Teslim') return o.status && (o.status.includes('Kargo') || o.status.includes('Teslim'));
                    return o.status === st.id;
                  }).length;
              const isSelected = selectedStatus === st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected 
                      ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex lg:grid lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 scrollbar-thin">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => {
              if (col.id === 'Kargolandı / Teslim') {
                return o.status && (o.status.includes('Kargo') || o.status.includes('Teslim'));
              }
              return o.status === col.id;
            });

            const ColIcon = col.icon;

            return (
              <div 
                key={col.id} 
                className={`min-w-[280px] lg:min-w-0 flex-1 bg-white dark:bg-slate-900 border ${col.color} rounded-3xl p-3.5 sm:p-4 flex flex-col min-h-[500px] shadow-sm transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <ColIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{col.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border font-mono ${col.headerBadge}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Add order directly to this column */}
                  <button
                    onClick={() => onNewOrderClick({ status: col.id })}
                    className="p-1 rounded-lg text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition"
                    title={`Bu aşamaya yeni sipariş ekle (${col.title})`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[720px] pr-1 scrollbar-thin">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-12 px-3 text-slate-400 dark:text-slate-500 text-xs italic bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      Bu aşamada sipariş yok
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const prev = getPrevStatus(order.status);
                      const next = getNextStatus(order.status);
                      const printMin = ((Number(order.printHours) || 0) * 60) + (Number(order.printMinutes) || 0);

                      return (
                        <div
                          key={order.id}
                          className="bg-slate-50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-orange-500/50 rounded-2xl p-3.5 space-y-3 transition shadow-xs hover:shadow-md group"
                        >
                          {/* Card Header: ID, Channel & Actions */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
                                {order.id}
                              </span>
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getChannelBadge(order.channel)}`}>
                                {order.channel || 'lokal'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditOrder(order)}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                title="Siparişi Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteOrder(order.id)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                title="Siparişi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image Thumbnail (if present) */}
                          {order.image && (
                            <div 
                              onClick={() => setPreviewImage(order.image)}
                              className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 cursor-pointer relative group/img shadow-inner"
                              title="Görseli büyüt"
                            >
                              <img 
                                src={order.image} 
                                alt={order.title} 
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Büyüt</span>
                              </div>
                            </div>
                          )}

                          {/* Title & Description */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition leading-snug">
                              {order.title}
                            </h4>
                            {order.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                {order.description}
                              </p>
                            )}
                          </div>

                          {/* Order Notes Banner (If Present) */}
                          {order.notes && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-1.5 font-medium">
                              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2 leading-tight">{order.notes}</span>
                            </div>
                          )}

                          {/* Meta tags: Color, Print Time, Customer, Date */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                            <div className="flex items-center justify-between">
                              {/* Color Badge */}
                              <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-slate-400 dark:border-slate-600 shadow-xs" 
                                  style={{ backgroundColor: getColorDot(order.color) }}
                                />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{order.color || 'Renk Belirtilmedi'}</span>
                              </div>

                              {/* Print Time */}
                              {printMin > 0 && (
                                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  <span>{order.printHours || 0}s {order.printMinutes || 0}d</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                              <span className="flex items-center gap-1 truncate max-w-[130px]">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{order.customer ? `@${order.customer}` : 'Müşteri yok'}</span>
                              </span>
                              {order.date && (
                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{order.date}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Footer: Price & Interactive Pipeline Stepper */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-700/60 gap-1.5">
                            <div>
                              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                                {order.price ? `${order.price} ₺` : 'Fiyat yok'}
                              </span>
                            </div>

                            {/* Stepper Buttons */}
                            <div className="flex items-center gap-1">
                              {/* Step Back Button */}
                              {prev && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, prev)}
                                  className="p-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition"
                                  title={`Geri Al: ${prev}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Quick Move Forward Button */}
                              {next ? (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, next)}
                                  className="text-[10px] bg-orange-600 hover:bg-orange-500 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition shadow-xs active:scale-95 whitespace-nowrap"
                                  title={`İlerle: ${next}`}
                                >
                                  <span className="truncate max-w-[70px]">{next}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Teslim</span>
                                </span>
                              )}

                              {/* Direct Status Selector Dropdown */}
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                className="text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-1 py-1 rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer transition shadow-xs max-w-[20px]"
                                title="Aşama değiştir"
                              >
                                {allStatuses.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. DATA TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Sipariş No</th>
                  <th className="py-3.5 px-4">Tarih</th>
                  <th className="py-3.5 px-4">Kanal</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">İş / Model Detayı</th>
                  <th className="py-3.5 px-4">Filament / Renk</th>
                  <th className="py-3.5 px-4">Baskı Süresi</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4">Satış Fiyatı</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      Arama ve filtre kriterlerine uygun sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      {/* 1. Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {order.id}
                      </td>

                      {/* 2. Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {order.date || '-'}
                      </td>

                      {/* 3. Channel */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getChannelBadge(order.channel)}`}>
                          {order.channel || 'lokal'}
                        </span>
                      </td>

                      {/* 4. Customer */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {order.customer ? `@${order.customer}` : '-'}
                      </td>

                      {/* 5. Title, Image & Notes */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          {order.image ? (
                            <img
                              src={order.image}
                              alt={order.title}
                              onClick={() => setPreviewImage(order.image)}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform shrink-0 shadow-sm"
                              title="Görseli büyüt"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <span className="block truncate font-bold text-slate-900 dark:text-white">{order.title}</span>
                            {order.description && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{order.description}</span>
                            )}
                            {order.notes && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block truncate flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5 shrink-0" />
                                <span>{order.notes}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 6. Filament Color */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-slate-400 dark:border-slate-600" 
                            style={{ backgroundColor: getColorDot(order.color) }}
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{order.color || 'Belirtilmedi'}</span>
                        </div>
                      </td>

                      {/* 7. Print Duration */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {order.printHours ? `${order.printHours}s ${order.printMinutes || 0}d` : '-'}
                      </td>

                      {/* 8. Status Selector Badge */}
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className={`border rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer transition shadow-xs ${getStatusBadge(order.status)}`}
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* 9. Price */}
                      <td className="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        {order.price ? `${order.price} ₺` : '-'}
                      </td>

                      {/* 10. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditOrder(order)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Enlarged Image */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-3" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-5 right-5 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10"
              title="Kapat (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Büyük Önizleme" 
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain mx-auto shadow-lg" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
