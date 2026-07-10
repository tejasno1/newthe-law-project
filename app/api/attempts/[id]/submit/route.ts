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

  // ── Batch 1: auth + attempt + test all in parallel ─────────────────────────
  const [
    { data: { user } },
    { data: attempt },
    { data: test },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabaseService.from("test_attempts").select("*").eq("id", params.id).single(),
    // Fetch test using the slug the client provided; we verify it matches the
    // attempt's test_slug after we have the attempt data.
    body.testSlug
      ? supabaseService
          .from("mock_tests")
          .select("questions, total_marks, marks_per_correct, negative_mark")
          .eq("slug", body.testSlug)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!attempt || attempt.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (attempt.status !== "in_progress")
    return NextResponse.json({ error: "Already submitted", alreadyStatus: attempt.status }, { status: 409 });

  // If client sent the wrong slug (or no slug), fall back to a direct fetch
  const finalTest =
    test && body.testSlug === attempt.test_slug
      ? test
      : await supabaseService
          .from("mock_tests")
          .select("questions, total_marks, marks_per_correct, negative_mark")
          .eq("slug", attempt.test_slug)
          .single()
          .then((r) => r.data);

  if (!finalTest) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  // ── Score server-side — correctIndex never leaves this function ────────────
  const questions = finalTest.questions as Array<{
    id: number;
    correctIndex?: number;
    correct_index?: number;
  }>;
  const marksPerCorrect = Number(finalTest.marks_per_correct) || 1;
  const negativeMark = Number(finalTest.negative_mark) || 0.25;
  const maxScore = questions.length * marksPerCorrect;

  let correct = 0, incorrect = 0, unattempted = 0;
  for (const q of questions) {
    const correctIdx = q.correctIndex ?? q.correct_index ?? 0;
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
