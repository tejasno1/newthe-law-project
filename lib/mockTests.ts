import { supabaseService } from "@/lib/supabase/service";

// ── Passage type (safe for client) ────────────────────────────────────────────
export interface Passage {
  id: number;
  passageNumber: number;
  title?: string;
  text: string;
  source?: string;
}

// Full question type — SERVER ONLY. Never send to the browser.
export interface MockQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  subject?: string;
  passageId?: number; // references passages.id
}

// Safe question type — correctIndex stripped before sending to client.
export interface MockQuestionSafe {
  id: number;
  text: string;
  options: string[];
  subject?: string;
  passageId?: number;
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
  testType: "normal" | "passage_based";
  passages?: Passage[];
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
  test_type: string | null;
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
  passage_id: number | null;
}

interface PassageRow {
  id: number;
  passage_number: number;
  title: string | null;
  text: string;
  source: string | null;
}

const toNumber = (v: number | string) => (typeof v === "number" ? v : parseFloat(v) || 0);

const mapDifficulty = (v: string): MockTest["difficulty"] => {
  const u = v?.toUpperCase();
  return u === "EASY" || u === "MEDIUM" || u === "HARD" ? u : "MEDIUM";
};

const correctAnswerToIndex = (a: string): number => {
  return { A: 0, B: 1, C: 2, D: 3 }[a?.toUpperCase()] ?? 0;
};

const mapRow = (row: MockTestRow, questions: MockQuestion[] = [], passages: Passage[] = []): MockTest => ({
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
  testType: row.test_type === "passage_based" ? "passage_based" : "normal",
  passages: passages.length > 0 ? passages : undefined,
  questions,
});

const mapQuestionRow = (row: QuestionRow): MockQuestion => ({
  id: row.question_number,
  text: row.question,
  options: [row.option_a, row.option_b, row.option_c, row.option_d],
  correctIndex: correctAnswerToIndex(row.correct_answer),
  ...(row.subject ? { subject: row.subject } : {}),
  ...(row.passage_id ? { passageId: row.passage_id } : {}),
});

const mapPassageRow = (row: PassageRow): Passage => ({
  id: row.id,
  passageNumber: row.passage_number,
  ...(row.title ? { title: row.title } : {}),
  text: row.text,
  ...(row.source ? { source: row.source } : {}),
});

const toSafe = (test: MockTest): MockTestSafe => ({
  ...test,
  questions: test.questions.map(({ correctIndex: _stripped, ...q }) => q),
});

const TEST_SELECT =
  "slug, title, section, category, duration_minutes, total_questions, total_marks, attempted_label, language, difficulty, recent_attempt_line, marks_per_correct, negative_mark, is_free, price, test_type";

const TEST_SELECT_FALLBACK =
  "slug, title, section, category, duration_minutes, total_questions, total_marks, attempted_label, language, difficulty, recent_attempt_line, marks_per_correct, negative_mark, is_free, price";

async function fetchTestQuestions(slug: string): Promise<MockQuestion[]> {
  const { data, error } = await supabaseService
    .from("mock_test_questions")
    .select("question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id")
    .eq("test_slug", slug)
    .order("question_number", { ascending: true });

  if (error) {
    // passage_id column may not exist yet — fall back without it
    const { data: fallback } = await supabaseService
      .from("mock_test_questions")
      .select("question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject")
      .eq("test_slug", slug)
      .order("question_number", { ascending: true });
    return (fallback ?? []).map((row) => mapQuestionRow({ ...(row as Omit<QuestionRow, "passage_id">), passage_id: null }));
  }

  return (data ?? []).map((row) => mapQuestionRow(row as QuestionRow));
}

async function fetchPassages(slug: string): Promise<Passage[]> {
  const { data } = await supabaseService
    .from("passages")
    .select("id, passage_number, title, text, source")
    .eq("test_slug", slug)
    .order("passage_number", { ascending: true });

  return (data ?? []).map((row) => mapPassageRow(row as PassageRow));
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getAllMockTests(): Promise<MockTestSafe[]> {
  const { data, error } = await supabaseService
    .from("mock_tests")
    .select(TEST_SELECT)
    .order("id", { ascending: true });

  if (!error) return (data as MockTestRow[]).map((row) => toSafe(mapRow(row, [])));

  // test_type column may not exist yet
  const { data: fallback, error: fallbackError } = await supabaseService
    .from("mock_tests")
    .select(TEST_SELECT_FALLBACK)
    .order("id", { ascending: true });

  if (fallbackError) { console.error("Failed to load mock tests:", fallbackError.message); return []; }
  return (fallback as Omit<MockTestRow, "test_type">[]).map((row) =>
    toSafe(mapRow({ ...row, test_type: null }, []))
  );
}

export async function getMockTestSlugs(): Promise<string[]> {
  const { data, error } = await supabaseService.from("mock_tests").select("slug");
  if (error) {
    console.error("Failed to load mock test slugs:", error.message);
    return [];
  }
  return (data as { slug: string }[]).map((r) => r.slug);
}

async function fetchTestRow(slug: string): Promise<MockTestRow | null> {
  const { data, error } = await supabaseService
    .from("mock_tests")
    .select(TEST_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (!error) return data as MockTestRow | null;

  // test_type column may not exist yet — fall back without it
  console.warn("fetchTestRow: falling back without test_type column:", error.message);
  const { data: fallback, error: fallbackError } = await supabaseService
    .from("mock_tests")
    .select(TEST_SELECT_FALLBACK)
    .eq("slug", slug)
    .maybeSingle();

  if (fallbackError) { console.error("Failed to load mock test:", fallbackError.message); return null; }
  return fallback ? { ...(fallback as Omit<MockTestRow, "test_type">), test_type: null } : null;
}

// Safe version — correctIndex stripped. Use for pages that pass data to client components.
export async function getMockTestBySlug(slug: string): Promise<MockTestSafe | null> {
  const [row, questions] = await Promise.all([
    fetchTestRow(slug),
    fetchTestQuestions(slug),
  ]);

  if (!row) return null;

  const passages = row.test_type === "passage_based" ? await fetchPassages(slug) : [];
  return toSafe(mapRow(row, questions, passages));
}

// Full version (correctIndex included) — route handlers only, never expose to client.
export async function getMockTestBySlugFull(slug: string): Promise<MockTest | null> {
  const [row, questions] = await Promise.all([
    fetchTestRow(slug),
    fetchTestQuestions(slug),
  ]);

  if (!row) return null;

  const passages = row.test_type === "passage_based" ? await fetchPassages(slug) : [];
  return mapRow(row, questions, passages);
}
