import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const seedPath = path.join(process.cwd(), "data", "seed_data.json");
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json({ success: false, message: "Seed data not found" }, { status: 404 });
    }

    const raw = fs.readFileSync(seedPath, "utf-8");
    const seed = JSON.parse(raw);

    // Drop and re-create
    await db.execute("DELETE FROM orders;");
    await db.execute("DELETE FROM trendyol_sales;");
    await db.execute("DELETE FROM cash_sessions;");
    await db.execute("DELETE FROM saved_parts;");
    await db.execute("DELETE FROM settings;");

    for (const o of seed.orders || []) {
      await db.execute({
        sql: `INSERT INTO orders (id, date, channel, customer, title, description, color, status, notes, print_hours, print_minutes, price, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [o.id, o.date, o.channel, o.customer, o.title, o.description, o.color, o.status, o.notes, o.printHours, o.printMinutes, o.price, new Date().toISOString()]
      });
    }

    for (const s of seed.trendyolSales || []) {
      await db.execute({
        sql: `INSERT INTO trendyol_sales (id, included, date, is_expense_row, expense_title, sale_price, vat_rate, commission_rate, real_cost, cargo_base, cargo_vat_rate, extra_expense, partner_fixed, deduction, hakedis, net_vat, income_tax, partner_total_share, my_receivable, my_net_profit)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          s.id, s.included ? 1 : 0, s.date, s.isExpenseRow ? 1 : 0, s.expenseTitle, s.salePrice,
          s.vatRate, s.commissionRate, s.realCost, s.cargoBase, s.cargoVatRate, s.extraExpense,
          s.partnerFixed, s.deduction, s.hakedis, s.netVat, s.incomeTax, s.partnerTotalShare,
          s.myReceivable, s.myNetProfit
        ]
      });
    }

    for (const c of seed.cashSessions || []) {
      await db.execute({
        sql: `INSERT INTO cash_sessions (id, date, denominations, total, note) VALUES (?, ?, ?, ?, ?)`,
        args: [c.id, c.date, JSON.stringify(c.denominations), c.total, c.note || ""]
      });
    }

    for (const p of seed.savedParts || []) {
      await db.execute({
        sql: `INSERT INTO saved_parts (id, name, hours, minutes) VALUES (?, ?, ?, ?)`,
        args: [p.id, p.name, p.hours, p.minutes]
      });
    }

    if (seed.settings) {
      await db.execute({
        sql: `INSERT INTO settings (key, value) VALUES ('general', ?)`,
        args: [JSON.stringify(seed.settings)]
      });
    }

    return NextResponse.json({ success: true, message: "Database reset to Google Sheets originals" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
