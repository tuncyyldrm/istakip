import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT * FROM saved_parts;");
    const parts = res.rows.map(r => ({
      id: r.id,
      name: r.name,
      hours: r.hours,
      minutes: r.minutes
    }));
    return NextResponse.json({ success: true, data: parts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = `PART-${Date.now()}`;
    const name = body.name || "Yeni Parça";
    const hours = Number(body.hours) || 0;
    const minutes = Number(body.minutes) || 0;

    await db.execute({
      sql: "INSERT INTO saved_parts (id, name, hours, minutes) VALUES (?, ?, ?, ?);",
      args: [id, name, hours, minutes]
    });

    return NextResponse.json({ success: true, data: { id, name, hours, minutes } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
