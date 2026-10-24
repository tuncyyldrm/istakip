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
  User,
  Activity,
  CheckCircle2,
  FileText,
  RotateCcw,
  Calendar,
  Layers,
  Tag,
  ArrowRight
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
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [previewImage, setPreviewImage] = useState(null);

  // Keyboard close for image lightbox
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setPreviewImage(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const kanbanColumns = [
    { 
      id: 'Modelleme', 
      title: 'Modelleme & CAD', 
      dotColor: 'bg-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    { 
      id: 'Baskıya Hazır', 
      title: 'Baskıya Hazır', 
      dotColor: 'bg-sky-400',
      badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
    },
    { 
      id: 'Baskıda', 
      title: 'Baskıda (Yazıcıda)', 
      dotColor: 'bg-purple-400 animate-pulse',
      badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    { 
      id: 'Tamamlandı', 
      title: 'Tamamlandı (Paket)', 
      dotColor: 'bg-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    { 
      id: 'Kargolandı / Teslim', 
      title: 'Teslim Edildi / Kargo', 
      dotColor: 'bg-slate-400',
      badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
    }
  ];

  const channels = ['ALL', 'lokal', 'dolap', 'trendyol', 'web', 'özel'];
  const allStatuses = ['Modelleme', 'Baskıya Hazır', 'Baskıda', 'Tamamlandı', 'Kargolandı / Teslim'];

  // Metrics
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter(o => o.status === 'Modelleme' || o.status === 'Baskıya Hazır' || o.status === 'Baskıda');
  const completedOrders = orders.filter(o => o.status === 'Tamamlandı' || (o.status && (o.status.includes('Kargo') || o.status.includes('Teslim'))));
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.price) || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      Boolean(order.title && order.title.toLowerCase().includes(q)) ||
      Boolean(order.description && order.description.toLowerCase().includes(q)) ||
      Boolean(order.customer && order.customer.toLowerCase().includes(q)) ||
      Boolean(order.color && order.color.toLowerCase().includes(q)) ||
      Boolean(order.notes && order.notes.toLowerCase().includes(q)) ||
      Boolean(order.id && String(order.id).toLowerCase().includes(q));

    const orderChannel = (order.channel || 'lokal').toLowerCase();
    const matchesChannel = selectedChannel === 'ALL' || orderChannel === selectedChannel.toLowerCase();
    
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
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.id || '').localeCompare(a.id || '');
  });

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
    if (c.includes('siyah')) return '#1e293b';
    if (c.includes('gri')) return '#94a3b8';
    if (c.includes('kırmızı')) return '#f43f5e';
    if (c.includes('mavi')) return '#38bdf8';
    if (c.includes('yeşil')) return '#34d399';
    if (c.includes('sarı')) return '#facc15';
    if (c.includes('turuncu')) return '#fb923c';
    if (c.includes('şeffaf') || c.includes('naturel')) return '#e2e8f0';
    if (c.includes('altın') || c.includes('bronz')) return '#eab308';
    if (c.includes('gümüş') || c.includes('ipek')) return '#cbd5e1';
    return '#64748b';
  };

  const getChannelBadge = (channel) => {
    const ch = (channel || 'lokal').toLowerCase();
    if (ch === 'dolap') {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
    if (ch === 'trendyol') {
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    }
    if (ch === 'web') {
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    }
    if (ch === 'özel') {
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  const isAnyFilterActive = searchQuery !== '' || selectedChannel !== 'ALL' || selectedStatus !== 'ALL';

  function resetAllFilters() {
    setSearchQuery('');
    setSelectedChannel('ALL');
    setSelectedStatus('ALL');
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* 1. TOP HEADER & VIEW CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Canlı Üretim & Sipariş Masası
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sipariş & Üretim Yönetimi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modelleme, 3D baskı ve teslimat süreçlerinizi düzenli aşamalarda takip edin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Pano Görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pano (Kanban)</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kompakt Liste Görünümü"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Kompakt Tablo</span>
            </button>
          </div>

          {/* New Order Button */}
          <button
            onClick={() => onNewOrderClick()}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Sipariş</span>
          </button>
        </div>
      </div>

      {/* 2. REFINED KPI METRIC STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => setSelectedStatus('ALL')}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition select-none ${
            selectedStatus === 'ALL'
              ? 'border-orange-500 ring-2 ring-orange-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Toplam Sipariş</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{totalOrdersCount}</span>
            <span className="text-xs text-slate-400">kayıt</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition select-none ${
            selectedStatus === 'ACTIVE'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-amber-600 dark:text-amber-400">Aktif Üretimde</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{activeOrders.length}</span>
            <span className="text-xs text-slate-400">işlemde</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition select-none ${
            selectedStatus === 'COMPLETED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Tamamlanan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{completedOrders.length}</span>
            <span className="text-xs text-slate-400">teslim</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Kayıtlı Ciro</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">Brüt</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-600/80">₺</span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Başlık, müşteri (@ad), kod, renk veya not ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
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

          {/* Sort & Reset */}
          <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="date_desc">En Yeni (Tarih Azalan)</option>
              <option value="date_asc">En Eski (Tarih Artan)</option>
              <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
              <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="duration_desc">Baskı Süresi (Uzundan Kısaya)</option>
            </select>

            {isAnyFilterActive && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 px-2.5 py-2 rounded-xl border border-orange-200 dark:border-orange-800 transition font-medium"
                title="Filtreleri sıfırla"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Sıfırla</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills: Channels & Status */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Channels */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3" /> Kanal:
            </span>
            {channels.map((ch) => {
              const count = ch === 'ALL' 
                ? orders.length 
                : orders.filter(o => (o.channel || 'lokal').toLowerCase() === ch.toLowerCase()).length;
              const isSelected = selectedChannel === ch;

              return (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="uppercase">{ch === 'ALL' ? 'Tümü' : ch}</span>
                  <span className={`text-[10px] px-1 rounded-full font-mono ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Quick Select */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Aşama:
            </span>
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'Modelleme', label: 'Modelleme' },
              { id: 'Baskıya Hazır', label: 'Hazır' },
              { id: 'Baskıda', label: 'Baskıda' },
              { id: 'Tamamlandı', label: 'Tamam' },
              { id: 'Kargolandı / Teslim', label: 'Teslim' }
            ].map((st) => {
              const isSelected = selectedStatus === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => {
              if (col.id === 'Kargolandı / Teslim') {
                return o.status && (o.status.includes('Kargo') || o.status.includes('Teslim'));
              }
              return o.status === col.id;
            });

            return (
              <div 
                key={col.id} 
                className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 flex flex-col min-h-[460px] transition-colors"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">{col.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${col.badgeClass}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onNewOrderClick({ status: col.id })}
                    className="p-1 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition"
                    title={`Bu aşamaya sipariş ekle`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-0.5 scrollbar-thin">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-10 px-2 text-slate-400 text-xs italic bg-white/40 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/60">
                      Sipariş yok
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const prev = getPrevStatus(order.status);
                      const next = getNextStatus(order.status);
                      const printMin = ((Number(order.printHours) || 0) * 60) + (Number(order.printMinutes) || 0);

                      return (
                        <div
                          key={order.id}
                          className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 hover:border-orange-500/50 rounded-xl p-3 space-y-2.5 transition shadow-2xs hover:shadow-sm group"
                        >
                          {/* Card Top: ID, Customer & Channel */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                                {order.id}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold border ${getChannelBadge(order.channel)}`}>
                                {order.channel || 'lokal'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditOrder(order)}
                                className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                title="Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteOrder(order.id)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image Thumbnail (if present) */}
                          {order.image && (
                            <div 
                              onClick={() => setPreviewImage(order.image)}
                              className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer relative group/img"
                              title="Büyüt"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={order.image} 
                                alt={order.title} 
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-150"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Büyüt</span>
                              </div>
                            </div>
                          )}

                          {/* Title & Description */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                              {order.title}
                            </h4>
                            {order.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {order.description}
                              </p>
                            )}
                          </div>

                          {/* Note (if present) */}
                          {order.notes && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-1">
                              <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{order.notes}</span>
                            </div>
                          )}

                          {/* Meta: Color, Print Time & Customer */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" 
                                style={{ backgroundColor: getColorDot(order.color) }}
                              />
                              <span className="text-[10px] truncate max-w-[90px]">{order.color || 'Belirtilmedi'}</span>
                            </div>

                            {printMin > 0 ? (
                              <span className="flex items-center gap-1 text-[10px] font-mono">
                                <Clock className="w-3 h-3 text-orange-500" />
                                <span>{order.printHours || 0}s {order.printMinutes || 0}d</span>
                              </span>
                            ) : order.customer ? (
                              <span className="flex items-center gap-0.5 text-[10px] truncate max-w-[80px]">
                                <User className="w-3 h-3" />
                                <span>@{order.customer}</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Card Footer: Price & Stepper */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {order.price ? `${order.price} ₺` : 'Fiyat yok'}
                            </span>

                            <div className="flex items-center gap-1">
                              {prev && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, prev)}
                                  className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                                  title={`Geri al: ${prev}`}
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}

                              {next ? (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, next)}
                                  className="text-[10px] bg-orange-600 hover:bg-orange-500 text-white font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition active:scale-95 whitespace-nowrap"
                                  title={`İlerle: ${next}`}
                                >
                                  <span className="truncate max-w-[70px]">{next}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Teslim</span>
                                </span>
                              )}
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
        /* 5. REFINED COMPACT TABLE VIEW (6 CORE COLUMNS - ZERO HORIZONTAL SCROLL) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Kod / Tarih</th>
                  <th className="py-3 px-3.5">Müşteri & Kanal</th>
                  <th className="py-3 px-3.5">Model & Detay</th>
                  <th className="py-3 px-3.5">Renk & Baskı Süresi</th>
                  <th className="py-3 px-3.5">Üretim Aşaması</th>
                  <th className="py-3 px-3.5 text-right">Fiyat & İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      Arama kriterlerine uygun sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                    >
                      {/* 1. ID & Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-orange-600 dark:text-orange-400">
                          {order.id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {order.date || '-'}
                        </div>
                      </td>

                      {/* 2. Customer & Channel */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {order.customer ? `@${order.customer}` : 'Müşteri Belirtilmedi'}
                        </div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold border ${getChannelBadge(order.channel)}`}>
                          {order.channel || 'lokal'}
                        </span>
                      </td>

                      {/* 3. Model & Image */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5 min-w-[200px]">
                          {order.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={order.image}
                              alt={order.title}
                              onClick={() => setPreviewImage(order.image)}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform shrink-0"
                              title="Büyüt"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block font-bold text-slate-900 dark:text-white truncate">{order.title}</span>
                            {order.description && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{order.description}</span>
                            )}
                            {order.notes && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium truncate mt-0.5">
                                <FileText className="w-2.5 h-2.5 shrink-0" />
                                <span>{order.notes}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Color & Duration */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span 
                            className="w-2 h-2 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" 
                            style={{ backgroundColor: getColorDot(order.color) }}
                          />
                          <span className="text-slate-700 dark:text-slate-300">{order.color || 'Belirtilmedi'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {order.printHours ? `${order.printHours}s ${order.printMinutes || 0}d` : '-'}
                        </div>
                      </td>

                      {/* 5. Status Dropdown */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* 6. Price & Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                          {order.price ? `${order.price} ₺` : '-'}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <button
                            onClick={() => onEditOrder(order)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition"
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

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-2" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewImage} 
              alt="Büyük Görsel" 
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain mx-auto" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
