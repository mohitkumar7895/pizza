import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const original = file.name || "upload";
    const ext = path.extname(original).replace(/[^.a-z0-9]/gi, "") || ".jpg";
    const safeExt = ext.length > 8 ? ".jpg" : ext;
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, name);
    await writeFile(filepath, buffer);
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
