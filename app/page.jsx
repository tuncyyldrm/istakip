"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import OrdersView from '@/components/OrdersView';
import CostCalculatorView from '@/components/CostCalculatorView';
import TrendyolFinanceView from '@/components/TrendyolFinanceView';
import CashRegisterView from '@/components/CashRegisterView';
import SettingsView from '@/components/SettingsView';
import NewOrderModal from '@/components/NewOrderModal';
import NewSaleModal from '@/components/NewSaleModal';
import LoginScreen from '@/components/LoginScreen';

import {
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
  deleteCashSession,
  fetchSettings
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

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [initialOrderValues, setInitialOrderValues] = useState(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);

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

    // 2. Initialize Authentication
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
    setIsAuthenticated(false);
  }

  async function loadAllData() {
    setLoading(true);
    try {
      const [dashRes, ordRes, salesRes, cashRes, setRes] = await Promise.all([
        fetchDashboard(),
        fetchOrders(),
        fetchTrendyolSales(),
        fetchCashRegister(),
        fetchSettings()
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (ordRes.success) setOrders(ordRes.data || []);
      if (salesRes.success) setSales(salesRes.data || []);
      if (cashRes.success) setCashSessions(cashRes.data || []);
      if (setRes.success) setSettings(setRes.data || {});
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
        }
      } else {
        const res = await createOrder(orderData);
        if (res.success) {
          setOrders([res.data, ...orders]);
          refreshDashboard();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateOrderStatus(id, newStatus) {
    try {
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        refreshDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteOrder(id) {
    if (!window.confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deleteOrder(id);
      if (res.success) {
        setOrders(orders.filter(o => o.id !== id));
        refreshDashboard();
      }
    } catch (err) {
      console.error(err);
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
        }
      } else {
        const res = await createTrendyolSale(saleData);
        if (res.success) {
          setSales([...sales, res.data]);
          refreshDashboard();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleSale(id) {
    try {
      const res = await toggleTrendyolSale(id);
      if (res.success) {
        setSales(sales.map(s => s.id === id ? res.data : s));
        refreshDashboard();
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
      }
    } catch (err) {
      console.error(err);
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
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteCashSession(id) {
    if (!window.confirm('Bu sayım kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await deleteCashSession(id);
      if (res.success) {
        setCashSessions(cashSessions.filter(c => c.id !== id));
        refreshDashboard();
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
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewOrderClick={() => openNewOrderModal()}
        hourlyCost={settings?.hourlyBaseCost || dashboardData?.hourlyMachineCost || 27}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Atölye verileri yükleniyor...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                dashboardData={dashboardData}
                setActiveTab={setActiveTab}
                onNewOrderClick={openNewOrderModal}
                onUpdateOrderStatus={handleUpdateOrderStatus}
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
                onDeleteCashSession={handleDeleteCashSession}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSettingsUpdated={handleSettingsUpdated}
              />
            )}
          </>
        )}
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
    </div>
  );
}
