import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";
import { calculateHourlyBaseCost } from "@/lib/calculations";

export async function GET() {
  try {
    await initDatabase();

    // Fetch all collections in a single batched network roundtrip to Turso Cloud
    const [
      ordersRes,
      salesRes,
      cashRes,
      setRes,
      printersRes,
      inventoryRes
    ] = await db.batch([
      "SELECT * FROM orders ORDER BY created_at DESC;",
      "SELECT * FROM trendyol_sales;",
      "SELECT * FROM cash_sessions ORDER BY date ASC;",
      "SELECT value FROM settings WHERE key = 'general';",
      "SELECT * FROM printers;",
      "SELECT * FROM inventory_items;"
    ], "read");

    // Format orders
    const orders = ordersRes.rows.map(r => ({
      id: r.id,
      date: r.date,
      channel: r.channel,
      customer: r.customer,
      title: r.title,
      description: r.description,
      color: r.color,
      status: r.status,
      notes: r.notes,
      printHours: r.print_hours,
      printMinutes: r.print_minutes,
      price: r.price,
      image: r.image || null
    }));

    // Format sales
    const sales = salesRes.rows.map(r => ({
      id: r.id,
      included: r.included === 1,
      date: r.date,
      isExpenseRow: r.is_expense_row === 1,
      expenseTitle: r.expense_title,
      salePrice: r.sale_price,
      vatRate: r.vat_rate,
      commissionRate: r.commission_rate,
      realCost: r.real_cost,
      cargoBase: r.cargo_base,
      cargoVatRate: r.cargo_vat_rate,
      extraExpense: r.extra_expense,
      partnerFixed: r.partner_fixed,
      deduction: r.deduction,
      hakedis: r.hakedis,
      netVat: r.net_vat,
      incomeTax: r.income_tax,
      partnerTotalShare: r.partner_total_share,
      myReceivable: r.my_receivable,
      myNetProfit: r.my_net_profit
    }));

    // Format cash
    const cashSessions = cashRes.rows.map(r => ({
      id: r.id,
      date: r.date,
      total: r.total,
      denominations: r.denominations ? JSON.parse(r.denominations) : {},
      note: r.note
    }));

    // Format settings
    const settings = setRes.rows[0]?.value ? JSON.parse(setRes.rows[0].value) : {};

    // Format printers
    const printers = printersRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      model: r.model,
      status: r.status,
      nozzleSize: r.nozzle_size,
      currentFilament: r.current_filament,
      activeOrderTitle: r.active_order_title,
      totalHours: Number(r.total_hours) || 0,
      notes: r.notes,
      image: r.image || null,
      updatedAt: r.updated_at
    }));

    // Format inventory
    const inventory = inventoryRes.rows.map(r => ({
      id: r.id,
      category: r.category,
      name: r.name,
      brand: r.brand,
      material: r.material,
      color: r.color,
      quantity: Number(r.quantity) || 0,
      unit: r.unit,
      minThreshold: Number(r.min_threshold) || 0,
      unitPrice: Number(r.unit_price) || 0,
      location: r.location,
      notes: r.notes,
      image: r.image || null,
      updatedAt: r.updated_at
    }));

    // Compute dashboard metrics directly in memory
    const orderCounts = {
      total: orders.length,
      modelling: orders.filter(o => o.status === 'Modelleme').length,
      readyToPrint: orders.filter(o => o.status === 'Baskıya Hazır').length,
      printing: orders.filter(o => o.status === 'Baskıda').length,
      completed: orders.filter(o => o.status === 'Tamamlandı').length,
      delivered: orders.filter(o => o.status && (o.status.includes('Kargo') || o.status.includes('Teslim'))).length
    };

    const activeSales = sales.filter(s => s.included);
    const totalHakedis = activeSales.reduce((acc, s) => acc + (Number(s.hakedis) || 0), 0);
    const totalPartnerShare = activeSales.reduce((acc, s) => acc + (Number(s.partnerTotalShare) || 0), 0);
    const totalReceivable = activeSales.reduce((acc, s) => acc + (Number(s.myReceivable) || 0) + (Number(s.deduction) || 0), 0);
    const totalNetProfit = activeSales.reduce((acc, s) => acc + (Number(s.myNetProfit) || 0) + (Number(s.deduction) || 0), 0);
    const totalSaleGross = activeSales.reduce((acc, s) => acc + (Number(s.salePrice) || 0), 0);

    const latestCash = cashSessions.length > 0 ? cashSessions[cashSessions.length - 1] : null;
    const totalCashAccumulated = cashSessions.reduce((acc, c) => acc + (Number(c.total) || 0), 0);

    const hourlyCostDetails = calculateHourlyBaseCost(settings);

    const dashboard = {
      orderCounts,
      financials: {
        totalHakedis: Number(totalHakedis.toFixed(2)),
        totalPartnerShare: Number(totalPartnerShare.toFixed(2)),
        totalReceivable: Number(totalReceivable.toFixed(2)),
        totalNetProfit: Number(totalNetProfit.toFixed(2)),
        totalSaleGross: Number(totalSaleGross.toFixed(2))
      },
      cash: {
        latestSession: latestCash,
        totalAccumulated: Number(totalCashAccumulated.toFixed(2))
      },
      hourlyMachineCost: hourlyCostDetails.totalHourly,
      hourlyDetails: hourlyCostDetails,
      recentOrders: orders.slice(0, 6),
      recentSales: sales.slice(-6).reverse()
    };

    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        orders,
        sales,
        cashSessions,
        settings,
        printers,
        inventory
      }
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
