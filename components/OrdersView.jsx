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
  Maximize2
} from 'lucide-react';

export default function OrdersView({ 
  orders, 
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

  const channels = ['ALL', 'lokal', 'dolap', 'trendyol', 'web', 'özel'];
  const kanbanColumns = [
    { id: 'Modelleme', title: 'Modelleme', color: 'border-amber-300 dark:border-amber-500/40 bg-amber-500/5', badge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30' },
    { id: 'Baskıya Hazır', title: 'Baskıya Hazır', color: 'border-blue-300 dark:border-blue-500/40 bg-blue-500/5', badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30' },
    { id: 'Baskıda', title: 'Baskıda', color: 'border-purple-300 dark:border-purple-500/40 bg-purple-500/5', badge: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30' },
    { id: 'Tamamlandı', title: 'Tamamlandı', color: 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-500/5', badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' },
    { id: 'Kargolandı / Teslim', title: 'Teslim / Kargo', color: 'border-gray-300 dark:border-gray-600 bg-gray-500/5', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700' }
  ];

  const filteredOrders = (orders || []).filter((order) => {
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Canlı Üretim & Sipariş Masası</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sipariş & Üretim Yönetimi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modelleme, dilimleme, baskı ve teslimat süreçlerini tek ekrandan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm transition-colors">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="İş, model, müşteri veya renk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Kanal:
          </span>
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${
                selectedChannel === ch
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {ch === 'ALL' ? 'Tümü' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
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
                className={`bg-white/80 dark:bg-gray-900/70 border ${col.color} rounded-3xl p-4 flex flex-col min-h-[450px] shadow-sm transition-colors`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">{col.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${col.badge}`}>
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 dark:text-gray-600 text-xs italic">
                      Bu aşamada sipariş yok
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const next = getNextStatus(order.status);
                      return (
                        <div
                          key={order.id}
                          className="bg-gray-50 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/80 hover:border-blue-500/50 rounded-2xl p-4 space-y-2.5 transition shadow-sm group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-cyan-800/50">
                                {order.id}
                              </span>
                              <span className="ml-1.5 text-[10px] uppercase font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700">
                                {order.channel}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                              <button
                                onClick={() => onEditOrder(order)}
                                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1"
                                title="Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteOrder(order.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Model Görseli (Eğer varsa) */}
                          {order.image && (
                            <div 
                              onClick={() => setPreviewImage(order.image)}
                              className="w-full h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 cursor-pointer relative group/img shadow-inner"
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

                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">
                              {order.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                              {order.description || 'Detay girilmedi'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700/60 text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-gray-400 dark:border-gray-600 shadow-sm" 
                                style={{ backgroundColor: getColorDot(order.color) }}
                              />
                              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{order.color}</span>
                            </div>

                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                              {order.customer ? `@${order.customer}` : '-'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {order.price ? `${order.price} ₺` : 'Fiyat yok'}
                            </span>

                            {next && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, next)}
                                className="text-[10px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/30 dark:hover:bg-blue-600/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                                title={`Bir sonraki aşama: ${next}`}
                              >
                                <span>{next}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
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
        /* DATA TABLE */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3.5 px-4">Sipariş No</th>
                  <th className="py-3.5 px-4">Tarih</th>
                  <th className="py-3.5 px-4">Kanal</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">İş / Model</th>
                  <th className="py-3.5 px-4">Renk</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4">Fiyat</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                      Kriterlere uygun sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {order.date || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {order.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                        {order.customer || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          {order.image ? (
                            <img
                              src={order.image}
                              alt={order.title}
                              onClick={() => setPreviewImage(order.image)}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform shrink-0 shadow-sm"
                              title="Görseli büyüt"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block truncate">{order.title}</span>
                            {order.description && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal block truncate max-w-xs">{order.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-gray-400 dark:border-gray-600" 
                            style={{ backgroundColor: getColorDot(order.color) }}
                          />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{order.color}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                          <option value="Modelleme">Modelleme</option>
                          <option value="Baskıya Hazır">Baskıya Hazır</option>
                          <option value="Baskıda">Baskıda</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                          <option value="Kargolandı / Teslim">Kargolandı</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                        {order.price ? `${order.price} ₺` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditOrder(order)}
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
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

      {/* Büyük Görsel Önizleme Modalı (Lightbox) */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-3" onClick={e => e.stopPropagation()}>
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
