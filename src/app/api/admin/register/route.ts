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
            "Database not configured. Set MONGODB_URI in .env or .env.local and restart dev server.",
        },
        { status: 503 }
      );
    }
    await connectDB();

    if ((await Admin.countDocuments()) > 0) {
      return NextResponse.json(
        {
          error:
            "Registration band hai — pehle se admin account hai. Sirf login karein.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const confirm =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username kam se kam 3 characters" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password kam se kam 6 characters" },
        { status: 400 }
      );
    }
    if (password !== confirm) {
      return NextResponse.json(
        { error: "Password match nahi kar rahe" },
        { status: 400 }
      );
    }

    const taken = await Admin.exists({ username });
    if (taken) {
      return NextResponse.json(
        { error: "Yeh username pehle se hai" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ username, passwordHash });

    return jsonWithAdminSession(String(admin._id), admin.username);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }
}
