import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { getMockTestBySlug } from "@/lib/mockTests";
import TestResultView from "@/components/TestResultView";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: { slug: string; attemptId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/mock-test/${params.slug}/report/${params.attemptId}`);

  // Parallel: attempt + test metadata + review questions
  const [{ data: attempt }, test, statsRes, { data: testWithQuestions }] = await Promise.all([
    supabaseService
      .from("test_attempts")
      .select("*")
      .eq("id", params.attemptId)
      .eq("user_id", user.id)
      .single(),
    getMockTestBySlug(params.slug),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/tests/${params.slug}/stats`,
      { cache: "no-store" }
    ).then((r) => r.json()).catch(() => ({ stats: null })),
    // Fetch full questions (with correctIndex) — safe since attempt is submitted
    supabaseService
      .from("mock_tests")
      .select("questions")
      .eq("slug", params.slug)
      .single(),
  ]);

  if (!attempt || attempt.status === "in_progress" || !test) notFound();

  const maxScore = test.totalQuestions * test.marksPerCorrect;
  const score = Number(attempt.score ?? 0);
  const correct = Number(attempt.correct ?? 0);
  const incorrect = Number(attempt.incorrect ?? 0);
  const unattempted = Number(attempt.unattempted ?? 0);
  const accuracy = (correct + incorrect) > 0
    ? Math.round((correct / (correct + incorrect)) * 100) : 0;
  const timeTaken = attempt.submitted_at && attempt.started_at
    ? Math.floor((new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 1000)
    : 0;
  const percentile = maxScore > 0
    ? Math.min(99, Math.max(1, Math.round((score / maxScore) * 95))) : 1;
  const stats = statsRes?.stats ?? null;

  const candidateName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email?.split("@")[0] ?? "Student");

  const results = {
    score, maxScore, correct, incorrect, unattempted, accuracy, timeTaken, percentile,
    totalParticipants: stats?.count ?? 1,
    rank: stats ? Math.max(1, Math.round(stats.count * (1 - percentile / 100))) : 1,
    averageScore: stats?.average ?? score,
    bestScore: stats?.best ?? score,
    topPerformerName: stats?.topPerformerName ?? candidateName,
    topPerformerScore: stats?.topPerformerScore ?? score,
  };

  return (
    <TestResultView
      test={test}
      results={results}
      answers={(attempt.answers as Record<number, number>) ?? {}}
      questionTimes={(attempt.question_times as Record<number, number>) ?? {}}
      reviewQuestions={(testWithQuestions?.questions as Array<{ id: number; text: string; options: string[]; correctIndex?: number; subject?: string }>) ?? []}
      attemptId={params.attemptId}
      candidateName={candidateName}
      marksPerCorrect={test.marksPerCorrect}
      negativeMark={test.negativeMark}
    />
  );
}
