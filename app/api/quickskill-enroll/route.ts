import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { sendEnrollmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { slug, email, name } = await req.json();
  if (!slug || !email) return NextResponse.json({ error: "slug and email required" }, { status: 400 });

  const { data: prog } = await supabaseService
    .from("programmes")
    .select("title, enrollment_email")
    .eq("slug", slug)
    .maybeSingle();

  if (prog?.enrollment_email) {
    sendEnrollmentEmail({
      to: email,
      courseTitle: prog.title,
      emailBody: prog.enrollment_email,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
