import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ enrollments: [] });

  const { data } = await supabaseService
    .from("enrollments")
    .select("course_slug, enrolled_at, payment_status")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  return NextResponse.json({ enrollments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseSlug, paymentStatus = "free" } = await req.json();
  if (!courseSlug) return NextResponse.json({ error: "courseSlug required" }, { status: 400 });

  const { error } = await supabaseService
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_slug: courseSlug, payment_status: paymentStatus },
      { onConflict: "user_id,course_slug", ignoreDuplicates: false }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
