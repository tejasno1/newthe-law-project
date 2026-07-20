import { supabaseService } from "@/lib/supabase/service";

// Full question type — SERVER ONLY. Never send to the browser.
export interface MockQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  subject?: string;
}

// Safe question type — correctIndex stripped before sending to client.
export interface MockQuestionSafe {
  id: number;
  text: string;
  options: string[];
  subject?: string;
}

export interface MockTest {
  slug: string;
  title: string;
  section: string;
  category: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  attemptedLabel: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  recentAttemptLine: string;
  marksPerCorrect: number;
  negativeMark: number;
  isFree: boolean;
  price: number;
  questions: MockQuestion[]; // server-only, never passed to client components
}

// Safe variant for client components — questions have no correctIndex.
export type MockTestSafe = Omit<MockTest, "questions"> & {
  questions: MockQuestionSafe[];
};

interface MockTestRow {
  slug: string;
  title: string;
  section: string;
  category: string | null;
  duration_minutes: number | string;
  total_questions: number | string;
  total_marks: number | string;
  attempted_label: string;
  language: string;
  difficulty: string;
  recent_attempt_line: string;
  marks_per_correct: number | string;
  negative_mark: number | string;
  is_free: boolean | null;
  price: number | string | null;
}

interface QuestionRow {
  question_number: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  subject: string | null;
}

const toNumber = (v: number | string) => (typeof v === "number" ? v : parseFloat(v) || 0);

const mapDifficulty = (v: string): MockTest["difficulty"] => {
  const u = v?.toUpperCase();
  return u === "EASY" || u === "MEDIUM" || u === "HARD" ? u : "MEDIUM";
};

const correctAnswerToIndex = (a: string): number => {
  return { A: 0, B: 1, C: 2, D: 3 }[a?.toUpperCase()] ?? 0;
};

const mapRow = (row: MockTestRow, questions: MockQuestion[] = []): MockTest => ({
  slug: row.slug,
  title: row.title,
  section: row.section,
  category: row.category ?? "General",
  durationMinutes: toNumber(row.duration_minutes),
  totalQuestions: toNumber(row.total_questions),
  totalMarks: toNumber(row.total_marks),
  attemptedLabel: row.attempted_label,
  language: row.language,
  difficulty: mapDifficulty(row.difficulty),
  recentAttemptLine: row.recent_attempt_line,
  marksPerCorrect: toNumber(row.marks_per_correct),
  negativeMark: toNumber(row.negative_mark),
  isFree: row.is_free ?? false,
  price: toNumber(row.price ?? 0),
  questions,
});

const mapQuestionRow = (row: QuestionRow): MockQuestion => ({
  id: row.question_number,
  text: row.question,
  options: [row.option_a, row.option_b, row.option_c, row.option_d],
  correctIndex: correctAnswerToIndex(row.correct_answer),
  ...(row.subject ? { subject: row.subject } : {}),
});

const toSafe = (test: MockTest): MockTestSafe => ({
  ...test,
  questions: test.questions.map(({ correctIndex: _stripped, ...q }) => q),
});

// Fetch all questions for a single test from mock_test_questions table
async function fetchTestQuestions(slug: string): Promise<MockQuestion[]> {
  const { data } = await supabaseService
    .from("mock_test_questions")
    .select("question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject")
    .eq("test_slug", slug)
    .order("question_number", { ascending: true });

  return (data ?? []).map((row) => mapQuestionRow(row as QuestionRow));
}

// ── Public API ───────────────────────────────────────────────────

// Catalog list — questions not needed here, returns empty arrays
export async function getAllMockTests(): Promise<MockTestSafe[]> {
  const { data, error } = await supabaseService
    .from("mock_tests")
    .select("slug, title, section, category, duration_minutes, total_questions, total_marks, attempted_label, language, difficulty, recent_attempt_line, marks_per_correct, negative_mark, is_free, price")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to load mock tests:", error.message);
    return [];
  }
  return (data as MockTestRow[]).map((row) => toSafe(mapRow(row, [])));
}

export async function getMockTestSlugs(): Promise<string[]> {
  const { data, error } = await supabaseService.from("mock_tests").select("slug");
  if (error) {
    console.error("Failed to load mock test slugs:", error.message);
    return [];
  }
  return (data as { slug: string }[]).map((r) => r.slug);
}

// Safe version — correctIndex stripped. Use for pages that pass data to client components.
export async function getMockTestBySlug(slug: string): Promise<MockTestSafe | null> {
  const [{ data: testData, error }, questions] = await Promise.all([
    supabaseService
      .from("mock_tests")
      .select("slug, title, section, category, duration_minutes, total_questions, total_marks, attempted_label, language, difficulty, recent_attempt_line, marks_per_correct, negative_mark, is_free, price")
      .eq("slug", slug)
      .maybeSingle(),
    fetchTestQuestions(slug),
  ]);

  if (error) { console.error("Failed to load mock test:", error.message); return null; }
  if (!testData) return null;
  return toSafe(mapRow(testData as MockTestRow, questions));
}

// Full version (correctIndex included) — route handlers only, never expose to client.
export async function getMockTestBySlugFull(slug: string): Promise<MockTest | null> {
  const [{ data: testData, error }, questions] = await Promise.all([
    supabaseService
      .from("mock_tests")
      .select("slug, title, section, category, duration_minutes, total_questions, total_marks, attempted_label, language, difficulty, recent_attempt_line, marks_per_correct, negative_mark, is_free, price")
      .eq("slug", slug)
      .maybeSingle(),
    fetchTestQuestions(slug),
  ]);

  if (error) { console.error("Failed to load mock test:", error.message); return null; }
  if (!testData) return null;
  return mapRow(testData as MockTestRow, questions);
}
