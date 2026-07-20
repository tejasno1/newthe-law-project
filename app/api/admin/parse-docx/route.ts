import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mammoth from "mammoth";

// Admin auth guard
function isAdminAuthed(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get("tlp_admin")?.value;
  return !!token && token === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await mammoth.extractRawText({ buffer });
  return NextResponse.json({ text: result.value });
}
