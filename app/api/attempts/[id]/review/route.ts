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

  const { data: questionRows } = await supabaseService
    .from("mock_test_questions")
    .select("question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject")
    .eq("test_slug", attempt.test_slug)
    .order("question_number", { ascending: true });

  if (!questionRows) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const correctAnswerToIndex = (a: string) => ({ A: 0, B: 1, C: 2, D: 3 }[a?.toUpperCase()] ?? 0);

  const questions = questionRows.map((row) => ({
    id: row.question_number,
    text: row.question,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    correctIndex: correctAnswerToIndex(row.correct_answer), // safe — attempt already submitted
    ...(row.subject ? { subject: row.subject } : {}),
  }));

  return NextResponse.json({
    questions,
    answers: attempt.answers,
  });
}
