import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM printers ORDER BY id ASC;");
    const printers = res.rows.map(r => ({
      id: r.id,
      name: r.name,
      model: r.model,
      status: r.status,
      nozzleSize: r.nozzle_size,
      currentFilament: r.current_filament,
      activeOrderTitle: r.active_order_title,
      totalHours: Number(r.total_hours) || 0,
      notes: r.notes || '',
      image: r.image || null,
      updatedAt: r.updated_at
    }));
    return NextResponse.json({ success: true, data: printers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = body.id || `PRN-${Date.now().toString().slice(-4)}`;
    const name = body.name || 'Yeni 3D Yazıcı';
    const model = body.model || '';
    const status = body.status || 'Boşta';
    const nozzleSize = body.nozzleSize || '0.4 mm';
    const currentFilament = body.currentFilament || '';
    const activeOrderTitle = body.activeOrderTitle || '';
    const totalHours = Number(body.totalHours) || 0;
    const notes = body.notes || '';
    const image = body.image || null;
    const updatedAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO printers (id, name, model, status, nozzle_size, current_filament, active_order_title, total_hours, notes, image, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name, model, status, nozzleSize, currentFilament, activeOrderTitle, totalHours, notes, image, updatedAt]
    });

    const newPrinter = { id, name, model, status, nozzleSize, currentFilament, activeOrderTitle, totalHours, notes, image, updatedAt };
    return NextResponse.json({ success: true, data: newPrinter }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
