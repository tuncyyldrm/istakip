import { db } from "./db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

let initialized = false;

export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function initDatabase() {
  if (initialized) return;

  // 1. Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT,
      channel TEXT,
      customer TEXT,
      title TEXT,
      description TEXT,
      color TEXT,
      status TEXT,
      notes TEXT,
      print_hours REAL,
      print_minutes REAL,
      price REAL,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS trendyol_sales (
      id TEXT PRIMARY KEY,
      included INTEGER,
      date TEXT,
      is_expense_row INTEGER,
      expense_title TEXT,
      sale_price REAL,
      vat_rate REAL,
      commission_rate REAL,
      real_cost REAL,
      cargo_base REAL,
      cargo_vat_rate REAL,
      extra_expense REAL,
      partner_fixed REAL,
      deduction REAL,
      hakedis REAL,
      net_vat REAL,
      income_tax REAL,
      partner_total_share REAL,
      my_receivable REAL,
      my_net_profit REAL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cash_sessions (
      id TEXT PRIMARY KEY,
      date TEXT,
      denominations TEXT,
      total REAL,
      note TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS saved_parts (
      id TEXT PRIMARY KEY,
      name TEXT,
      hours REAL,
      minutes REAL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Initialize default password if not exists: default is "123456"
  const authRes = await db.execute("SELECT value FROM settings WHERE key = 'auth_password';");
  if (!authRes.rows || authRes.rows.length === 0) {
    const defaultHash = hashPassword("123456");
    await db.execute({
      sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('auth_password', ?);",
      args: [defaultHash]
    });
  }

  // 2. Check if database has data, if empty, seed from seed_data.json!
  const countRes = await db.execute("SELECT COUNT(*) as count FROM orders;");
  const count = countRes.rows[0]?.count || 0;

  if (Number(count) === 0) {
    const seedPath = path.join(process.cwd(), "data", "seed_data.json");
    if (fs.existsSync(seedPath)) {
      try {
        const raw = fs.readFileSync(seedPath, "utf-8");
        const seed = JSON.parse(raw);

        // Seed Orders
        for (const o of seed.orders || []) {
          await db.execute({
            sql: `INSERT OR REPLACE INTO orders (id, date, channel, customer, title, description, color, status, notes, print_hours, print_minutes, price, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              o.id,
              o.date || "",
              o.channel || "lokal",
              o.customer || "",
              o.title || "",
              o.description || "",
              o.color || "Beyaz",
              o.status || "Modelleme",
              o.notes || "",
              Number(o.printHours) || 0,
              Number(o.printMinutes) || 0,
              Number(o.price) || 0,
              new Date().toISOString()
            ]
          });
        }

        // Seed Trendyol Sales
        for (const s of seed.trendyolSales || []) {
          await db.execute({
            sql: `INSERT OR REPLACE INTO trendyol_sales (id, included, date, is_expense_row, expense_title, sale_price, vat_rate, commission_rate, real_cost, cargo_base, cargo_vat_rate, extra_expense, partner_fixed, deduction, hakedis, net_vat, income_tax, partner_total_share, my_receivable, my_net_profit)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              s.id,
              s.included ? 1 : 0,
              s.date || "",
              s.isExpenseRow ? 1 : 0,
              s.expenseTitle || "",
              Number(s.salePrice) || 0,
              Number(s.vatRate) || 0.2,
              Number(s.commissionRate) || 0.04,
              Number(s.realCost) || 0,
              Number(s.cargoBase) || 0,
              Number(s.cargoVatRate) || 0.2,
              Number(s.extraExpense) || 0,
              Number(s.partnerFixed) || 0,
              Number(s.deduction) || 0,
              Number(s.hakedis) || 0,
              Number(s.netVat) || 0,
              Number(s.incomeTax) || 0,
              Number(s.partnerTotalShare) || 0,
              Number(s.myReceivable) || 0,
              Number(s.myNetProfit) || 0
            ]
          });
        }

        // Seed Cash Sessions
        for (const c of seed.cashSessions || []) {
          await db.execute({
            sql: `INSERT OR REPLACE INTO cash_sessions (id, date, denominations, total, note)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [
              c.id,
              c.date || "",
              JSON.stringify(c.denominations || {}),
              Number(c.total) || 0,
              c.note || ""
            ]
          });
        }

        // Seed Saved Parts
        for (const p of seed.savedParts || []) {
          await db.execute({
            sql: `INSERT OR REPLACE INTO saved_parts (id, name, hours, minutes)
                  VALUES (?, ?, ?, ?)`,
            args: [
              p.id,
              p.name || "",
              Number(p.hours) || 0,
              Number(p.minutes) || 0
            ]
          });
        }

        // Seed Settings
        if (seed.settings) {
          await db.execute({
            sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
            args: ["general", JSON.stringify(seed.settings)]
          });
        }

        console.log("Database initialized & seeded successfully from Google Sheets data!");
      } catch (err) {
        console.error("Error seeding database:", err);
      }
    }
  }

  initialized = true;
}
