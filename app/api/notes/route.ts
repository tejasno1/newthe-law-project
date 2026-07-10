import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

// GET /api/notes?courseSlug=xxx  — returns all notes for a course
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notes: {} });

  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get("courseSlug");
  if (!courseSlug) return NextResponse.json({ notes: {} });

  const { data } = await supabaseService
    .from("lesson_notes")
    .select("lesson_id, notes")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug);

  const notes: Record<string, string> = {};
  for (const row of data ?? []) notes[row.lesson_id] = row.notes;

  return NextResponse.json({ notes });
}

// POST /api/notes  — upsert a single lesson's note
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseSlug, lessonId, notes } = await req.json() as {
    courseSlug: string;
    lessonId: string;
    notes: string;
  };

  const { error } = await supabaseService
    .from("lesson_notes")
    .upsert(
      { user_id: user.id, course_slug: courseSlug, lesson_id: lessonId, notes },
      { onConflict: "user_id,course_slug,lesson_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
