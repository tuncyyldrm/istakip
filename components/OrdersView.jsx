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
  Tag,
  ArrowUpDown,
  Calendar
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
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
    },
    { 
      id: 'Baskıya Hazır', 
      title: 'Baskıya Hazır', 
      dotColor: 'bg-sky-400',
      badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25'
    },
    { 
      id: 'Baskıda', 
      title: 'Baskıda (Yazıcıda)', 
      dotColor: 'bg-purple-400 animate-pulse',
      badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25'
    },
    { 
      id: 'Tamamlandı', 
      title: 'Tamamlandı (Paket)', 
      dotColor: 'bg-emerald-400',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    },
    { 
      id: 'Kargolandı / Teslim', 
      title: 'Teslim Edildi / Kargo', 
      dotColor: 'bg-slate-400',
      badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25'
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
    if (c.includes('beyaz')) return '#f8fafc';
    if (c.includes('siyah')) return '#0f172a';
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
      return 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30';
    }
    if (ch === 'trendyol') {
      return 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
    }
    if (ch === 'web') {
      return 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30';
    }
    if (ch === 'özel') {
      return 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
    }
    return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  };

  const isAnyFilterActive = searchQuery !== '' || selectedChannel !== 'ALL' || selectedStatus !== 'ALL';

  function resetAllFilters() {
    setSearchQuery('');
    setSelectedChannel('ALL');
    setSelectedStatus('ALL');
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* 1. COMPACT INTEGRATED CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs transition-colors space-y-3">
        
        {/* Row 1: Title, Search, View Mode, New Order */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Sipariş & Üretim Masası
                </h1>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {totalOrdersCount} Sipariş
                </span>
                {activeOrders.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{activeOrders.length} Üretimde</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Search, View Mode & New Order */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Başlık, @müşteri, kod ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'kanban' 
                    ? 'bg-orange-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Kanban Pano"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Pano</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table' 
                    ? 'bg-orange-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Kompakt Tablo"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tablo</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="date_desc">En Yeni</option>
              <option value="date_asc">En Eski</option>
              <option value="price_desc">Fiyat Azalan</option>
              <option value="duration_desc">Baskı Süresi</option>
            </select>

            {/* New Order Button */}
            <button
              onClick={() => onNewOrderClick()}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Sipariş</span>
            </button>
          </div>
        </div>

        {/* Row 2: Channel Filter Pills & Stage Filters */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Channels */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
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
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Filter: Active vs Completed vs Revenue */}
          <div className="flex items-center gap-2 shrink-0">
            {isAnyFilterActive && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sıfırla</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono pl-2 border-l border-slate-200 dark:border-slate-700">
              <span>Ciro:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KANBAN BOARD VIEW (GENEROUS HORIZONTAL FLOW, ZERO SQUISHING) */}
      {viewMode === 'kanban' ? (
        <div className="flex items-start gap-3.5 sm:gap-4 overflow-x-auto pb-6 scrollbar-thin">
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
                className="w-[260px] sm:w-[275px] min-w-[245px] flex-shrink-0 lg:flex-1 lg:min-w-[240px] lg:max-w-[320px] flex flex-col bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 min-h-[500px] transition-colors"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{col.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${col.badgeClass}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onNewOrderClick({ status: col.id })}
                    className="p-1 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition"
                    title={`Bu aşamaya yeni sipariş ekle`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[720px] pr-1 scrollbar-thin">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-12 px-3 text-slate-400 dark:text-slate-500 text-xs italic bg-white/40 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
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
                          className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-orange-500/60 dark:hover:border-orange-500/60 rounded-xl p-3 space-y-2.5 transition-all shadow-xs hover:shadow-md group"
                        >
                          {/* Card Top: ID, Customer & Channel */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
                                {order.id}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getChannelBadge(order.channel)}`}>
                                {order.channel || 'lokal'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditOrder(order)}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
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
                              className="w-full h-32 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer relative group/img"
                              title="Görseli büyüt"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={order.image} 
                                alt={order.title} 
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-150"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Büyüt</span>
                              </div>
                            </div>
                          )}

                          {/* Title & Description */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition leading-snug">
                              {order.title}
                            </h4>
                            {order.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                {order.description}
                              </p>
                            )}
                          </div>

                          {/* Notes (if present) */}
                          {order.notes && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-1.5 font-medium">
                              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{order.notes}</span>
                            </div>
                          )}

                          {/* Meta: Color, Print Time & Customer */}
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-slate-700/80 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" 
                                style={{ backgroundColor: getColorDot(order.color) }}
                              />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                {order.color || 'Renk Belirtilmedi'}
                              </span>
                            </div>

                            {printMin > 0 ? (
                              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                                <Clock className="w-3 h-3 text-orange-500" />
                                <span>{order.printHours || 0}s {order.printMinutes || 0}d</span>
                              </span>
                            ) : order.customer ? (
                              <span className="flex items-center gap-0.5 text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[90px]">
                                <User className="w-3 h-3" />
                                <span>@{order.customer}</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Card Footer: Price & Stepper */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/80 gap-1.5">
                            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {order.price ? `${order.price} ₺` : 'Fiyat yok'}
                            </span>

                            <div className="flex items-center gap-1">
                              {prev && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, prev)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition"
                                  title={`Geri al: ${prev}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {next ? (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, next)}
                                  className="text-[10px] bg-orange-600 hover:bg-orange-500 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition shadow-xs active:scale-95 whitespace-nowrap"
                                  title={`İlerle: ${next}`}
                                >
                                  <span>{next === 'Kargolandı / Teslim' ? 'Kargola / Teslim' : next === 'Baskıda' ? 'Baskıya Ver' : next}</span>
                                  <ChevronRight className="w-3 h-3 shrink-0" />
                                </button>
                              ) : (
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-500/25">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
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
        /* 3. REFINED COMPACT TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Kod / Tarih</th>
                  <th className="py-3 px-3.5">Müşteri & Kanal</th>
                  <th className="py-3 px-3.5">Model & Detay</th>
                  <th className="py-3 px-3.5">Renk & Süre</th>
                  <th className="py-3 px-3.5">Aşama</th>
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
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform shrink-0"
                              title="Büyüt"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
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
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" 
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
