"use client";

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

export default function OrdersView({ 
  orders = [], 
  onNewOrderClick, 
  onUpdateOrderStatus, 
  onDeleteOrder,
  onEditOrder 
}) {
  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [previewImage, setPreviewImage] = useState(null);

  // Channels
  const channels = ['ALL', 'lokal', 'dolap', 'trendyol', 'web', 'özel'];

  // Status definitions
  const kanbanColumns = [
    { 
      id: 'Modelleme', 
      title: 'Modelleme', 
      color: 'border-amber-300 dark:border-amber-500/40 bg-amber-500/5', 
      badge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30' 
    },
    { 
      id: 'Baskıya Hazır', 
      title: 'Baskıya Hazır', 
      color: 'border-blue-300 dark:border-blue-500/40 bg-blue-500/5', 
      badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30' 
    },
    { 
      id: 'Baskıda', 
      title: 'Baskıda', 
      color: 'border-purple-300 dark:border-purple-500/40 bg-purple-500/5', 
      badge: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30' 
    },
    { 
      id: 'Tamamlandı', 
      title: 'Tamamlandı', 
      color: 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-500/5', 
      badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' 
    },
    { 
      id: 'Kargolandı / Teslim', 
      title: 'Teslim / Kargo', 
      color: 'border-slate-300 dark:border-slate-700 bg-slate-500/5', 
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' 
    }
  ];

  const allStatuses = ['Modelleme', 'Baskıya Hazır', 'Baskıda', 'Tamamlandı', 'Kargolandı / Teslim'];

  // Summary Metrics
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter(o => o.status === 'Modelleme' || o.status === 'Baskıya Hazır' || o.status === 'Baskıda');
  const completedOrders = orders.filter(o => o.status === 'Tamamlandı' || (o.status && o.status.includes('Kargo')));
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.price) || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel = selectedChannel === 'ALL' || order.channel?.toLowerCase() === selectedChannel.toLowerCase();
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getNextStatus = (current) => {
    const sequence = ['Modelleme', 'Baskıya Hazır', 'Baskıda', 'Tamamlandı', 'Kargolandı / Teslim'];
    const idx = sequence.indexOf(current);
    if (idx !== -1 && idx < sequence.length - 1) return sequence[idx + 1];
    return null;
  };

  const getColorDot = (colorStr) => {
    const c = (colorStr || '').toLowerCase();
    let bg = '#6b7280';
    if (c.includes('beyaz')) bg = '#ffffff';
    else if (c.includes('siyah')) bg = '#111827';
    else if (c.includes('gri')) bg = '#9ca3af';
    else if (c.includes('kırmızı')) bg = '#ef4444';
    else if (c.includes('mavi')) bg = '#3b82f6';
    else if (c.includes('yeşil')) bg = '#10b981';
    else if (c.includes('sarı')) bg = '#eab308';
    else if (c.includes('turuncu')) bg = '#f97316';
    return bg;
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

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & VIEW TOGGLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Canlı Üretim & Sipariş Masası</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sipariş & Üretim Yönetimi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modelleme, dilimleme, 3D baskı ve teslimat aşamalarını tek panodan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
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
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tablo</span>
            </button>
          </div>

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
        <div 
          onClick={() => { setSelectedStatus('ALL'); setSelectedChannel('ALL'); }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-orange-500/40 transition shadow-sm group"
        >
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Toplam Sipariş</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{totalOrdersCount}</span>
            <span className="text-xs text-slate-400">adet</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus('Baskıda')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-purple-500/40 transition shadow-sm group"
        >
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">Aktif Üretimde</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{activeOrders.length}</span>
            <span className="text-xs text-slate-400">işlemde</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus('Tamamlandı')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/40 transition shadow-sm group"
        >
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">Tamamlanan</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{completedOrders.length}</span>
            <span className="text-xs text-slate-400">teslim</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Kayıtlı Sipariş Cirosu</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {totalRevenue.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs font-bold text-emerald-600/80">₺</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR WITH CHANNEL COUNTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm transition-colors">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="İş adı (Fiat, Peugeot...), müşteri, kod veya renk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
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

        {/* Channel Pills with exact counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Kanal:
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
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
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
      </div>

      {/* 4. KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
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
                className={`bg-white dark:bg-slate-900 border ${col.color} rounded-3xl p-4 flex flex-col min-h-[480px] shadow-sm transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{col.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border font-mono ${col.badge}`}>
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1 scrollbar-thin">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs italic">
                      Bu aşamada sipariş yok
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const next = getNextStatus(order.status);
                      const printMin = ((Number(order.printHours) || 0) * 60) + (Number(order.printMinutes) || 0);

                      return (
                        <div
                          key={order.id}
                          className="bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-orange-500/50 rounded-2xl p-4 space-y-3 transition shadow-sm hover:shadow-md group"
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

                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditOrder(order)}
                                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
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
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Büyüt</span>
                              </div>
                            </div>
                          )}

                          {/* Title & Description */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                              {order.title}
                            </h4>
                            {order.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                {order.description}
                              </p>
                            )}
                          </div>

                          {/* Meta tags: Color, Print Time, Customer */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-slate-400 dark:border-slate-600 shadow-sm" 
                                  style={{ backgroundColor: getColorDot(order.color) }}
                                />
                                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{order.color}</span>
                              </div>

                              {printMin > 0 && (
                                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-orange-400" />
                                  <span>{order.printHours || 0}s {order.printMinutes || 0}d</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{order.customer ? `@${order.customer}` : 'Müşteri belirtilmedi'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Price & Quick Status Advance */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                            <div>
                              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                                {order.price ? `${order.price} ₺` : 'Fiyat yok'}
                              </span>
                            </div>

                            {/* Status changer select or fast next button */}
                            <div className="flex items-center gap-1">
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                className="text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer transition shadow-sm"
                              >
                                {allStatuses.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>

                              {next && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, next)}
                                  className="text-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition active:scale-95"
                                  title={`İlerle: ${next}`}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
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
        /* 5. DATA TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Sipariş No</th>
                  <th className="py-3.5 px-4">Tarih</th>
                  <th className="py-3.5 px-4">Kanal</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">İş / Model</th>
                  <th className="py-3.5 px-4">Renk</th>
                  <th className="py-3.5 px-4">Baskı Süresi</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4">Fiyat</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      Arama kriterlerine uygun sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {order.date || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getChannelBadge(order.channel)}`}>
                          {order.channel || 'lokal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {order.customer ? `@${order.customer}` : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
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
                            <span className="block truncate font-bold">{order.title}</span>
                            {order.description && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{order.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-slate-400 dark:border-slate-600" 
                            style={{ backgroundColor: getColorDot(order.color) }}
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{order.color}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {order.printHours ? `${order.printHours}s ${order.printMinutes || 0}d` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {order.price ? `${order.price} ₺` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditOrder(order)}
                            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-3" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-5 right-5 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10"
              title="Kapat"
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