import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseSlug } = await req.json();
  if (!courseSlug) return NextResponse.json({ error: "courseSlug required" }, { status: 400 });

  const { error } = await supabase
    .from("tnc_agreements")
    .upsert({ user_id: user.id, course_slug: courseSlug }, { onConflict: "user_id,course_slug" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
