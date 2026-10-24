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
  Filter,
  Printer,
  Image as ImageIcon,
  Maximize2,
  Upload,
  Camera
} from 'lucide-react';

export default function InventoryView({
  printers = [],
  inventory = [],
  onCreatePrinter,
  onUpdatePrinter,
  onPatchPrinter,
  onDeletePrinter,
  onCreateItem,
  onUpdateItem,
  onAdjustQuantity,
  onDeleteItem
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Inventory Item Modal State
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
    notes: '',
    image: ''
  });

  // 2. Printer Modal State (Add & Edit)
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [printerToEdit, setPrinterToEdit] = useState(null);
  const [printerFormData, setPrinterFormData] = useState({
    name: '',
    model: '',
    status: 'Boşta',
    nozzleSize: '0.4 mm',
    currentFilament: '',
    activeOrderTitle: '',
    totalHours: 0,
    notes: '',
    image: ''
  });

  // 3. Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);
  const [compressing, setCompressing] = useState(false);

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

  // Client-side WebP image compressor
  function handleImageUpload(e, setFormCallback) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpUrl = canvas.toDataURL('image/webp', 0.8);
          setFormCallback(prev => ({ ...prev, image: webpUrl }));
        } catch (err) {
          const jpegUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormCallback(prev => ({ ...prev, image: jpegUrl }));
        } finally {
          setCompressing(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // -------------------------------------------------------------
  // INVENTORY ITEM ACTIONS
  // -------------------------------------------------------------
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
      notes: '',
      image: ''
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
      notes: item.notes || '',
      image: item.image || ''
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

  // -------------------------------------------------------------
  // PRINTER ACTIONS (Add & Edit)
  // -------------------------------------------------------------
  function openCreatePrinterModal() {
    setPrinterToEdit(null);
    setPrinterFormData({
      name: '',
      model: '',
      status: 'Boşta',
      nozzleSize: '0.4 mm',
      currentFilament: '',
      activeOrderTitle: '',
      totalHours: 0,
      notes: '',
      image: ''
    });
    setIsPrinterModalOpen(true);
  }

  function openEditPrinterModal(printer) {
    setPrinterToEdit(printer);
    setPrinterFormData({
      name: printer.name || '',
      model: printer.model || '',
      status: printer.status || 'Boşta',
      nozzleSize: printer.nozzleSize || '0.4 mm',
      currentFilament: printer.currentFilament || '',
      activeOrderTitle: printer.activeOrderTitle || '',
      totalHours: printer.totalHours || 0,
      notes: printer.notes || '',
      image: printer.image || ''
    });
    setIsPrinterModalOpen(true);
  }

  function handleSavePrinter(e) {
    e.preventDefault();
    if (!printerFormData.name.trim()) {
      alert('Lütfen yazıcı adını girin.');
      return;
    }

    if (printerToEdit) {
      onUpdatePrinter(printerToEdit.id, printerFormData);
    } else {
      if (onCreatePrinter) {
        onCreatePrinter(printerFormData);
      }
    }
    setIsPrinterModalOpen(false);
  }

  function handleDeletePrinterClick(id) {
    if (onDeletePrinter) {
      onDeletePrinter(id);
    }
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Atölye Envanter & Donanım Modülü</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Envanter, Stok & Cihaz Yönetimi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            3D yazıcı filonuz, filament makaraları, paketleme ve atölye sarf malzemeleri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreatePrinterModal()}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>Yazıcı Ekle</span>
          </button>
          <button
            onClick={() => openCreateModal('filament')}
            className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Filament Ekle</span>
          </button>
          <button
            onClick={() => openCreateModal('packaging')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Box className="w-4 h-4 text-orange-500" />
            <span>Sarf Ekle</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Value */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Toplam Stok Değeri</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {totalInventoryValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80">₺</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {(inventory || []).length} kalem kayıtlı malzeme
          </p>
        </div>

        {/* Card 2: 3D Printers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Cihaz Filosu</span>
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white">
              {(printers || []).length}
            </span>
            <span className="text-sm font-bold text-slate-500">Yazıcı Kayıtlı</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {printers.filter(p => p.status === 'Boşta').length} Boşta
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {printers.filter(p => p.status === 'Baskıda').length} Baskıda
            </span>
          </div>
        </div>

        {/* Card 3: Low Stock Warning */}
        <div 
          onClick={() => setActiveFilter(activeFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          className={`border rounded-2xl p-5 shadow-sm transition-colors cursor-pointer ${
            lowStockItems.length > 0 
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kritik / Azalan Malzeme</span>
            <span className={`p-1.5 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-mono font-bold ${lowStockItems.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-sm font-bold text-slate-500">kalem</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {lowStockItems.length > 0 ? 'Eşiğin altındaki malzemeleri filtrele' : 'Tüm stoklar yeterli seviyede'}
          </p>
        </div>
      </div>

      {/* SECTION 1: 3D PRINTERS (FLEET MANAGEMENT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">3D Yazıcılarım & Cihaz Yönetimi</h3>
          </div>
          <button
            onClick={() => openCreatePrinterModal()}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Yazıcı Ekle</span>
          </button>
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
                color: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30',
                dot: 'bg-amber-500 animate-pulse',
                label: 'Baskıda'
              },
              'Bakımda': {
                color: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30',
                dot: 'bg-rose-500',
                label: 'Bakım / Arızalı'
              }
            };
            const currentCfg = statusConfig[printer.status] || statusConfig['Boşta'];

            return (
              <div 
                key={printer.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Printer Photo / Thumbnail */}
                    {printer.image ? (
                      <div 
                        onClick={() => setLightboxImage({ url: printer.image, title: printer.name })}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group shrink-0"
                      >
                        <img src={printer.image} alt={printer.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Maximize2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                        <Printer className="w-6 h-6 text-orange-500" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {printer.id}
                        </span>
                        {printer.totalHours > 0 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {printer.totalHours} saat
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {printer.name}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {printer.model || 'FDM 3D Yazıcı'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditPrinterModal(printer)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                      title="Yazıcıyı Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrinterClick(printer.id)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition"
                      title="Yazıcıyı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Status Dropdown */}
                    <select
                      value={printer.status}
                      onChange={(e) => onPatchPrinter(printer.id, { status: e.target.value })}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${currentCfg.color}`}
                    >
                      <option value="Boşta">🟢 Boşta</option>
                      <option value="Baskıda">🟡 Baskıda</option>
                      <option value="Bakımda">🔴 Bakımda</option>
                    </select>
                  </div>
                </div>

                {/* Specs & Current Job */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Takılı Nozzle:</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <strong className="text-slate-900 dark:text-white font-mono font-bold">{printer.nozzleSize}</strong>
                      <button
                        onClick={() => openEditPrinterModal(printer)}
                        className="text-[10px] text-orange-500 hover:underline"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Takılı Filament:</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <strong 
                        className="text-slate-900 dark:text-white font-bold truncate max-w-[140px] sm:max-w-[200px]" 
                        title={printer.currentFilament}
                      >
                        {printer.currentFilament || 'Seçilmedi'}
                      </strong>
                      <button
                        onClick={() => openEditPrinterModal(printer)}
                        className="text-[10px] text-orange-500 hover:underline"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Order Banner if printing */}
                {printer.status === 'Baskıda' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <span className="truncate">İş: <strong>{printer.activeOrderTitle || 'Aktif sipariş belirtilmedi'}</strong></span>
                    </div>
                    <button
                      onClick={() => openEditPrinterModal(printer)}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                    >
                      Ayarla
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FILAMENT & MATERIALS INVENTORY */}
      <div className="space-y-4 pt-2">
        
        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm transition-colors">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filament, koli veya sarf ara..."
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

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'Tümü', count: (inventory || []).length },
              { id: 'filament', label: 'Filamentler', count: (inventory || []).filter(i => i.category === 'filament').length },
              { id: 'packaging', label: 'Paketleme', count: (inventory || []).filter(i => i.category === 'packaging').length },
              { id: 'consumable', label: 'Sarf & Nozzle', count: (inventory || []).filter(i => i.category === 'consumable').length },
              { id: 'LOW_STOCK', label: 'Kritik Stok', count: lowStockItems.length, isAlert: lowStockItems.length > 0 }
            ].map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-sm'
                      : f.isAlert
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inventory Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isFilament = item.category === 'filament';
            const isLow = item.minThreshold > 0 && item.quantity <= item.minThreshold;
            
            // Percentage for filament spools (standard 1kg = 1000g)
            const maxSpool = 1000;
            const percent = isFilament ? Math.min(100, Math.round((item.quantity / maxSpool) * 100)) : null;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-sm transition hover:border-slate-400 dark:hover:border-slate-600 ${
                  isLow ? 'border-amber-300 dark:border-amber-500/40' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Item Image with Lightbox click OR Category Icon */}
                      {item.image ? (
                        <div 
                          onClick={() => setLightboxImage({ url: item.image, title: item.name })}
                          className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group shrink-0"
                          title="Büyütmek için tıkla"
                        >
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      ) : isFilament ? (
                        <span 
                          className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 shadow-sm"
                          style={{ backgroundColor: getColorDot(item.color) }}
                          title={`Renk: ${item.color}`}
                        />
                      ) : item.category === 'packaging' ? (
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                          <Box className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 block leading-tight">
                          {item.id} • {item.brand || item.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity Display */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 my-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Mevcut Miktar:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
                      </div>
                    </div>

                    {/* Progress bar for Filament Spools */}
                    {isFilament && percent !== null && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Doluluk: %{percent}</span>
                          <span>{item.quantity}g / 1000g</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              percent < 25 ? 'bg-rose-500' : percent < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Low stock alert badge */}
                  {isLow && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-lg mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Kritik Eşik: {item.minThreshold} {item.unit} kaldı!</span>
                    </div>
                  )}

                  {/* Meta: Location and Unit Price */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 py-1">
                    <span>Konum: <strong className="text-slate-700 dark:text-slate-300">{item.location || '-'}</strong></span>
                    {item.unitPrice > 0 && (
                      <span>Birim: <strong className="text-slate-700 dark:text-slate-300 font-mono">{item.unitPrice} ₺</strong></span>
                    )}
                  </div>
                </div>

                {/* Quick Increment/Decrement Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1 w-full">
                    {isFilament ? (
                      <>
                        <button
                          onClick={() => onAdjustQuantity(item.id, -50)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition active:scale-95 text-center"
                          title="50 gram harcandı"
                        >
                          -50g
                        </button>
                        <button
                          onClick={() => onAdjustQuantity(item.id, -100)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition active:scale-95 text-center"
                          title="100 gram harcandı"
                        >
                          -100g
                        </button>
                        <button
                          onClick={() => onAdjustQuantity(item.id, 50)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold transition active:scale-95 text-center"
                          title="50 gram ekle"
                        >
                          +50g
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onAdjustQuantity(item.id, -1)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition active:scale-95 text-center"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => onAdjustQuantity(item.id, 1)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold transition active:scale-95 text-center"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onAdjustQuantity(item.id, 5)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition active:scale-95 text-center"
                        >
                          +5
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: ADD / EDIT INVENTORY ITEM                       */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span>{itemToEdit ? 'Malzemeyi Düzenle' : 'Yeni Stok Kalemi Ekle'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Category picker */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'filament', label: '🧵 Filament' },
                    { id: 'packaging', label: '📦 Paketleme' },
                    { id: 'consumable', label: '🔧 Sarf & Nozzle' }
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id, unit: cat.id === 'filament' ? 'gr' : 'adet' })}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition border ${
                        formData.category === cat.id
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Photo Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Ürün / Makara Fotoğrafı (İsteğe Bağlı)
                </label>
                {formData.image ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <img 
                      src={formData.image} 
                      alt="Önizleme" 
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Görsel Yüklendi</span>
                      <span className="text-[11px] text-slate-400">WebP sıkıştırılmış format</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 dark:bg-slate-950/40">
                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {compressing ? 'Görsel optimize ediliyor...' : 'Fotoğraf Yükle (Makara / Koli / Parça)'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP (Otomatik optimize edilir)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFormData)}
                      className="hidden"
                      disabled={compressing}
                    />
                  </label>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Malzeme Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.category === 'filament' ? 'eSun PLA+ Siyah (1kg)' : 'Kargo Kolisi 15x15x15'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Filament specific options: Brand, Material, Color */}
              {formData.category === 'filament' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Marka</label>
                    <input
                      type="text"
                      placeholder="eSun, Porima"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Malzeme</label>
                    <select
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="PLA">PLA</option>
                      <option value="PLA+">PLA+</option>
                      <option value="PETG">PETG</option>
                      <option value="ABS">ABS</option>
                      <option value="ASA">ASA</option>
                      <option value="TPU">TPU (Esnek)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Renk</label>
                    <input
                      type="text"
                      placeholder="Siyah, Beyaz"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Quantity, Unit, Min Threshold */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    Mevcut Miktar
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Birim</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    Kritik Eşik
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Unit Price & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    Birim Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">Depo / Raf Konumu</label>
                  <input
                    type="text"
                    placeholder="Raf A1, Kutu 3"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-600/25 transition"
                >
                  {itemToEdit ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: ADD / EDIT 3D PRINTER                           */}
      {/* ========================================================= */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-500" />
                <span>{printerToEdit ? '3D Yazıcıyı Düzenle' : 'Yeni 3D Yazıcı Ekle'}</span>
              </h3>
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrinter} className="space-y-4">
              {/* Printer Photo Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Cihaz Fotoğrafı (İsteğe Bağlı)
                </label>
                {printerFormData.image ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <img 
                      src={printerFormData.image} 
                      alt="Önizleme" 
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Fotoğraf Eklendi</span>
                      <span className="text-[11px] text-slate-400">WebP formatında hazır</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrinterFormData({ ...printerFormData, image: '' })}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 dark:bg-slate-950/40">
                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {compressing ? 'Görsel optimize ediliyor...' : 'Yazıcı Fotoğrafı Seç / Çek'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setPrinterFormData)}
                      className="hidden"
                      disabled={compressing}
                    />
                  </label>
                )}
              </div>

              {/* Name & Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Yazıcı Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Anycubic Kobra 2 Plus"
                    value={printerFormData.name}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Model & Güç
                  </label>
                  <input
                    type="text"
                    placeholder="Kobra 2 Plus (300W)"
                    value={printerFormData.model}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Status & Nozzle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Cihaz Durumu
                  </label>
                  <select
                    value={printerFormData.status}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Boşta">🟢 Boşta (Hazır)</option>
                    <option value="Baskıda">🟡 Baskıda</option>
                    <option value="Bakımda">🔴 Bakımda / Arızalı</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Nozzle Çapı
                  </label>
                  <input
                    type="text"
                    placeholder="0.4 mm"
                    value={printerFormData.nozzleSize}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, nozzleSize: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Current Filament & Active Job */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Takılı Filament
                  </label>
                  <input
                    type="text"
                    placeholder="eSun PLA+ Siyah"
                    value={printerFormData.currentFilament}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, currentFilament: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Aktif Baskı Başlığı
                  </label>
                  <input
                    type="text"
                    placeholder="Kask vizör mandalı x4"
                    value={printerFormData.activeOrderTitle}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, activeOrderTitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Total Hours & Notes */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Toplam Saat
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={printerFormData.totalHours}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, totalHours: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Atölye Notları
                  </label>
                  <input
                    type="text"
                    placeholder="Ana üretim cihazı, PEI tabla"
                    value={printerFormData.notes}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrinterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-600/25 transition"
                >
                  {printerToEdit ? 'Yazıcıyı Güncelle' : 'Yazıcıyı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. LIGHTBOX MODAL (FULL IMAGE PREVIEW)                    */}
      {/* ========================================================= */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white truncate pr-2">
                {lightboxImage.title || 'Görsel Önizleme'}
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-slate-950">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.title} 
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
