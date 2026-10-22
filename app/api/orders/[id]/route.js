import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function PUT(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();

    const updatedAt = new Date().toISOString();
    const hasImageUpdate = body.image !== undefined ? 1 : 0;
    const imageVal = body.image || null;

    await db.execute({
      sql: `UPDATE orders SET
              date = COALESCE(?, date),
              channel = COALESCE(?, channel),
              customer = COALESCE(?, customer),
              title = COALESCE(?, title),
              description = COALESCE(?, description),
              color = COALESCE(?, color),
              status = COALESCE(?, status),
              notes = COALESCE(?, notes),
              print_hours = COALESCE(?, print_hours),
              print_minutes = COALESCE(?, print_minutes),
              price = COALESCE(?, price),
              image = CASE WHEN ? = 1 THEN ? ELSE image END,
              updated_at = ?
            WHERE id = ?`,
      args: [
        body.date,
        body.channel,
        body.customer,
        body.title,
        body.description,
        body.color,
        body.status,
        body.notes,
        body.printHours,
        body.printMinutes,
        body.price,
        hasImageUpdate,
        imageVal,
        updatedAt,
        id
      ]
    });

    const res = await db.execute({ sql: "SELECT * FROM orders WHERE id = ?;", args: [id] });
    const r = res.rows[0];
    if (!r) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

    const updated = {
      id: r.id,
      date: r.date,
      channel: r.channel,
      customer: r.customer,
      title: r.title,
      description: r.description,
      color: r.color,
      status: r.status,
      notes: r.notes,
      printHours: r.print_hours,
      printMinutes: r.print_minutes,
      price: r.price,
      image: r.image || null,
      updatedAt: r.updated_at
    };

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    if (body.status) {
      await db.execute({
        sql: "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?;",
        args: [body.status, updatedAt, id]
      });
    }

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    await db.execute({ sql: "DELETE FROM orders WHERE id = ?;", args: [id] });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
