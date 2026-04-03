import { NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import { Admin } from "@/lib/models/Admin";

/** True jab tak DB mein koi admin user nahi — tab hi Register dikhao. */
export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({ canRegister: false, reason: "no_db" });
    }
    await connectDB();
    const count = await Admin.countDocuments();
    return NextResponse.json({ canRegister: count === 0 });
  } catch {
    return NextResponse.json({ canRegister: false, reason: "error" });
  }
}
