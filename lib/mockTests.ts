import { supabaseService } from "@/lib/supabase/service";

// Full question type — SERVER ONLY. Never send to the browser.
export interface MockQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  subject?: string; // section/subject the question belongs to
}

// Safe question type — correctIndex stripped before sending to client.
export interface MockQuestionSafe {
  id: number;
  text: string;
  options: string[];
  subject?: string; // safe to expose — no answers here
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
  questions: MockQuestion[]; // server-only, never passed to client components
}

// Safe variant for client components — questions have no correctIndex.
export type MockTestSafe = Omit<MockTest, "questions"> & {
  questions: MockQuestionSafe[];
};

interface RawQuestion {
  id?: number;
  text: string;
  options: string[];
  correctIndex?: number;
  correct_index?: number;
  subject?: string;
}

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
  questions: RawQuestion[] | null;
}

const toNumber = (v: number | string) => (typeof v === "number" ? v : parseFloat(v) || 0);

const mapDifficulty = (v: string): MockTest["difficulty"] => {
  const u = v?.toUpperCase();
  return u === "EASY" || u === "MEDIUM" || u === "HARD" ? u : "MEDIUM";
};

const mapRow = (row: MockTestRow): MockTest => ({
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
  questions: (row.questions ?? []).map((q, i) => ({
    id: q.id ?? i + 1,
    text: q.text,
    options: q.options ?? [],
    correctIndex: q.correctIndex ?? q.correct_index ?? 0,
    ...(q.subject ? { subject: q.subject } : {}),
  })),
});

const toSafe = (test: MockTest): MockTestSafe => ({
  ...test,
  questions: test.questions.map(({ correctIndex: _stripped, ...q }) => q),
});

// ── Public API ───────────────────────────────────────────────────

export async function getAllMockTests(): Promise<MockTestSafe[]> {
  const { data, error } = await supabaseService
    .from("mock_tests")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to load mock tests:", error.message);
    return [];
  }
  return (data as MockTestRow[]).map(mapRow).map(toSafe);
}

export async function getMockTestSlugs(): Promise<string[]> {
  const { data, error } = await supabaseService.from("mock_tests").select("slug");
  if (error) {
    console.error("Failed to load mock test slugs:", error.message);
    return [];
  }
  return (data as { slug: string }[]).map((r) => r.slug);
}

// Safe version — correctIndex stripped. Use for server components that pass data to clients.
export async function getMockTestBySlug(slug: string): Promise<MockTestSafe | null> {
  const { data, error } = await supabaseService
    .from("mock_tests")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) { console.error("Failed to load mock test:", error.message); return null; }
  if (!data) return null;
  return toSafe(mapRow(data as MockTestRow));
}

// Full version (correctIndex included) — route handlers only, never expose to client.
export async function getMockTestBySlugFull(slug: string): Promise<MockTest | null> {
  const { data, error } = await supabaseService
    .from("mock_tests")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) { console.error("Failed to load mock test:", error.message); return null; }
  if (!data) return null;
  return mapRow(data as MockTestRow);
}
