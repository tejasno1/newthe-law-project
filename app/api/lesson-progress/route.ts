import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ completed: [] });

  const courseSlug = req.nextUrl.searchParams.get("courseSlug");
  if (!courseSlug) return NextResponse.json({ completed: [] });

  const { data } = await supabaseService
    .from("lesson_progress")
    .select("module_index, lesson_index, completed_at")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug);

  return NextResponse.json({ completed: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseSlug, moduleIndex, lessonIndex } = await req.json();

  const { error } = await supabaseService
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, course_slug: courseSlug, module_index: moduleIndex, lesson_index: lessonIndex },
      { onConflict: "user_id,course_slug,module_index,lesson_index", ignoreDuplicates: true }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
