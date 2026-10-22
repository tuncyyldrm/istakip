import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM orders ORDER BY created_at DESC;");
    const orders = res.rows.map(r => ({
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
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = body.id || `ORD-${Date.now().toString().slice(-4)}`;
    const date = body.date || new Date().toISOString().split("T")[0];
    const channel = body.channel || "lokal";
    const customer = body.customer || "";
    const title = body.title || "";
    const description = body.description || "";
    const color = body.color || "Beyaz";
    const status = body.status || "Modelleme";
    const notes = body.notes || "";
    const printHours = Number(body.printHours) || 0;
    const printMinutes = Number(body.printMinutes) || 0;
    const price = Number(body.price) || 0;
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO orders (id, date, channel, customer, title, description, color, status, notes, print_hours, print_minutes, price, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, date, channel, customer, title, description, color, status, notes, printHours, printMinutes, price, createdAt]
    });

    const newOrder = { id, date, channel, customer, title, description, color, status, notes, printHours, printMinutes, price, createdAt };
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
