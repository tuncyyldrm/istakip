"use client";

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Minus, 
  PlusCircle, 
  Wrench, 
  Box, 
  Sparkles,
  X,
  Search,
  Filter
} from 'lucide-react';

export default function InventoryView({
  printers,
  inventory,
  onUpdatePrinter,
  onPatchPrinter,
  onCreateItem,
  onUpdateItem,
  onAdjustQuantity,
  onDeleteItem
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [formData, setFormData] = useState({
    category: 'filament',
    name: '',
    brand: '',
    material: 'PLA',
    color: 'Siyah',
    quantity: 1000,
    unit: 'gr',
    minThreshold: 200,
    unitPrice: 900,
    location: '',
    notes: ''
  });

  // Printer edit state
  const [editingPrinter, setEditingPrinter] = useState(null);

  // Calculations
  const totalInventoryValue = (inventory || []).reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    if (item.category === 'filament') {
      return acc + (price * (qty / 1000));
    }
    return acc + (price * qty);
  }, 0);

  const lowStockItems = (inventory || []).filter(
    item => item.minThreshold > 0 && item.quantity <= item.minThreshold
  );

  const filteredItems = (inventory || []).filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'LOW_STOCK') return item.minThreshold > 0 && item.quantity <= item.minThreshold;
    return item.category === activeFilter;
  });

  function openCreateModal(category = 'filament') {
    setItemToEdit(null);
    setFormData({
      category,
      name: '',
      brand: category === 'filament' ? 'eSun' : '',
      material: category === 'filament' ? 'PLA' : '',
      color: category === 'filament' ? 'Siyah' : '',
      quantity: category === 'filament' ? 1000 : 10,
      unit: category === 'filament' ? 'gr' : 'adet',
      minThreshold: category === 'filament' ? 200 : 5,
      unitPrice: category === 'filament' ? 900 : 25,
      location: '',
      notes: ''
    });
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setItemToEdit(item);
    setFormData({
      category: item.category || 'consumable',
      name: item.name || '',
      brand: item.brand || '',
      material: item.material || '',
      color: item.color || '',
      quantity: item.quantity || 0,
      unit: item.unit || 'adet',
      minThreshold: item.minThreshold || 0,
      unitPrice: item.unitPrice || 0,
      location: item.location || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  }

  function handleSaveItem(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Lütfen bir malzeme adı girin.');
      return;
    }

    if (itemToEdit) {
      onUpdateItem(itemToEdit.id, formData);
    } else {
      onCreateItem(formData);
    }
    setIsModalOpen(false);
  }

  function getColorDot(colorStr) {
    const c = (colorStr || '').toLowerCase();
    if (c.includes('beyaz')) return '#ffffff';
    if (c.includes('siyah')) return '#111827';
    if (c.includes('gri')) return '#9ca3af';
    if (c.includes('kırmızı')) return '#ef4444';
    if (c.includes('mavi')) return '#3b82f6';
    if (c.includes('yeşil')) return '#10b981';
    if (c.includes('sarı')) return '#eab308';
    if (c.includes('turuncu')) return '#f97316';
    if (c.includes('şeffaf')) return '#e2e8f0';
    return '#6b7280';
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Atölye Envanter & Donanım Modülü</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Envanter, Stok & Cihaz Yönetimi
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            2 adet 3D yazıcınızın canlı durumu, filament makaraları, paketleme ve atölye sarf malzemeleri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateModal('filament')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Filament Ekle</span>
          </button>
          <button
            onClick={() => openCreateModal('packaging')}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Box className="w-4 h-4 text-amber-500" />
            <span>Sarf / Koli Ekle</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Value */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Toplam Stok Değeri</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {totalInventoryValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80">₺</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {(inventory || []).length} kalem kayıtlı malzeme
          </p>
        </div>

        {/* Card 2: 3D Printers */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Cihaz Filosu</span>
            <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
              {(printers || []).length}
            </span>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Yazıcı Aktif</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span>Boşta: <strong className="text-emerald-600 dark:text-emerald-400">{(printers || []).filter(p => p.status === 'Boşta').length}</strong></span>
            <span>•</span>
            <span>Baskıda: <strong className="text-blue-600 dark:text-blue-400">{(printers || []).filter(p => p.status === 'Baskıda').length}</strong></span>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div 
          onClick={() => setActiveFilter(activeFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          className={`border rounded-2xl p-5 shadow-sm transition-colors cursor-pointer ${
            lowStockItems.length > 0 
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30' 
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Kritik / Azalan Malzeme</span>
            <span className={`p-1.5 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black ${lowStockItems.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-sm font-bold text-gray-500">kalem</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {lowStockItems.length > 0 ? 'Eşiğin altındaki malzemeleri filtrele' : 'Tüm stoklar yeterli seviyede'}
          </p>
        </div>
      </div>

      {/* SECTION 1: 3D PRINTERS (2 MACHINES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">3D Yazıcılarım (Cihaz Durumları)</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(printers || []).map((printer) => {
            const statusConfig = {
              'Boşta': {
                color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30',
                dot: 'bg-emerald-500',
                label: 'Boşta (Hazır)'
              },
              'Baskıda': {
                color: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30',
                dot: 'bg-blue-500 animate-pulse',
                label: 'Baskıda'
              },
              'Bakımda': {
                color: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30',
                dot: 'bg-amber-500',
                label: 'Bakım / Kalibrasyon'
              }
            };
            const currentCfg = statusConfig[printer.status] || statusConfig['Boşta'];

            return (
              <div 
                key={printer.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {printer.id}
                    </span>
                    <h4 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">
                      {printer.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                      {printer.model || 'FDM 3D Yazıcı'}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={printer.status}
                    onChange={(e) => onPatchPrinter(printer.id, { status: e.target.value })}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${currentCfg.color}`}
                  >
                    <option value="Boşta">🟢 Boşta (Hazır)</option>
                    <option value="Baskıda">🔵 Baskıda</option>
                    <option value="Bakımda">🟡 Bakımda / Arızalı</option>
                  </select>
                </div>

                {/* Specs & Current Job */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700/60">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Takılı Nozzle:</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <strong className="text-gray-900 dark:text-white font-bold">{printer.nozzleSize}</strong>
                      <button
                        onClick={() => {
                          const newNozzle = prompt('Yeni Nozzle Çapı (Örn: 0.4 mm, 0.6 mm):', printer.nozzleSize);
                          if (newNozzle) onPatchPrinter(printer.id, { nozzleSize: newNozzle.trim() });
                        }}
                        className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700/60">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Takılı Filament:</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <strong className="text-gray-900 dark:text-white font-bold truncate max-w-[100px]">{printer.currentFilament || 'Seçilmedi'}</strong>
                      <button
                        onClick={() => {
                          const newFil = prompt('Takılı Filament (Örn: PLA Siyah):', printer.currentFilament);
                          if (newFil) onPatchPrinter(printer.id, { currentFilament: newFil.trim() });
                        }}
                        className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Order Banner if printing */}
                {printer.status === 'Baskıda' && (
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-2.5 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                      <span className="truncate">İş: <strong>{printer.activeOrderTitle || 'Aktif sipariş belirtilmedi'}</strong></span>
                    </div>
                    <button
                      onClick={() => {
                        const job = prompt('Basılan sipariş başlığı:', printer.activeOrderTitle || '');
                        if (job !== null) onPatchPrinter(printer.id, { activeOrderTitle: job.trim() });
                      }}
                      className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline shrink-0"
                    >
                      Ayarla
                    </button>
                  </div>
                )}

                {/* Footer notes & total hours */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>{printer.notes || 'Normal çalışma'}</span>
                  <span>Toplam Çalışma: <strong className="text-gray-700 dark:text-gray-300">{printer.totalHours} sa</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: INVENTORY LIST & SEARCH */}
      <div className="space-y-4 pt-4">
        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-3xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm transition-colors">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Malzeme, marka, renk veya konum ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'filament', label: '🧵 Filamentler' },
              { id: 'packaging', label: '📦 Paketleme & Kargo' },
              { id: 'consumable', label: '🔧 Sarf & Nozzle' },
              { id: 'LOW_STOCK', label: `⚠️ Kritik (${lowStockItems.length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 text-xs">
              Kriterlere uygun envanter malzemesi bulunamadı.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isLow = item.minThreshold > 0 && item.quantity <= item.minThreshold;
              const isFilament = item.category === 'filament';
              const progressPct = isFilament ? Math.min(100, Math.round((item.quantity / 1000) * 100)) : 100;

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-900 border rounded-3xl p-5 shadow-sm space-y-3.5 transition-all hover:border-blue-500/40 ${
                    isLow 
                      ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10' 
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {/* Top line: Category badge & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {isFilament ? 'Filament' : item.category === 'packaging' ? 'Paketleme' : 'Sarf Malzeme'}
                      </span>
                      {item.location && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                          📍 {item.location}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Brand/Material */}
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {item.brand && <span>{item.brand}</span>}
                      {item.material && <span>• {item.material}</span>}
                      {item.color && (
                        <span className="flex items-center gap-1">
                          • <span className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: getColorDot(item.color) }} />
                          {item.color}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Progress */}
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-gray-500">{item.unit}</span>
                      </div>

                      {isLow ? (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Azalıyor (Eşik: {item.minThreshold})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                          Yeterli
                        </span>
                      )}
                    </div>

                    {/* Progress bar for filaments (out of 1000g) */}
                    {isFilament && (
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Quick Adjust Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Birim: <strong className="text-gray-800 dark:text-gray-200">{item.unitPrice} ₺</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      {isFilament ? (
                        <>
                          <button
                            onClick={() => onAdjustQuantity(item.id, -50)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold transition active:scale-95"
                            title="50 gram harca"
                          >
                            -50g
                          </button>
                          <button
                            onClick={() => onAdjustQuantity(item.id, 50)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold transition active:scale-95"
                            title="50 gram ekle"
                          >
                            +50g
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onAdjustQuantity(item.id, -1)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition active:scale-95"
                            title="1 azalt"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onAdjustQuantity(item.id, 1)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition active:scale-95"
                            title="1 arttır"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE / EDIT INVENTORY ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                {itemToEdit ? 'Malzemeyi Düzenle' : 'Yeni Stok / Envanter Kalemi Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Kategori</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'filament', label: '🧵 Filament' },
                    { id: 'packaging', label: '📦 Paketleme' },
                    { id: 'consumable', label: '🔧 Sarf / Nozzle' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          category: c.id,
                          unit: c.id === 'filament' ? 'gr' : 'adet'
                        });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        formData.category === c.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Malzeme / Ürün Adı</label>
                <input
                  type="text"
                  placeholder="Örn: eSun PLA+ Siyah (1kg) veya Koli 15x15x15..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {formData.category === 'filament' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Marka</label>
                    <input
                      type="text"
                      placeholder="eSun, Porima..."
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Materyal</label>
                    <input
                      type="text"
                      placeholder="PLA, PETG, ABS..."
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Renk</label>
                    <input
                      type="text"
                      placeholder="Siyah, Beyaz..."
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 block mb-1">Marka / Tedarikçi (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: 3DLac, KoliFabrikası..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Mevcut Miktar</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2 py-2 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="gr">gr</option>
                      <option value="kg">kg</option>
                      <option value="adet">adet</option>
                      <option value="paket">paket</option>
                      <option value="metre">metre</option>
                      <option value="litre">litre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Kritik Stok Uyarısı</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Örn: 200 (bu sayının altına inince uyar)"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Birim Alış Fiyatı (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Konum / Raf (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: Raf A1, Çekmece 2..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Notlar / Açıklama</label>
                <input
                  type="text"
                  placeholder="Opsiyonel ek açıklama..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs px-4 py-2 rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-lg shadow-blue-600/30"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
