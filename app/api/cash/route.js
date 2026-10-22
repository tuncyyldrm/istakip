import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM cash_sessions ORDER BY date ASC;");
    const sessions = res.rows.map(r => ({
      id: r.id,
      date: r.date,
      denominations: r.denominations ? JSON.parse(r.denominations) : {},
      total: r.total,
      note: r.note
    }));
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = `CASH-${Date.now()}`;
    const date = body.date || new Date().toISOString().split("T")[0];
    const denoms = body.denominations || { "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 };
    const note = body.note || "";

    let total = 0;
    for (const [k, v] of Object.entries(denoms)) {
      total += Number(k) * (Number(v) || 0);
    }

    await db.execute({
      sql: "INSERT INTO cash_sessions (id, date, denominations, total, note) VALUES (?, ?, ?, ?, ?);",
      args: [id, date, JSON.stringify(denoms), Number(total.toFixed(2)), note]
    });

    const newSession = { id, date, denominations: denoms, total: Number(total.toFixed(2)), note };
    return NextResponse.json({ success: true, data: newSession }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
