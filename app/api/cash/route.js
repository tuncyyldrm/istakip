import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM cash_sessions ORDER BY date ASC, id ASC;");
    const sessions = res.rows.map(r => {
      const rawTotal = Number(r.total) || 0;
      const type = r.type || (rawTotal < 0 ? 'outflow' : 'inflow');
      let denoms = {};
      try {
        denoms = r.denominations ? (typeof r.denominations === 'string' ? JSON.parse(r.denominations) : r.denominations) : {};
      } catch (e) {
        denoms = {};
      }
      return {
        id: r.id,
        date: r.date,
        denominations: denoms,
        total: rawTotal,
        note: r.note || '',
        type: type,
        category: r.category || (type === 'outflow' ? 'Masraf / Çıkış' : 'Nakit Tahsilat')
      };
    });
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = body.id || `CASH-${Date.now()}`;
    const date = body.date || new Date().toISOString().split("T")[0];
    const denoms = body.denominations || { "200": 0, "100": 0, "50": 0, "20": 0, "10": 0, "5": 0 };
    const note = body.note || "";
    const type = body.type === 'outflow' ? 'outflow' : 'inflow';
    const category = body.category || (type === 'outflow' ? 'Masraf / Çıkış' : 'Nakit Tahsilat');

    let total = 0;
    if (body.total !== undefined && body.total !== null && body.total !== '') {
      total = Math.abs(Number(body.total) || 0);
    } else {
      for (const [k, v] of Object.entries(denoms)) {
        total += Number(k) * (Number(v) || 0);
      }
    }

    // Ensure outflows are negative, inflows are positive
    const finalTotal = type === 'outflow' ? -Math.abs(total) : Math.abs(total);

    await db.execute({
      sql: "INSERT INTO cash_sessions (id, date, denominations, total, note, type, category) VALUES (?, ?, ?, ?, ?, ?, ?);",
      args: [id, date, JSON.stringify(denoms), Number(finalTotal.toFixed(2)), note, type, category]
    });

    const newSession = { 
      id, 
      date, 
      denominations: denoms, 
      total: Number(finalTotal.toFixed(2)), 
      note,
      type,
      category
    };
    return NextResponse.json({ success: true, data: newSession }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
