import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: attempt } = await supabaseService
    .from("test_attempts")
    .select("user_id, test_slug, status, answers")
    .eq("id", params.id)
    .single();

  if (!attempt || attempt.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only reveal answers after submission — never during an in-progress attempt
  if (attempt.status === "in_progress")
    return NextResponse.json({ error: "Test not yet submitted" }, { status: 403 });

  const { data: test } = await supabaseService
    .from("mock_tests")
    .select("questions")
    .eq("slug", attempt.test_slug)
    .single();

  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  return NextResponse.json({
    questions: test.questions, // correctIndex included — safe because attempt is already submitted
    answers: attempt.answers,
  });
}
