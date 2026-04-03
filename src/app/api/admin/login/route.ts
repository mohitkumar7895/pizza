import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import { Admin } from "@/lib/models/Admin";
import { jsonWithAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Set MONGODB_URI in .env or .env.local (spaces hata do = ke baad), phir dev server restart.",
        },
        { status: 503 }
      );
    }
    await connectDB();
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }
    const admin = await Admin.findOne({ username }).lean();
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return jsonWithAdminSession(String(admin._id), admin.username);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
