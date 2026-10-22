import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase, hashPassword } from "@/lib/schema";

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ success: false, message: "Yeni şifre en az 4 karakter olmalıdır." }, { status: 400 });
    }

    const res = await db.execute("SELECT value FROM settings WHERE key = 'auth_password';");
    const storedHash = res.rows[0]?.value;

    const oldInputHash = hashPassword(String(oldPassword));

    if (storedHash && oldInputHash !== storedHash) {
      return NextResponse.json({ success: false, message: "Mevcut şifreniz hatalı!" }, { status: 401 });
    }

    const newHash = hashPassword(String(newPassword));
    await db.execute({
      sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('auth_password', ?);",
      args: [newHash]
    });

    return NextResponse.json({ success: true, message: "Şifreniz başarıyla güncellendi!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
