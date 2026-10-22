import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function PUT(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    await db.execute({
      sql: `UPDATE printers SET
              name = COALESCE(?, name),
              model = COALESCE(?, model),
              status = COALESCE(?, status),
              nozzle_size = COALESCE(?, nozzle_size),
              current_filament = COALESCE(?, current_filament),
              active_order_title = COALESCE(?, active_order_title),
              total_hours = COALESCE(?, total_hours),
              notes = COALESCE(?, notes),
              updated_at = ?
            WHERE id = ?`,
      args: [
        body.name,
        body.model,
        body.status,
        body.nozzleSize,
        body.currentFilament,
        body.activeOrderTitle,
        body.totalHours !== undefined ? Number(body.totalHours) : null,
        body.notes,
        updatedAt,
        id
      ]
    });

    const res = await db.execute({ sql: "SELECT * FROM printers WHERE id = ?;", args: [id] });
    const r = res.rows[0];
    if (!r) return NextResponse.json({ success: false, message: "Printer not found" }, { status: 404 });

    const updated = {
      id: r.id,
      name: r.name,
      model: r.model,
      status: r.status,
      nozzleSize: r.nozzle_size,
      currentFilament: r.current_filament,
      activeOrderTitle: r.active_order_title,
      totalHours: Number(r.total_hours) || 0,
      notes: r.notes,
      updatedAt: r.updated_at
    };

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH for quick status update: { status: 'Baskıda' | 'Boşta' | 'Bakımda', activeOrderTitle?: string }
export async function PATCH(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    await db.execute({
      sql: `UPDATE printers SET
              status = COALESCE(?, status),
              nozzle_size = COALESCE(?, nozzle_size),
              current_filament = COALESCE(?, current_filament),
              active_order_title = COALESCE(?, active_order_title),
              updated_at = ?
            WHERE id = ?`,
      args: [
        body.status || null,
        body.nozzleSize || null,
        body.currentFilament || null,
        body.activeOrderTitle !== undefined ? body.activeOrderTitle : null,
        updatedAt,
        id
      ]
    });

    const res = await db.execute({ sql: "SELECT * FROM printers WHERE id = ?;", args: [id] });
    const r = res.rows[0];
    if (!r) return NextResponse.json({ success: false, message: "Printer not found" }, { status: 404 });

    const updated = {
      id: r.id,
      name: r.name,
      model: r.model,
      status: r.status,
      nozzleSize: r.nozzle_size,
      currentFilament: r.current_filament,
      activeOrderTitle: r.active_order_title,
      totalHours: Number(r.total_hours) || 0,
      notes: r.notes,
      updatedAt: r.updated_at
    };

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
