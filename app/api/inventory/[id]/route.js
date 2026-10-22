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
      sql: `UPDATE inventory_items SET
              category = COALESCE(?, category),
              name = COALESCE(?, name),
              brand = COALESCE(?, brand),
              material = COALESCE(?, material),
              color = COALESCE(?, color),
              quantity = COALESCE(?, quantity),
              unit = COALESCE(?, unit),
              min_threshold = COALESCE(?, min_threshold),
              unit_price = COALESCE(?, unit_price),
              location = COALESCE(?, location),
              notes = COALESCE(?, notes),
              updated_at = ?
            WHERE id = ?`,
      args: [
        body.category,
        body.name,
        body.brand,
        body.material,
        body.color,
        body.quantity !== undefined ? Number(body.quantity) : null,
        body.unit,
        body.minThreshold !== undefined ? Number(body.minThreshold) : null,
        body.unitPrice !== undefined ? Number(body.unitPrice) : null,
        body.location,
        body.notes,
        updatedAt,
        id
      ]
    });

    const res = await db.execute({ sql: "SELECT * FROM inventory_items WHERE id = ?;", args: [id] });
    const r = res.rows[0];
    if (!r) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });

    const updated = {
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
      updatedAt: r.updated_at
    };

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH for quick quantity adjust: { delta: +50 } or { delta: -10 } or { quantity: 500 }
export async function PATCH(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    if (body.delta !== undefined) {
      await db.execute({
        sql: `UPDATE inventory_items SET quantity = MAX(0, quantity + ?), updated_at = ? WHERE id = ?;`,
        args: [Number(body.delta), updatedAt, id]
      });
    } else if (body.quantity !== undefined) {
      await db.execute({
        sql: `UPDATE inventory_items SET quantity = MAX(0, ?), updated_at = ? WHERE id = ?;`,
        args: [Number(body.quantity), updatedAt, id]
      });
    }

    const res = await db.execute({ sql: "SELECT * FROM inventory_items WHERE id = ?;", args: [id] });
    const r = res.rows[0];
    if (!r) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });

    const updated = {
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

export async function DELETE(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    await db.execute({ sql: "DELETE FROM inventory_items WHERE id = ?;", args: [id] });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
