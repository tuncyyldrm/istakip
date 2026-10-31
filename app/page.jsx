"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import OrdersView from '@/components/OrdersView';
import InventoryView from '@/components/InventoryView';
import CostCalculatorView from '@/components/CostCalculatorView';
import TrendyolFinanceView from '@/components/TrendyolFinanceView';
import CashRegisterView from '@/components/CashRegisterView';
import SettingsView from '@/components/SettingsView';
import NewOrderModal from '@/components/NewOrderModal';
import NewSaleModal from '@/components/NewSaleModal';
import LoginScreen from '@/components/LoginScreen';
import CommandPalette from '@/components/CommandPalette';
import Toast from '@/components/Toast';

import {
  fetchBootstrap,
  fetchDashboard,
  fetchOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  fetchTrendyolSales,
  createTrendyolSale,
  updateTrendyolSale,
  toggleTrendyolSale,
  deleteTrendyolSale,
  fetchCashRegister,
  createCashSession,
  updateCashSession,
  deleteCashSession,
  fetchSettings,
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  adjustInventoryQuantity,
  deleteInventoryItem,
  fetchPrinters,
  createPrinter,
  updatePrinter,
  patchPrinter,
  deletePrinter
} from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [cashSessions, setCashSessions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [printers, setPrinters] = useState([]);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [initialOrderValues, setInitialOrderValues] = useState(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);

  // UX Feedback & Global Search States
  const [toasts, setToasts] = useState([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  function showToast(message, type = 'success', title = null) {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type, title };
    setToasts(prev => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }

  function dismissToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  // Global Ctrl+K / Cmd+K Command Palette Shortcut
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Check auth and theme on mount
  useEffect(() => {
    // 1. Initialize Theme
    const savedTheme = localStorage.getItem('istakip_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Pre-fill from local cache immediately (0 ms instantaneous render)
    try {
      const cached = localStorage.getItem('istakip_cache_bootstrap');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Integrity check: stale sales missing cargoBase must be purged
        const isSalesCacheValid = !parsed.sales || parsed.sales.length === 0 || parsed.sales[0].cargoBase !== undefined;
        if (isSalesCacheValid) {
          if (parsed.dashboard) setDashboardData(parsed.dashboard);
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.sales) setSales(parsed.sales);
          if (parsed.cashSessions) setCashSessions(parsed.cashSessions);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.printers) setPrinters(parsed.printers);
          if (parsed.inventory) setInventory(parsed.inventory);
          // Instant visual feedback without blocking
          setLoading(false);
        } else {
          localStorage.removeItem('istakip_cache_bootstrap');
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
    } catch (e) {
      setLoading(true);
    }

    // 3. Initialize Authentication & Background Revalidation
    const token = localStorage.getItem('istakip_auth_token');
    if (token) {
      setIsAuthenticated(true);
      loadAllData();
    } else {
      setIsAuthenticated(false);
    }
    setAuthChecking(false);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('istakip_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function handleLoginSuccess() {
    setIsAuthenticated(true);
    loadAllData();
  }

  function handleLogout() {
    localStorage.removeItem('istakip_auth_token');
    localStorage.removeItem('istakip_cache_bootstrap');
    setIsAuthenticated(false);
  }

  async function loadAllData() {
    try {
      // 1-step batched bootstrap fetch: 1 single network call instead of 7
      const bootRes = await fetchBootstrap();
      if (bootRes && bootRes.success && bootRes.data) {
        const d = bootRes.data;
        if (d.dashboard) setDashboardData(d.dashboard);
        if (d.orders) setOrders(d.orders || []);
        if (d.sales) setSales(d.sales || []);
        if (d.cashSessions) setCashSessions(d.cashSessions || []);
        if (d.settings) setSettings(d.settings || {});
        if (d.printers) setPrinters(d.printers || []);
        if (d.inventory) setInventory(d.inventory || []);

        try {
          localStorage.setItem('istakip_cache_bootstrap', JSON.stringify(d));
        } catch (e) {
          // ignore storage quota
        }
      } else {
        // Fallback to legacy parallel fetches if bootstrap endpoint fails
        const [dashRes, ordRes, salesRes, cashRes, setRes, invRes, printRes] = await Promise.all([
          fetchDashboard(),
          fetchOrders(),
          fetchTrendyolSales(),
          fetchCashRegister(),
          fetchSettings(),
          fetchInventory(),
          fetchPrinters()
        ]);

        if (dashRes.success) setDashboardData(dashRes.data);
        if (ordRes.success) setOrders(ordRes.data || []);
        if (salesRes.success) setSales(salesRes.data || []);
        if (cashRes.success) setCashSessions(cashRes.data || []);
        if (setRes.success) setSettings(setRes.data || {});
        if (invRes.success) setInventory(invRes.data || []);
        if (printRes.success) setPrinters(printRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshDashboard() {
    try {
      const dashRes = await fetchDashboard();
      if (dashRes.success) setDashboardData(dashRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  // Keep local cache in sync whenever data updates
  useEffect(() => {
    if (orders.length > 0 || inventory.length > 0) {
      try {
        const currentData = {
          dashboard: dashboardData,
          orders,
          sales,
          cashSessions,
          settings,
          printers,
          inventory
        };
        localStorage.setItem('istakip_cache_bootstrap', JSON.stringify(currentData));
      } catch (e) {
        // storage quota safety
      }
    }
  }, [dashboardData, orders, sales, cashSessions, settings, printers, inventory]);

  // -----------------------------------------------------------
  // ORDER ACTIONS
  // -----------------------------------------------------------
  function openNewOrderModal(initialValues = null) {
    setOrderToEdit(null);
    setInitialOrderValues(initialValues);
    setIsOrderModalOpen(true);
  }

  function openEditOrderModal(order) {
    setOrderToEdit(order);
    setInitialOrderValues(null);
    setIsOrderModalOpen(true);
  }

  async function handleSaveOrder(orderData) {
    try {
      if (orderToEdit) {
        const res = await updateOrder(orderToEdit.id, orderData);
        if (res.success) {
          setOrders(orders.map(o => o.id === orderToEdit.id ? res.data : o));
          refreshDashboard();
          showToast(`Sipariş güncellendi: ${orderData.title || orderToEdit.id}`, 'success');
        }
      } else {
        const res = await createOrder(orderData);
        if (res.success) {
          setOrders([res.data, ...orders]);
          refreshDashboard();
          showToast(`Yeni sipariş oluşturuldu: ${res.data.title || res.data.id}`, 'success');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Sipariş kaydedilirken hata oluştu', 'error');
    }
  }

  async function handleUpdateOrderStatus(id, newStatus) {
    try {
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        refreshDashboard();
        showToast(`Aşama güncellendi: ${id} → ${newStatus}`, 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Aşama güncellenemedi', 'error');
    }
  }

  async function handleDeleteOrder(id) {
    if (!window.confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deleteOrder(id);
      if (res.success) {
        setOrders(orders.filter(o => o.id !== id));
        refreshDashboard();
        showToast('Sipariş sistemden silindi', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Sipariş silinirken hata oluştu', 'error');
    }
  }

  // -----------------------------------------------------------
  // TRENDYOL SALES ACTIONS
  // -----------------------------------------------------------
  function openNewSaleModal() {
    setSaleToEdit(null);
    setIsSaleModalOpen(true);
  }

  function openEditSaleModal(sale) {
    setSaleToEdit(sale);
    setIsSaleModalOpen(true);
  }

  async function handleSaveSale(saleData) {
    try {
      if (saleToEdit) {
        const res = await updateTrendyolSale(saleToEdit.id, saleData);
        if (res.success) {
          setSales(sales.map(s => s.id === saleToEdit.id ? res.data : s));
          refreshDashboard();
          showToast('Finans kaydı güncellendi', 'success');
        }
      } else {
        const res = await createTrendyolSale(saleData);
        if (res.success) {
          setSales([...sales, res.data]);
          refreshDashboard();
          showToast('Yeni finans / kesinti kaydı eklendi', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Finans kaydı kaydedilemedi', 'error');
    }
  }

  async function handleToggleSale(id) {
    try {
      const res = await toggleTrendyolSale(id);
      if (res.success) {
        setSales(sales.map(s => s.id === id ? res.data : s));
        refreshDashboard();
        showToast('Satırın hesaplamaya dahil durumu değiştirildi', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteSale(id) {
    if (!window.confirm('Bu finansal kaydı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deleteTrendyolSale(id);
      if (res.success) {
        setSales(sales.filter(s => s.id !== id));
        refreshDashboard();
        showToast('Finans kaydı silindi', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Kayıt silinemedi', 'error');
    }
  }

  // -----------------------------------------------------------
  // CASH REGISTER ACTIONS
  // -----------------------------------------------------------
  async function handleAddCashSession(sessionData) {
    try {
      const res = await createCashSession(sessionData);
      if (res.success) {
        setCashSessions([...cashSessions, res.data]);
        refreshDashboard();
        const msg = sessionData.type === 'outflow' ? 'Nakit çıkışı kasadan düşüldü' : 'Kasa sayımı başarıyla kaydedildi';
        showToast(msg, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Kasa kaydedilemedi', 'error');
    }
  }

  async function handleUpdateCashSession(id, sessionData) {
    try {
      const res = await updateCashSession(id, sessionData);
      if (res.success) {
        setCashSessions(cashSessions.map(c => c.id === id ? res.data : c));
        refreshDashboard();
        showToast('Kasa hareketi başarıyla güncellendi', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Kasa kaydı güncellenemedi', 'error');
    }
  }

  async function handleDeleteCashSession(id) {
    if (!window.confirm('Bu kasa hareketini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deleteCashSession(id);
      if (res.success) {
        setCashSessions(cashSessions.filter(c => c.id !== id));
        refreshDashboard();
        showToast('Kasa hareketi silindi', 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // -----------------------------------------------------------
  // SETTINGS UPDATES
  // -----------------------------------------------------------
  function handleSettingsUpdated(newSettings) {
    setSettings(newSettings);
    refreshDashboard();
    showToast('Atölye ayarları güncellendi', 'success');
  }

  // -----------------------------------------------------------
  // INVENTORY & PRINTER ACTIONS
  // -----------------------------------------------------------
  async function handleCreateInventoryItem(itemData) {
    try {
      const res = await createInventoryItem(itemData);
      if (res.success) {
        setInventory([res.data, ...inventory]);
        refreshDashboard();
        showToast(`Yeni stok eklendi: ${itemData.name}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Stok eklenemedi', 'error');
    }
  }

  async function handleUpdateInventoryItem(id, itemData) {
    try {
      const res = await updateInventoryItem(id, itemData);
      if (res.success) {
        setInventory(inventory.map(item => item.id === id ? res.data : item));
        refreshDashboard();
        showToast(`Stok güncellendi: ${itemData.name}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Stok güncellenemedi', 'error');
    }
  }

  async function handleAdjustInventoryQuantity(id, deltaOrPayload) {
    try {
      const res = await adjustInventoryQuantity(id, deltaOrPayload);
      if (res.success) {
        setInventory(inventory.map(item => item.id === id ? { ...item, ...res.data } : item));
        let message = 'Stok miktarı güncellendi';
        if (typeof deltaOrPayload === 'object' && deltaOrPayload.quantity !== undefined) {
          message = `Seviye %${deltaOrPayload.quantity} olarak ayarlandı`;
        } else if (typeof deltaOrPayload === 'number') {
          const sign = deltaOrPayload > 0 ? `+${deltaOrPayload}` : `${deltaOrPayload}`;
          const isPercent = res.data?.unit === '%' || res.data?.unit === 'yüzde';
          message = isPercent ? `Seviye güncellendi (${sign}%)` : `Stok miktarı güncellendi (${sign})`;
        }
        showToast(message, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteInventoryItem(id) {
    if (!window.confirm('Bu envanter kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deleteInventoryItem(id);
      if (res.success) {
        setInventory(inventory.filter(item => item.id !== id));
        refreshDashboard();
        showToast('Stok kalemi silindi', 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreatePrinter(printerData) {
    try {
      const res = await createPrinter(printerData);
      if (res.success) {
        setPrinters([...printers, res.data]);
        refreshDashboard();
        showToast(`Yeni 3D yazıcı eklendi: ${printerData.name}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Yazıcı eklenemedi', 'error');
    }
  }

  async function handleUpdatePrinter(id, printerData) {
    try {
      const res = await updatePrinter(id, printerData);
      if (res.success) {
        setPrinters(printers.map(p => p.id === id ? { ...p, ...res.data } : p));
        showToast(`Yazıcı bilgileri güncellendi: ${printerData.name}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Yazıcı güncellenemedi', 'error');
    }
  }

  async function handlePatchPrinter(id, patchData) {
    try {
      const res = await patchPrinter(id, patchData);
      if (res.success) {
        setPrinters(printers.map(p => p.id === id ? { ...p, ...res.data } : p));
        showToast(`Cihaz durumu: ${patchData.status || 'güncellendi'}`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePrinter(id) {
    if (!window.confirm('Bu 3D yazıcıyı sistemden silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deletePrinter(id);
      if (res.success) {
        setPrinters(printers.filter(p => p.id !== id));
        refreshDashboard();
        showToast('3D yazıcı sistemden silindi', 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // If checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar & Sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewOrderClick={() => openNewOrderModal()}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        hourlyCost={settings?.hourlyBaseCost || dashboardData?.hourlyMachineCost || 27}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        orders={orders}
        printers={printers}
        inventory={inventory}
      />

      {/* Main Body */}
      <main className="flex-1 lg:pl-64 w-full">
        <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
              <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Atölye verileri yükleniyor...</span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  dashboardData={dashboardData}
                  setActiveTab={setActiveTab}
                  onNewOrderClick={openNewOrderModal}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  printers={printers}
                />
              )}

            {activeTab === 'orders' && (
              <OrdersView
                orders={orders}
                onNewOrderClick={openNewOrderModal}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                onEditOrder={openEditOrderModal}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                printers={printers}
                inventory={inventory}
                onCreatePrinter={handleCreatePrinter}
                onUpdatePrinter={handleUpdatePrinter}
                onPatchPrinter={handlePatchPrinter}
                onDeletePrinter={handleDeletePrinter}
                onCreateItem={handleCreateInventoryItem}
                onUpdateItem={handleUpdateInventoryItem}
                onAdjustQuantity={handleAdjustInventoryQuantity}
                onDeleteItem={handleDeleteInventoryItem}
              />
            )}

            {activeTab === 'calculator' && (
              <CostCalculatorView
                settings={settings}
                onSettingsUpdated={handleSettingsUpdated}
                onNewOrderWithValues={(vals) => openNewOrderModal(vals)}
              />
            )}

            {activeTab === 'trendyol' && (
              <TrendyolFinanceView
                sales={sales}
                onNewSaleClick={openNewSaleModal}
                onToggleSale={handleToggleSale}
                onDeleteSale={handleDeleteSale}
                onEditSale={openEditSaleModal}
              />
            )}

            {activeTab === 'cash' && (
              <CashRegisterView
                cashSessions={cashSessions}
                onAddCashSession={handleAddCashSession}
                onUpdateCashSession={handleUpdateCashSession}
                onDeleteCashSession={handleDeleteCashSession}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSettingsUpdated={handleSettingsUpdated}
                orders={orders}
                inventory={inventory}
                cashSessions={cashSessions}
                sales={sales}
                printers={printers}
              />
            )}
          </>
        )}
        </div>
      </main>

      {/* Modals */}
      <NewOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        orderToEdit={orderToEdit}
        initialValues={initialOrderValues}
        settings={settings}
      />

      <NewSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSave={handleSaveSale}
        saleToEdit={saleToEdit}
      />

      {/* Global Quick Search & Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        orders={orders}
        inventory={inventory}
        printers={printers}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenNewOrder={() => openNewOrderModal()}
        onOpenNewSale={() => openNewSaleModal()}
      />

      {/* Modern Floating Toast Notification System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
