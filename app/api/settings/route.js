import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";
import { calculateHourlyBaseCost } from "@/lib/calculations";

export async function GET() {
  try {
    await initDatabase();
    const res = await db.execute("SELECT value FROM settings WHERE key = 'general';");
    const settings = res.rows[0]?.value ? JSON.parse(res.rows[0].value) : {};
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await initDatabase();
    const body = await request.json();

    const curRes = await db.execute("SELECT value FROM settings WHERE key = 'general';");
    const current = curRes.rows[0]?.value ? JSON.parse(curRes.rows[0].value) : {};

    const merged = { ...current, ...body };
    const hourly = calculateHourlyBaseCost(merged);
    merged.hourlyBaseCost = hourly.totalHourly;

    await db.execute({
      sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('general', ?);",
      args: [JSON.stringify(merged)]
    });

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
