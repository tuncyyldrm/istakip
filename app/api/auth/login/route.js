import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase, hashPassword } from "@/lib/schema";

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, message: "Şifre giriniz." }, { status: 400 });
    }

    const res = await db.execute("SELECT value FROM settings WHERE key = 'auth_password';");
    const storedHash = res.rows[0]?.value;

    const inputHash = hashPassword(String(password));

    if (storedHash && inputHash === storedHash) {
      // Simple signed session token
      const token = Buffer.from(JSON.stringify({ authenticated: true, timestamp: Date.now() })).toString("base64");
      return NextResponse.json({ success: true, token, message: "Giriş başarılı!" });
    } else {
      return NextResponse.json({ success: false, message: "Hatalı şifre! Lütfen tekrar deneyin." }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
