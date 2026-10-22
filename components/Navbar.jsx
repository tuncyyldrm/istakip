"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calculator, 
  TrendingUp, 
  Wallet, 
  Settings, 
  PlusCircle, 
  Printer,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onNewOrderClick, hourlyCost = 27 }) {
  const navItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'orders', label: 'Sipariş & Üretim', icon: ClipboardList },
    { id: 'calculator', label: 'Maliyet & Fiyat', icon: Calculator },
    { id: 'trendyol', label: 'Trendyol Finans', icon: TrendingUp },
    { id: 'cash', label: 'Nakit Kasa', icon: Wallet },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                3D İşTakip
              </span>
              <div className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase -mt-0.5 flex items-center gap-1">
                <span>Next.js + Turso</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Badge */}
          <div className="flex items-center space-x-3">
            {/* Hourly Machine Cost Badge */}
            <div 
              onClick={() => setActiveTab('calculator')}
              className="hidden sm:flex items-center space-x-1.5 bg-gray-800/80 border border-gray-700/70 hover:border-cyan-500/40 text-xs px-3 py-1.5 rounded-full cursor-pointer transition group"
              title="3D Yazıcı Saatlik Çalışma Maliyeti (tanımlar sayfası)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="text-gray-400">Saat:</span>
              <span className="font-semibold text-emerald-400">{hourlyCost} ₺</span>
            </div>

            {/* New Order Button */}
            <button
              onClick={onNewOrderClick}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-md shadow-blue-600/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Sipariş</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-gray-800/60 scrollbar-none space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white bg-gray-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
