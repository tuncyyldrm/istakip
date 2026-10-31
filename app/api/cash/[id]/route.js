import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function PUT(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();

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

    const finalTotal = type === 'outflow' ? -Math.abs(total) : Math.abs(total);

    await db.execute({
      sql: `UPDATE cash_sessions SET
              date = ?,
              denominations = ?,
              total = ?,
              note = ?,
              type = ?,
              category = ?
            WHERE id = ?;`,
      args: [date, JSON.stringify(denoms), Number(finalTotal.toFixed(2)), note, type, category, id]
    });

    const updatedSession = {
      id,
      date,
      denominations: denoms,
      total: Number(finalTotal.toFixed(2)),
      note,
      type,
      category
    };

    return NextResponse.json({ success: true, data: updatedSession });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    await db.execute({ sql: "DELETE FROM cash_sessions WHERE id = ?;", args: [id] });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
