import { supabase } from "@/lib/supabaseClient";

export interface TestResultPayload {
  candidateName: string;
  testSlug: string;
  testTitle: string;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  percentile: number;
  rank: number;
  timeTakenSeconds: number;
  questionTimes: Record<number, number>;
}

export async function saveTestResult(payload: TestResultPayload): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("test_results").insert([
    {
      candidate_name: payload.candidateName,
      test_slug: payload.testSlug,
      test_title: payload.testTitle,
      score: payload.score,
      max_score: payload.maxScore,
      correct: payload.correct,
      incorrect: payload.incorrect,
      unattempted: payload.unattempted,
      accuracy: payload.accuracy,
      percentile: payload.percentile,
      rank: payload.rank,
      time_taken_seconds: payload.timeTakenSeconds,
      question_times: payload.questionTimes,
      attempted_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Failed to save test result to Supabase:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export interface TestStats {
  count: number;
  average: number;
  best: number;
  topPerformerName: string;
  topPerformerScore: number;
}

export async function getTestStats(testSlug: string): Promise<TestStats | null> {
  const { data, error } = await supabase.from("test_results_public").select("score, candidate_name").eq("test_slug", testSlug);

  if (error || !data || data.length === 0) {
    if (error) console.error("Failed to fetch test stats from Supabase:", error.message);
    return null;
  }

  const rows = data.map((row) => ({ score: Number(row.score), name: String(row.candidate_name ?? "Anonymous") }));
  const count = rows.length;
  const average = Math.round((rows.reduce((sum, r) => sum + r.score, 0) / count) * 100) / 100;
  const top = rows.reduce((best, r) => (r.score > best.score ? r : best), rows[0]);

  return { count, average, best: top.score, topPerformerName: top.name, topPerformerScore: top.score };
}
