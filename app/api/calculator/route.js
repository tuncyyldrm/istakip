import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";
import { calculatePrintCost } from "@/lib/calculations";

export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const hours = Number(searchParams.get("hours")) || 0;
    const minutes = Number(searchParams.get("minutes")) || 0;

    const setRes = await db.execute("SELECT value FROM settings WHERE key = 'general';");
    const settings = setRes.rows[0]?.value ? JSON.parse(setRes.rows[0].value) : {};

    const calculation = calculatePrintCost(hours, minutes, settings);
    return NextResponse.json({ success: true, data: calculation });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
