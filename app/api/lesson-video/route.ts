import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get("courseSlug");
  const moduleIndex = parseInt(searchParams.get("moduleIndex") ?? "");
  const lessonIndex = parseInt(searchParams.get("lessonIndex") ?? "");
  const partIndex = parseInt(searchParams.get("partIndex") ?? "-1");

  if (!courseSlug || isNaN(moduleIndex) || isNaN(lessonIndex)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  // Must be authenticated
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Must be enrolled
  const { data: enrollment } = await supabaseService
    .from("enrollments")
    .select("payment_status")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  // Fetch lesson from DB
  const { data: lesson } = await supabaseService
    .from("course_lessons")
    .select("video_url, video_qualities, parts")
    .eq("course_slug", courseSlug)
    .eq("module_index", moduleIndex)
    .eq("lesson_index", lessonIndex)
    .maybeSingle();

  if (!lesson) return NextResponse.json({ video_url: null, video_qualities: null });

  // Return specific part's URL or the main lesson URL
  if (partIndex >= 0 && Array.isArray(lesson.parts) && lesson.parts[partIndex]) {
    const part = lesson.parts[partIndex] as { video_url?: string; video_qualities?: Record<string, string> };
    return NextResponse.json({
      video_url: part.video_url ?? null,
      video_qualities: part.video_qualities ?? null,
    });
  }

  return NextResponse.json({
    video_url: lesson.video_url ?? null,
    video_qualities: lesson.video_qualities ?? null,
  });
}
