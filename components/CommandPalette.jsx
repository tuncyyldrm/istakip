"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ClipboardList, 
  Package, 
  Printer, 
  Calculator, 
  TrendingUp, 
  Wallet, 
  Plus, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  orders = [],
  inventory = [],
  printers = [],
  onNavigateTab,
  onOpenNewOrder,
  onOpenNewSale
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Compute matched results
  const trimmed = query.trim().toLowerCase();

  // 1. Actions
  const allActions = [
    {
      id: 'act-new-order',
      type: 'action',
      title: 'Yeni Sipariş Oluştur',
      subtitle: 'Baskı süresi, filament ve satış fiyatı ile iş kaydet',
      icon: Plus,
      iconColor: 'bg-orange-600 text-white',
      run: () => { onOpenNewOrder(); onClose(); }
    },
    {
      id: 'act-new-sale',
      type: 'action',
      title: 'Yeni Trendyol Finans / İade / Masraf Ekle',
      subtitle: 'Pazar yeri hakedişi, iade kesintisi veya gider mahsubu',
      icon: TrendingUp,
      iconColor: 'bg-emerald-600 text-white',
      run: () => { onOpenNewSale(); onClose(); }
    },
    {
      id: 'act-calc',
      type: 'action',
      title: 'Maliyet & Kademeli Fiyat Hesaplayıcı',
      subtitle: 'Baskı saatine göre dilim maliyet ve Trendyol katsayısı',
      icon: Calculator,
      iconColor: 'bg-blue-600 text-white',
      run: () => { onNavigateTab('calculator'); onClose(); }
    },
    {
      id: 'act-cash',
      type: 'action',
      title: 'Nakit Kasa Sayımı Yap',
      subtitle: 'Banknot ve madeni para küpür sayımı kaydı',
      icon: Wallet,
      iconColor: 'bg-amber-600 text-white',
      run: () => { onNavigateTab('cash'); onClose(); }
    }
  ];

  const matchedActions = allActions.filter(a => 
    !trimmed || a.title.toLowerCase().includes(trimmed) || a.subtitle.toLowerCase().includes(trimmed)
  );

  // 2. Orders
  const matchedOrders = (orders || []).filter(o => {
    if (!trimmed) return false;
    return (
      o.id?.toLowerCase().includes(trimmed) ||
      o.title?.toLowerCase().includes(trimmed) ||
      o.customer?.toLowerCase().includes(trimmed) ||
      o.color?.toLowerCase().includes(trimmed) ||
      o.description?.toLowerCase().includes(trimmed) ||
      o.channel?.toLowerCase().includes(trimmed)
    );
  }).slice(0, 5).map(o => ({
    id: `ord-${o.id}`,
    type: 'order',
    title: `${o.id}: ${o.title}`,
    subtitle: `${o.channel ? `@${o.channel}` : ''} • ${o.customer || 'Müşteri'} • ${o.color || ''} • ${o.price || 0} ₺`,
    badge: o.status,
    icon: ClipboardList,
    iconColor: 'bg-amber-500/15 text-amber-500',
    run: () => { onNavigateTab('orders'); onClose(); }
  }));

  // 3. Inventory items
  const matchedInventory = (inventory || []).filter(i => {
    if (!trimmed) return false;
    return (
      i.name?.toLowerCase().includes(trimmed) ||
      i.brand?.toLowerCase().includes(trimmed) ||
      i.material?.toLowerCase().includes(trimmed) ||
      i.color?.toLowerCase().includes(trimmed) ||
      i.category?.toLowerCase().includes(trimmed) ||
      i.location?.toLowerCase().includes(trimmed)
    );
  }).slice(0, 5).map(i => ({
    id: `inv-${i.id}`,
    type: 'inventory',
    title: i.name,
    subtitle: `${i.brand || ''} ${i.material || ''} • Kalan: ${i.quantity} ${i.unit || 'adet'} • ${i.location || 'Depo'}`,
    badge: i.quantity <= i.minThreshold ? 'Kritik Stok' : null,
    icon: Package,
    iconColor: 'bg-emerald-500/15 text-emerald-500',
    run: () => { onNavigateTab('inventory'); onClose(); }
  }));

  // 4. Printers
  const matchedPrinters = (printers || []).filter(p => {
    if (!trimmed) return false;
    return (
      p.name?.toLowerCase().includes(trimmed) ||
      p.model?.toLowerCase().includes(trimmed) ||
      p.currentFilament?.toLowerCase().includes(trimmed) ||
      p.status?.toLowerCase().includes(trimmed)
    );
  }).slice(0, 3).map(p => ({
    id: `prn-${p.id}`,
    type: 'printer',
    title: p.name,
    subtitle: `${p.model} • Nozzle: ${p.nozzleSize} • Takılı: ${p.currentFilament || 'Yok'}`,
    badge: p.status,
    icon: Printer,
    iconColor: 'bg-orange-500/15 text-orange-500',
    run: () => { onNavigateTab('inventory'); onClose(); }
  }));

  const combinedItems = [
    ...matchedActions,
    ...matchedOrders,
    ...matchedInventory,
    ...matchedPrinters
  ];

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (combinedItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + combinedItems.length) % (combinedItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedItems[selectedIndex]) {
        combinedItems[selectedIndex].run();
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-orange-500 shrink-0 ml-1 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Sipariş ara (Fiat, Peugeot, Clio...), makara, sarf malzeme veya komut..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 max-h-[60vh] scrollbar-thin">
          {combinedItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              "{query}" ile eşleşen sipariş, stok veya aksiyon bulunamadı.
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition text-xs ${
                    isSelected 
                      ? 'bg-orange-50 dark:bg-slate-800/90 border border-orange-200 dark:border-orange-500/30 shadow-sm' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor || 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.type !== 'action' && (
                          <span className="text-[10px] font-mono font-normal uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {item.type === 'order' ? 'Sipariş' : item.type === 'inventory' ? 'Stok' : 'Cihaz'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badge === 'Kritik Stok'
                          ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-500 translate-x-0.5' : 'text-slate-400'} transition-transform`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↑↓</kbd> Gezin
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↵</kbd> Seç
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">ESC</kbd> Çıkış
            </span>
          </div>
          <span className="font-semibold text-orange-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Hızlı Arama Masası
          </span>
        </div>
      </div>
    </div>
  );
}