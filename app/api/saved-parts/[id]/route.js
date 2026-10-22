import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";

export async function DELETE(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    await db.execute({ sql: "DELETE FROM saved_parts WHERE id = ?;", args: [id] });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
