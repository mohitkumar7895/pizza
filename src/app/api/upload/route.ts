import { NextResponse } from "next/server";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import { FileUpload } from "@/lib/models/FileUpload";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to MongoDB
    const fileDoc = await FileUpload.create({
      filename: file.name,
      mimetype: file.type,
      data: buffer,
      size: file.size,
    });

    return NextResponse.json({
      url: `/api/file/${fileDoc._id}`,
      id: fileDoc._id,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
