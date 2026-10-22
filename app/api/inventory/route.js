import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM inventory_items ORDER BY category ASC, name ASC;");
    const items = res.rows.map(r => ({
      id: r.id,
      category: r.category,
      name: r.name,
      brand: r.brand,
      material: r.material,
      color: r.color,
      quantity: Number(r.quantity) || 0,
      unit: r.unit || 'adet',
      minThreshold: Number(r.min_threshold) || 0,
      unitPrice: Number(r.unit_price) || 0,
      location: r.location || '',
      notes: r.notes || '',
      updatedAt: r.updated_at
    }));
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = body.id || `INV-${Date.now().toString().slice(-5)}`;
    const category = body.category || 'consumable';
    const name = body.name || '';
    const brand = body.brand || '';
    const material = body.material || '';
    const color = body.color || '';
    const quantity = Number(body.quantity) || 0;
    const unit = body.unit || (category === 'filament' ? 'gr' : 'adet');
    const minThreshold = Number(body.minThreshold) || 0;
    const unitPrice = Number(body.unitPrice) || 0;
    const location = body.location || '';
    const notes = body.notes || '';
    const updatedAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO inventory_items (id, category, name, brand, material, color, quantity, unit, min_threshold, unit_price, location, notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, category, name, brand, material, color, quantity, unit, minThreshold, unitPrice, location, notes, updatedAt]
    });

    const newItem = { id, category, name, brand, material, color, quantity, unit, minThreshold, unitPrice, location, notes, updatedAt };
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
