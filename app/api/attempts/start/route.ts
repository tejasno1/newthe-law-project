import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { testSlug } = await req.json() as { testSlug: string };

  const { data: test } = await supabaseService
    .from("mock_tests")
    .select("slug, duration_minutes, marks_per_correct, negative_mark")
    .eq("slug", testSlug)
    .single();

  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  // Check for existing in-progress attempt that has not expired
  const { data: existing } = await supabaseService
    .from("test_attempts")
    .select("id, expires_at, violation_count")
    .eq("user_id", user.id)
    .eq("test_slug", testSlug)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && new Date(existing.expires_at) > new Date()) {
    return NextResponse.json({
      attemptId: existing.id,
      expiresAt: existing.expires_at,
      violationCount: existing.violation_count ?? 0,
      resumed: true,
    });
  }

  // Expire any stale in-progress attempt
  if (existing) {
    await supabaseService
      .from("test_attempts")
      .update({ status: "auto_submitted_timer", submitted_at: new Date().toISOString() })
      .eq("id", existing.id);
  }

  const durationMs = Number(test.duration_minutes) * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  const { data: attempt, error } = await supabaseService
    .from("test_attempts")
    .insert({
      user_id: user.id,
      test_slug: testSlug,
      expires_at: expiresAt,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !attempt) {
    console.error("Failed to create attempt:", error?.message);
    return NextResponse.json({ error: "Failed to start attempt" }, { status: 500 });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    expiresAt,
    violationCount: 0,
    resumed: false,
  });
}
