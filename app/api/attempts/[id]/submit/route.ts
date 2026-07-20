import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

const GRACE_MS = 10_000;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const body = await req.json() as {
    answers: Record<string, number>;
    questionTimes?: Record<string, number>;
    status?: string;
    testSlug?: string; // passed by client to allow parallel fetching
  };

  const correctAnswerToIndex = (a: string) => ({ A: 0, B: 1, C: 2, D: 3 }[a?.toUpperCase()] ?? 0);

  // ── Batch 1: auth + attempt + test metadata all in parallel ────────────────
  const [
    { data: { user } },
    { data: attempt },
    { data: testMeta },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabaseService.from("test_attempts").select("*").eq("id", params.id).single(),
    body.testSlug
      ? supabaseService
          .from("mock_tests")
          .select("slug, total_marks, marks_per_correct, negative_mark")
          .eq("slug", body.testSlug)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!attempt || attempt.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (attempt.status !== "in_progress")
    return NextResponse.json({ error: "Already submitted", alreadyStatus: attempt.status }, { status: 409 });

  const testSlug = attempt.test_slug as string;

  // If client sent wrong slug, fetch meta separately
  const finalTestMeta =
    testMeta && body.testSlug === testSlug
      ? testMeta
      : await supabaseService
          .from("mock_tests")
          .select("slug, total_marks, marks_per_correct, negative_mark")
          .eq("slug", testSlug)
          .single()
          .then((r) => r.data);

  if (!finalTestMeta) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  // Fetch questions from the dedicated table
  const { data: questionRows } = await supabaseService
    .from("mock_test_questions")
    .select("question_number, correct_answer")
    .eq("test_slug", testSlug)
    .order("question_number", { ascending: true });

  // ── Score server-side — correctIndex never leaves this function ────────────
  const questions = (questionRows ?? []).map((row: { question_number: number; correct_answer: string }) => ({
    id: row.question_number,
    correctIndex: correctAnswerToIndex(row.correct_answer),
  }));
  const marksPerCorrect = Number(finalTestMeta.marks_per_correct) || 1;
  const negativeMark = Number(finalTestMeta.negative_mark) || 0.25;
  const maxScore = questions.length * marksPerCorrect;

  let correct = 0, incorrect = 0, unattempted = 0;
  for (const q of questions) {
    const correctIdx = q.correctIndex;
    const userAnswer = body.answers?.[String(q.id)];
    if (userAnswer === undefined || userAnswer === null) {
      unattempted++;
    } else if (Number(userAnswer) === correctIdx) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const score = Math.max(0, correct * marksPerCorrect - incorrect * negativeMark);
  const accuracy = (correct + incorrect) > 0
    ? Math.round((correct / (correct + incorrect)) * 100)
    : 0;
  const isExpired = new Date() > new Date(new Date(attempt.expires_at).getTime() + GRACE_MS);
  const finalStatus = isExpired
    ? "auto_submitted_timer"
    : body.status === "auto_submitted_violations"
    ? "auto_submitted_violations"
    : "submitted";

  const now = new Date().toISOString();
  const timeTakenSeconds = Math.floor(
    (Date.now() - new Date(attempt.started_at).getTime()) / 1000
  );

  // Candidate name from auth metadata — no extra DB round trip needed
  const candidateName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email?.split("@")[0] ?? "Student");

  const percentile = maxScore > 0
    ? Math.min(99, Math.max(1, Math.round((score / maxScore) * 95)))
    : 1;

  // ── Batch 2: both writes in parallel ───────────────────────────────────────
  await Promise.all([
    supabaseService.from("test_attempts").update({
      status: finalStatus,
      submitted_at: now,
      answers: body.answers,
      question_times: body.questionTimes ?? {},
      score,
      correct,
      incorrect,
      unattempted,
    }).eq("id", params.id),

    supabaseService.from("test_results").insert({
      candidate_name: candidateName,
      test_slug: attempt.test_slug,
      test_title: attempt.test_slug,
      score,
      max_score: maxScore,
      correct,
      incorrect,
      unattempted,
      accuracy,
      percentile,
      rank: 1,
      time_taken_seconds: timeTakenSeconds,
      question_times: body.questionTimes ?? {},
      attempted_at: now,
    }),
  ]);

  return NextResponse.json({
    success: true,
    result: {
      score,
      maxScore,
      correct,
      incorrect,
      unattempted,
      accuracy,
      timeTaken: timeTakenSeconds,
      status: finalStatus,
    },
  });
}
