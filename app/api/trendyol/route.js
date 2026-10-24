import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";
import { calculateTrendyolItem } from "@/lib/calculations";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM trendyol_sales;");
    const sales = res.rows.map(r => ({
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
    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();

    // Generate next sequential TS ID if not provided
    let newId = body.id;
    if (!newId) {
      try {
        const maxRes = await db.execute("SELECT id FROM trendyol_sales WHERE id LIKE 'TS-%';");
        let maxNum = 0;
        for (const r of maxRes.rows) {
          const num = parseInt(String(r.id).replace("TS-", ""), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
        newId = `TS-${String(maxNum + 1).padStart(3, "0")}`;
      } catch (e) {
        newId = `TS-${Date.now().toString().slice(-4)}`;
      }
    }

    const raw = {
      id: newId,
      included: body.included ?? true,
      date: body.date || new Date().toISOString().split("T")[0],
      isExpenseRow: Boolean(body.isExpenseRow),
      expenseTitle: body.expenseTitle || "",
      salePrice: Number(body.salePrice) || 0,
      vatRate: Number(body.vatRate ?? 0.20),
      commissionRate: Number(body.commissionRate ?? 0.04),
      realCost: Number(body.realCost ?? 55.0),
      cargoBase: Number(body.cargoBase ?? 89.70),
      cargoVatRate: Number(body.cargoVatRate ?? 0.20),
      extraExpense: Number(body.extraExpense ?? 13.19),
      partnerFixed: Number(body.partnerFixed ?? 0),
      deduction: Number(body.deduction ?? 0)
    };

    const calculated = calculateTrendyolItem(raw);

    await db.execute({
      sql: `INSERT INTO trendyol_sales (id, included, date, is_expense_row, expense_title, sale_price, vat_rate, commission_rate, real_cost, cargo_base, cargo_vat_rate, extra_expense, partner_fixed, deduction, hakedis, net_vat, income_tax, partner_total_share, my_receivable, my_net_profit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        calculated.id,
        calculated.included ? 1 : 0,
        calculated.date,
        calculated.isExpenseRow ? 1 : 0,
        calculated.expenseTitle,
        calculated.salePrice,
        calculated.vatRate,
        calculated.commissionRate,
        calculated.realCost,
        calculated.cargoBase,
        calculated.cargoVatRate,
        calculated.extraExpense,
        calculated.partnerFixed,
        calculated.deduction,
        calculated.hakedis,
        calculated.netVat,
        calculated.incomeTax,
        calculated.partnerTotalShare,
        calculated.myReceivable,
        calculated.myNetProfit
      ]
    });

    return NextResponse.json({ success: true, data: calculated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
