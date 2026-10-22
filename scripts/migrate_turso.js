const { createClient } = require('@libsql/client');
const fs = require('fs');

const url = 'libsql://istakip-db-tuncyyldrm.aws-eu-west-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTI2NjM2NTQsImlkIjoiMDFhMTYzMTQtNzEwMS03ZTM5LTk2MWYtODc0MTZmNzU0NGU5Iiwia2lkIjoiRmo3cE5sUkJhUVhIUzd4cEIzZm01WFJmZ2dlTE9WODE3UjdCTjM5TXNzUSIsInJpZCI6IjExMjBiMDcxLTE1YmQtNGNjNS1iN2RiLWI0NDNjNjkxNzgyYSJ9.tyMUs7R0uUeX91U-vV0lGbK_PsSanZcPA8c_hPg1uCtNFYRpJQJb-trlqaDuF1QMGj3R2XvlC50BRtMfomHDAA';

const client = createClient({ url, authToken });

async function migrate() {
  console.log('1. Creating tables in Turso Cloud...');
  await client.execute(`
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

  await client.execute(`
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

  await client.execute(`
    CREATE TABLE IF NOT EXISTS cash_sessions (
      id TEXT PRIMARY KEY,
      date TEXT,
      denominations TEXT,
      total REAL,
      note TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS saved_parts (
      id TEXT PRIMARY KEY,
      name TEXT,
      hours REAL,
      minutes REAL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('2. Inserting seed data from Google Sheets into Turso Cloud...');
  const seed = JSON.parse(fs.readFileSync('data/seed_data.json', 'utf-8'));

  for (const o of seed.orders || []) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO orders (id, date, channel, customer, title, description, color, status, notes, print_hours, print_minutes, price, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [o.id, o.date, o.channel, o.customer, o.title, o.description, o.color, o.status, o.notes, o.printHours, o.printMinutes, o.price, new Date().toISOString()]
    });
  }

  for (const s of seed.trendyolSales || []) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO trendyol_sales (id, included, date, is_expense_row, expense_title, sale_price, vat_rate, commission_rate, real_cost, cargo_base, cargo_vat_rate, extra_expense, partner_fixed, deduction, hakedis, net_vat, income_tax, partner_total_share, my_receivable, my_net_profit)
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
    await client.execute({
      sql: `INSERT OR REPLACE INTO cash_sessions (id, date, denominations, total, note) VALUES (?, ?, ?, ?, ?)`,
      args: [c.id, c.date, JSON.stringify(c.denominations), c.total, c.note || '']
    });
  }

  for (const p of seed.savedParts || []) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO saved_parts (id, name, hours, minutes) VALUES (?, ?, ?, ?)`,
      args: [p.id, p.name, p.hours, p.minutes]
    });
  }

  if (seed.settings) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO settings (key, value) VALUES ('general', ?)`,
      args: [JSON.stringify(seed.settings)]
    });
  }

  console.log('Turso Cloud database successfully seeded with all Google Sheets data!');
  const check = await client.execute('SELECT COUNT(*) as c FROM orders;');
  console.log('Total Orders in Turso Cloud:', check.rows[0].c);
}

migrate().catch(console.error);
