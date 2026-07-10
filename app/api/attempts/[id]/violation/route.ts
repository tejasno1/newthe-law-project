import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

const MAX_VIOLATIONS = 3;

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: attempt } = await supabaseService
    .from("test_attempts")
    .select("id, user_id, violation_count, status")
    .eq("id", params.id)
    .single();

  if (!attempt || attempt.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If already submitted (by timer or previous flow), just report current count
  if (attempt.status !== "in_progress") {
    return NextResponse.json({
      violationCount: attempt.violation_count ?? 0,
      autoSubmitted: true,
    });
  }

  const newCount = (attempt.violation_count ?? 0) + 1;
  const autoSubmitted = newCount >= MAX_VIOLATIONS;

  // Only increment the count — NEVER change status here.
  // Status is exclusively set by the submit route after scoring.
  // This prevents the race condition where status is set before scoring,
  // causing the submit route to return 409 and the client to never get results.
  await supabaseService
    .from("test_attempts")
    .update({ violation_count: newCount })
    .eq("id", params.id);

  return NextResponse.json({ violationCount: newCount, autoSubmitted });
}
