import { supabase } from "@/lib/supabaseClient";

export interface QuestionReportPayload {
  testSlug: string;
  questionId: number;
  candidateName: string;
  reportTypes: string[];
  additionalNote: string;
}

export async function saveQuestionReport(payload: QuestionReportPayload): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("question_reports").insert([
    {
      test_slug: payload.testSlug,
      question_id: payload.questionId,
      candidate_name: payload.candidateName,
      report_types: payload.reportTypes,
      additional_note: payload.additionalNote,
      reported_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Failed to save question report to Supabase:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
