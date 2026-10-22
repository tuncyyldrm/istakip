"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Calculator, 
  TrendingUp, 
  Wallet, 
  Settings, 
  Plus, 
  Sun, 
  Moon, 
  LogOut,
  Menu,
  X,
  Printer,
  ChevronRight,
  Activity,
  Layers,
  AlertTriangle
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onNewOrderClick, 
  hourlyCost = 27,
  theme,
  toggleTheme,
  onLogout,
  orders = [],
  printers = [],
  inventory = []
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute live badges
  const activeOrdersCount = (orders || []).filter(
    o => o.status !== 'Tamamlandı' && o.status !== 'Kargolandı / Teslim'
  ).length;

  const lowStockCount = (inventory || []).filter(
    i => Number(i.quantity || 0) <= Number(i.minThreshold || 0)
  ).length;

  const activePrintersCount = (printers || []).filter(
    p => p.status === 'Baskıda'
  ).length;

  const navGroups = [
    {
      group: "ÜRETİM & ATÖLYE",
      items: [
        { 
          id: 'dashboard', 
          label: 'Genel Bakış', 
          icon: LayoutDashboard,
          badge: null
        },
        { 
          id: 'orders', 
          label: 'Sipariş & Üretim', 
          icon: ClipboardList,
          badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : null,
          badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        },
        { 
          id: 'inventory', 
          label: 'Envanter & Stok', 
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount} kritik` : null,
          badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
        },
        { 
          id: 'calculator', 
          label: 'Maliyet & Fiyat', 
          icon: Calculator,
          badge: null
        },
      ]
    },
    {
      group: "FİNANS & KASA",
      items: [
        { 
          id: 'trendyol', 
          label: 'Trendyol Finans', 
          icon: TrendingUp,
          badge: null
        },
        { 
          id: 'cash', 
          label: 'Nakit Kasa', 
          icon: Wallet,
          badge: null
        },
      ]
    },
    {
      group: "SİSTEM",
      items: [
        { 
          id: 'settings', 
          label: 'Ayarlar', 
          icon: Settings,
          badge: null
        },
      ]
    }
  ];

  // Titles for current active view
  const viewTitles = {
    dashboard: { title: 'Genel Bakış', subtitle: 'Atölye operasyon masası & anlık durum' },
    orders: { title: 'Sipariş & Üretim', subtitle: `${orders.length} kayıt • ${activeOrdersCount} aktif işlemde` },
    inventory: { title: 'Envanter & Stok', subtitle: `${printers.length} Yazıcı • ${inventory.length} depo kalemi` },
    calculator: { title: 'Maliyet & Fiyat', subtitle: `Saatlik baz maliyet: ${hourlyCost} ₺ • Kademeli fiyatlandırma` },
    trendyol: { title: 'Trendyol Finans', subtitle: 'Satış hakedişleri ve kâr paylaşım mutabakatı' },
    cash: { title: 'Nakit Kasa', subtitle: 'Elden tahsilatlar ve periyodik kasa sayımları' },
    settings: { title: 'Sistem Ayarları', subtitle: 'Atölye parametreleri, elektrik & makine amortismanı' },
  };

  const currentView = viewTitles[activeTab] || { title: '3D Atölye', subtitle: 'İş Takip Sistemi' };

  function handleNavClick(tabId) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP PERMANENT SIDEBAR (>= 1024px)                  */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-30 bg-slate-900 text-slate-200 border-r border-slate-800 shadow-xl select-none">
        
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>3D ATÖLYE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Üretim & İş Takip</p>
            </div>
          </div>
        </div>

        {/* Live Workshop Machines Summary (Mini Widget) */}
        <div className="p-3.5 mx-3 mt-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Activity className="w-3 h-3 text-orange-400" />
              Yazıcılar
            </span>
            <span 
              onClick={() => handleNavClick('inventory')}
              className="text-orange-400 hover:text-orange-300 cursor-pointer flex items-center text-[10px] gap-0.5"
            >
              Yönet <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-1.5">
            {printers.length > 0 ? (
              printers.slice(0, 2).map((p) => {
                const isPrinting = p.status === 'Baskıda';
                const isIdle = p.status === 'Boşta';
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleNavClick('inventory')}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isPrinting ? 'bg-amber-400 animate-pulse' : isIdle ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                      <span className="font-medium text-slate-200 truncate">{p.name}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isPrinting ? 'bg-amber-500/20 text-amber-300' : isIdle ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-400 px-2 py-1">2 Yazıcı Tanımlı</div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {navGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5">
                {grp.group}
              </div>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Utilities */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/40 space-y-2">
          {/* Machine Hourly Cost Pill */}
          <div 
            onClick={() => handleNavClick('calculator')}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer text-xs transition group"
            title="3D Yazıcı Saatlik Maliyet Tanımı"
          >
            <span className="text-slate-400 text-[11px]">Baskı Saati:</span>
            <span className="font-mono font-bold text-orange-400 group-hover:text-orange-300">
              {hourlyCost} ₺/saat
            </span>
          </div>

          {/* Theme & Logout Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition"
              title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
              <span className="text-[11px]">{theme === 'dark' ? 'Açık' : 'Koyu'}</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 border border-slate-700/60 text-slate-400 hover:text-rose-400 transition"
              title="Güvenli Çıkış"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. TOP HEADER (Main area header, sticky)                  */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-20 lg:pl-64 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Menu Trigger + View Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              aria-label="Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                <span>{currentView.title}</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80">
                  Canlı
                </span>
              </h1>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                {currentView.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick Global Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Hourly Machine Cost badge (visible on larger mobile/tablets) */}
            <div 
              onClick={() => handleNavClick('calculator')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:border-orange-500/50 transition font-medium"
              title="Saatlik Çalışma Maliyeti"
            >
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Baskı Saati:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-orange-400">{hourlyCost} ₺</span>
            </div>

            {/* Theme switch in header (especially useful on mobile) */}
            <button
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Primary Action Button: "+ Yeni Sipariş" */}
            <button
              onClick={onNewOrderClick}
              className="flex items-center gap-1.5 sm:gap-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-orange-600/25 transition shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span className="whitespace-nowrap">Yeni Sipariş</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. MOBILE SLIDE-OUT DRAWER (< 1024px)                     */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-200 h-full flex flex-col shadow-2xl border-r border-slate-800 z-10">
            {/* Drawer Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">3D ATÖLYE</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Printers in mobile drawer */}
            <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Atölye Durumu
              </div>
              <div className="space-y-1">
                {printers.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300 truncate">{p.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      p.status === 'Baskıda' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navGroups.map((grp, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                    {grp.group}
                  </div>
                  <div className="space-y-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            isActive
                              ? 'bg-orange-600 text-white'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs text-slate-400">Turso Cloud Aktif</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM THUMB BAR (< 1024px)                     */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 py-1 shadow-lg flex items-center justify-around select-none">
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-semibold transition ${
            activeTab === 'dashboard'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Özet</span>
        </button>

        <button
          onClick={() => handleNavClick('orders')}
          className={`relative flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-semibold transition ${
            activeTab === 'orders'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span>Siparişler</span>
          {activeOrdersCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>

        <button
          onClick={() => handleNavClick('inventory')}
          className={`relative flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-semibold transition ${
            activeTab === 'inventory'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Envanter</span>
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => handleNavClick('calculator')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-semibold transition ${
            activeTab === 'calculator'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span>Maliyet</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Diğer</span>
        </button>
      </nav>
    </>
  );
}
