"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ContentBlock } from "@/lib/blogs";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function adminLogin(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get("password") as string;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) return "ADMIN_SECRET is not configured in environment variables.";
  if (!password || password !== adminSecret) return "Incorrect password.";

  const cookieStore = cookies();
  cookieStore.set("tlp_admin", adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  redirect("/admin/courses");
}

export async function adminLogout() {
  const cookieStore = cookies();
  cookieStore.delete("tlp_admin");
  redirect("/admin/login");
}

// ── Course Updates ─────────────────────────────────────────────────────────────

export type ModuleItem = {
  title: string;
  duration?: string;
  content_type?: "video" | "reading";
  video_url?: string;
};

export type CourseModule = {
  title: string;
  description?: string;
  module_duration?: string;
  lessons_count?: number;
  items: ModuleItem[];
};

export type CourseFAQ = {
  question: string;
  answer: string;
};

export type CourseUpdateData = {
  title?: string;
  desc?: string;
  long_desc?: string;
  category?: string;
  price?: number | null;
  old_price?: number | null;
  duration?: string;
  lessons?: number | null;
  level?: string;
  language?: string;
  files?: number | null;
  rating?: number | null;
  students?: number | null;
  img?: string;
  access_type?: string | null;
  delivery_type?: string | null;
  modules?: CourseModule[];
  outcomes?: string[];
  ideal_for?: string[];
  faqs?: CourseFAQ[];
  requires_tnc?: boolean;
  tnc_content?: string | null;
  is_coming_soon?: boolean;
  start_date?: string | null;
  offer_valid_till?: string | null;
  show_offer_validity?: boolean;
  enrollment_email?: string | null;
  demo_video_url?: string | null;
  demo_video_url_2?: string | null;
  demo_video_url_3?: string | null;
};

export async function updateCourse(
  slug: string,
  data: CourseUpdateData
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("courses")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) return { error: error.message };

  revalidatePath(`/course/${slug}`);
  revalidatePath("/course");
  revalidatePath("/");
  return {};
}

export async function deleteCourse(slug: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from("courses").delete().eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/admin/courses");
  revalidatePath("/course");
  revalidatePath("/");
  return {};
}

// ── Image Upload ───────────────────────────────────────────────────────────────

export async function uploadCourseImage(
  slug: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("course-images")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabaseAdmin.storage.from("course-images").getPublicUrl(path);

  const { error: dbError } = await supabaseAdmin
    .from("courses")
    .update({ img: data.publicUrl, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (dbError) return { error: dbError.message };

  revalidatePath(`/course/${slug}`);
  revalidatePath("/course");
  revalidatePath("/");

  return { url: data.publicUrl };
}

// ── Blog Updates ──────────────────────────────────────────────────────────────

export type BlogUpdateData = {
  title?: string;
  category?: string;
  excerpt?: string;
  author?: string;
  author_img?: string;
  date?: string;
  read_time?: string;
  img?: string;
  featured?: boolean;
  tags?: string[];
  content?: ContentBlock[];
};

export async function updateBlog(
  slug: string,
  data: BlogUpdateData
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("blogs")
    .update(data)
    .eq("slug", slug);

  if (error) return { error: error.message };

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  revalidatePath("/");
  return {};
}

export async function uploadBlogImage(
  slug: string,
  field: "img" | "author_img",
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${slug}-${field}-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("blog-images")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabaseAdmin.storage.from("blog-images").getPublicUrl(path);

  const { error: dbError } = await supabaseAdmin
    .from("blogs")
    .update({ [field]: data.publicUrl })
    .eq("slug", slug);

  if (dbError) return { error: dbError.message };

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);

  return { url: data.publicUrl };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCourse(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get("title") as string)?.trim();
  const customSlug = (formData.get("slug") as string)?.trim();

  if (!title) return "Title is required.";

  const slug = customSlug ? slugify(customSlug) : slugify(title);
  if (!slug) return "Could not generate a valid slug from the title.";

  const { data: existing } = await supabaseAdmin
    .from("courses")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return `A course with slug "${slug}" already exists. Try a different title or slug.`;

  const { error } = await supabaseAdmin.from("courses").insert({
    slug,
    title,
    desc: "",
    long_desc: "",
    category: "",
    price: 0,
    old_price: null,
    duration: "",
    lessons: 0,
    level: "",
    language: "English",
    files: 0,
    rating: 0,
    students: 0,
    img: "",
    access_type: null,
    delivery_type: null,
    modules: [],
    outcomes: [],
    ideal_for: [],
    faqs: [],
  });

  if (error) return error.message;

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${slug}`);
}

export async function createBlog(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get("title") as string)?.trim();
  const customSlug = (formData.get("slug") as string)?.trim();

  if (!title) return "Title is required.";

  const slug = customSlug ? slugify(customSlug) : slugify(title);
  if (!slug) return "Could not generate a valid slug from the title.";

  const { data: existing } = await supabaseAdmin
    .from("blogs")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return `A post with slug "${slug}" already exists. Try a different title or slug.`;

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabaseAdmin.from("blogs").insert({
    slug,
    title,
    category: "",
    read_time: "5 min read",
    excerpt: "",
    author: "",
    author_img: "",
    date: today,
    img: "",
    content: [],
    featured: false,
    tags: [],
  });

  if (error) return error.message;

  revalidatePath("/admin/blogs");
  redirect(`/admin/blogs/${slug}`);
}

export async function uploadBlogContentImage(
  slug: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${slug}-content-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("blog-images")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabaseAdmin.storage.from("blog-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function deleteBlog(slug: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from("blogs").delete().eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/admin/blogs");
  revalidatePath("/blogs");
  return {};
}

// ── Course Videos ─────────────────────────────────────────────────────────────

export type VideoPart = {
  label: string;
  video_url: string;
  video_qualities?: Record<string, string>;
};

export async function getAdminCourseList(): Promise<{ slug: string; title: string }[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("slug, title")
    .order("id", { ascending: true });
  if (error) return [];
  return (data ?? []) as { slug: string; title: string }[];
}

export type AdminLessonData = {
  title: string;
  parts: VideoPart[];
  resources: { title: string; path: string }[];
};

export async function getCourseLessonsAdmin(courseSlug: string): Promise<
  Array<{ title: string; items: AdminLessonData[] }>
> {
  const [{ data: courseData }, { data: lessonRows }] = await Promise.all([
    supabaseAdmin.from("courses").select("modules").eq("slug", courseSlug).maybeSingle(),
    supabaseAdmin
      .from("course_lessons")
      .select("module_index, lesson_index, video_url, video_qualities, parts, resources")
      .eq("course_slug", courseSlug),
  ]);

  const rawModules: Array<{ title: string; items?: Array<{ title: string } | string> }> =
    (courseData as { modules: typeof rawModules } | null)?.modules ?? [];

  return rawModules.map((mod, mi) => ({
    title: mod.title,
    items: (mod.items ?? []).map((item, li) => {
      const row = (lessonRows ?? []).find(
        (r: { module_index: number; lesson_index: number }) =>
          r.module_index === mi && r.lesson_index === li
      ) as {
        video_url?: string | null;
        video_qualities?: Record<string, string> | null;
        parts?: VideoPart[] | null;
        resources?: { title: string; path: string }[] | null;
      } | undefined;

      const existingParts: VideoPart[] = row?.parts?.length
        ? row.parts
        : row?.video_url
        ? [{ label: "Part 1", video_url: row.video_url, video_qualities: row.video_qualities ?? undefined }]
        : [];

      return {
        title: typeof item === "string" ? item : item.title,
        parts: existingParts,
        resources: row?.resources ?? [],
      };
    }),
  }));
}

export async function saveCourseLessonParts(
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
  parts: VideoPart[]
): Promise<{ error?: string }> {
  const payload = {
    course_slug: courseSlug,
    module_index: moduleIndex,
    lesson_index: lessonIndex,
    parts: parts.length > 0 ? parts : null,
    video_url: parts[0]?.video_url ?? null,
    video_qualities: parts[0]?.video_qualities ?? null,
  };

  const { error } = await supabaseAdmin
    .from("course_lessons")
    .upsert(payload, { onConflict: "course_slug,module_index,lesson_index" });

  if (error) return { error: error.message };

  revalidatePath(`/course/${courseSlug}/learn`);
  return {};
}

export async function createSignedVideoUploadUrl(
  courseSlug: string,
  filename: string
): Promise<{ signedUrl?: string; publicUrl?: string; error?: string }> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "mp4";
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${courseSlug}/${Date.now()}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from("course-videos")
    .createSignedUploadUrl(path);

  if (error) return { error: error.message };

  const { data: urlData } = supabaseAdmin.storage.from("course-videos").getPublicUrl(path);

  return { signedUrl: data.signedUrl, publicUrl: urlData.publicUrl };
  void ext;
}

// ── Course Resources ──────────────────────────────────────────────────────────

export async function uploadCourseResource(
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
  title: string,
  formData: FormData
): Promise<{ error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };
  if (file.type !== "application/pdf") return { error: "Only PDF files are allowed." };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${courseSlug}/m${moduleIndex}-l${lessonIndex}-${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("course-resources")
    .upload(path, arrayBuffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) return { error: uploadError.message };

  // Fetch existing resources for this lesson
  const { data: existing } = await supabaseAdmin
    .from("course_lessons")
    .select("resources")
    .eq("course_slug", courseSlug)
    .eq("module_index", moduleIndex)
    .eq("lesson_index", lessonIndex)
    .maybeSingle();

  const currentResources: { title: string; path: string }[] = (existing as { resources?: { title: string; path: string }[] } | null)?.resources ?? [];
  const newResources = [...currentResources, { title: title.trim() || file.name, path }];

  const { error: dbError } = await supabaseAdmin
    .from("course_lessons")
    .upsert(
      { course_slug: courseSlug, module_index: moduleIndex, lesson_index: lessonIndex, resources: newResources },
      { onConflict: "course_slug,module_index,lesson_index" }
    );

  if (dbError) return { error: dbError.message };
  revalidatePath(`/course/${courseSlug}/learn`);
  return {};
}

// ── Mock Tests ────────────────────────────────────────────────────────────────

export type MockTestUpdateData = {
  title?: string;
  section?: string;
  category?: string;
  duration_minutes?: number;
  total_questions?: number;
  total_marks?: number;
  attempted_label?: string;
  language?: string;
  difficulty?: string;
  recent_attempt_line?: string;
  marks_per_correct?: number;
  negative_mark?: number;
  is_free?: boolean;
  price?: number;
  test_type?: "normal" | "passage_based";
  enrollment_email?: string | null;
};

// Shape for questions coming from Excel upload
export type ExcelQuestionRow = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  subject?: string;
  passage_number?: number; // for passage-based tests
};

export async function createMockTest(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get("title") as string)?.trim();
  const customSlug = (formData.get("slug") as string)?.trim();

  if (!title) return "Title is required.";

  const slug = customSlug ? slugify(customSlug) : slugify(title);
  if (!slug) return "Could not generate a valid slug.";

  const { data: existing } = await supabaseAdmin
    .from("mock_tests")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return `A test with slug "${slug}" already exists.`;

  const { error } = await supabaseAdmin.from("mock_tests").insert({
    slug,
    title,
    section: "",
    category: "General",
    duration_minutes: 60,
    total_questions: 0,
    total_marks: 0,
    attempted_label: "0 attempts",
    language: "English",
    difficulty: "MEDIUM",
    recent_attempt_line: "",
    marks_per_correct: 1,
    negative_mark: 0,
    is_free: true,
    price: 0,
    questions: [],
  });

  if (error) return error.message;

  revalidatePath("/admin/mock-tests");
  redirect(`/admin/mock-tests/${slug}`);
}

export async function updateMockTest(
  slug: string,
  data: MockTestUpdateData
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("mock_tests")
    .update(data)
    .eq("slug", slug);

  if (error) return { error: error.message };

  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-test");
  revalidatePath(`/mock-test/${slug}`);
  return {};
}

export async function deleteMockTest(slug: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from("mock_tests").delete().eq("slug", slug);
  if (error) return { error: error.message };
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-test");
  return {};
}

export async function appendQuestionsToTest(
  slug: string,
  newQuestions: ExcelQuestionRow[]
): Promise<{ error?: string; added?: number }> {
  // Find the highest existing question_number for this test
  const { data: existing } = await supabaseAdmin
    .from("mock_test_questions")
    .select("question_number")
    .eq("test_slug", slug)
    .order("question_number", { ascending: false })
    .limit(1);

  const lastNum = (existing?.[0] as { question_number: number } | undefined)?.question_number ?? 0;

  // If any questions reference a passage_number, resolve to passage IDs
  const passageNumberToId: Record<number, number> = {};
  if (newQuestions.some((q) => q.passage_number)) {
    const { data: passageRows } = await supabaseAdmin
      .from("passages")
      .select("id, passage_number")
      .eq("test_slug", slug);
    for (const p of (passageRows ?? []) as { id: number; passage_number: number }[]) {
      passageNumberToId[p.passage_number] = p.id;
    }
  }

  const rows = newQuestions.map((q, i) => ({
    test_slug: slug,
    question_number: lastNum + i + 1,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    subject: q.subject ?? "",
    passage_id: q.passage_number ? (passageNumberToId[q.passage_number] ?? null) : null,
  }));

  const { error: insertErr } = await supabaseAdmin
    .from("mock_test_questions")
    .insert(rows);

  if (insertErr) return { error: insertErr.message };

  // Update total_questions count
  const { count } = await supabaseAdmin
    .from("mock_test_questions")
    .select("*", { count: "exact", head: true })
    .eq("test_slug", slug);

  await supabaseAdmin
    .from("mock_tests")
    .update({ total_questions: count ?? lastNum + rows.length })
    .eq("slug", slug);

  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-test");
  revalidatePath(`/mock-test/${slug}`);
  return { added: rows.length };
}

// ── Passages ──────────────────────────────────────────────────────────────────

export type PassageData = {
  title?: string;
  text: string;
  source?: string;
};

export async function createPassage(
  testSlug: string,
  data: PassageData
): Promise<{ id?: number; passageNumber?: number; error?: string }> {
  // Get next passage_number for this test
  const { data: existing } = await supabaseAdmin
    .from("passages")
    .select("passage_number")
    .eq("test_slug", testSlug)
    .order("passage_number", { ascending: false })
    .limit(1);

  const nextNum = ((existing?.[0] as { passage_number: number } | undefined)?.passage_number ?? 0) + 1;

  const { data: inserted, error } = await supabaseAdmin
    .from("passages")
    .insert({
      test_slug: testSlug,
      passage_number: nextNum,
      title: data.title?.trim() || null,
      text: data.text.trim(),
      source: data.source?.trim() || null,
    })
    .select("id, passage_number")
    .maybeSingle();

  if (error) return { error: error.message };

  revalidatePath(`/admin/mock-tests/${testSlug}`);
  return { id: (inserted as { id: number }).id, passageNumber: nextNum };
}

export async function updatePassage(
  passageId: number,
  testSlug: string,
  data: PassageData
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("passages")
    .update({
      title: data.title?.trim() || null,
      text: data.text.trim(),
      source: data.source?.trim() || null,
    })
    .eq("id", passageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/mock-tests/${testSlug}`);
  return {};
}

export async function deletePassage(
  passageId: number,
  testSlug: string
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from("passages").delete().eq("id", passageId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/mock-tests/${testSlug}`);
  return {};
}

export async function deleteCourseResource(
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
  path: string
): Promise<{ error?: string }> {
  // Delete file from storage
  await supabaseAdmin.storage.from("course-resources").remove([path]);

  // Remove from DB resources array
  const { data: existing } = await supabaseAdmin
    .from("course_lessons")
    .select("resources")
    .eq("course_slug", courseSlug)
    .eq("module_index", moduleIndex)
    .eq("lesson_index", lessonIndex)
    .maybeSingle();

  const updated = ((existing as { resources?: { title: string; path: string }[] } | null)?.resources ?? [])
    .filter((r) => r.path !== path);

  const { error } = await supabaseAdmin
    .from("course_lessons")
    .upsert(
      { course_slug: courseSlug, module_index: moduleIndex, lesson_index: lessonIndex, resources: updated.length ? updated : null },
      { onConflict: "course_slug,module_index,lesson_index" }
    );

  if (error) return { error: error.message };
  revalidatePath(`/course/${courseSlug}/learn`);
  return {};
}

// ── Resource Categories ────────────────────────────────────────────────────────

export async function createResourceCategory(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data, error } = await supabaseAdmin
    .from("resource_categories")
    .insert({ name, slug })
    .select("id, name, slug")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return { category: data };
}

export async function deleteResourceCategory(id: number) {
  const { error } = await supabaseAdmin.from("resource_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return {};
}

// ── Exam Categories ────────────────────────────────────────────────────────────

export async function createExamCategory(name: string) {
  const { data, error } = await supabaseAdmin
    .from("exam_categories")
    .insert({ name, sort_order: 0 })
    .select("id, name, sort_order")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return { category: data };
}

export async function deleteExamCategory(id: number) {
  const { error } = await supabaseAdmin.from("exam_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return {};
}

// ── Resources ──────────────────────────────────────────────────────────────────

export interface ResourceFormData {
  title: string;
  description?: string;
  categoryId?: number | null;
  examCategory?: string | null;
  filePath?: string | null;
  pages?: number | null;
  sizeLabel?: string | null;
  isFree?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export async function uploadResourceFile(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("resources")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };
  return { path };
}

export async function createResource(data: ResourceFormData) {
  const { error, data: row } = await supabaseAdmin
    .from("resources")
    .insert({
      title: data.title,
      description: data.description ?? null,
      category_id: data.categoryId ?? null,
      exam_category: data.examCategory ?? null,
      file_path: data.filePath ?? null,
      pages: data.pages ?? null,
      size_label: data.sizeLabel ?? null,
      is_free: data.isFree ?? true,
      is_published: data.isPublished ?? false,
      sort_order: data.sortOrder ?? 0,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return { id: (row as { id: number }).id };
}

export async function updateResource(id: number, data: ResourceFormData) {
  const { error } = await supabaseAdmin
    .from("resources")
    .update({
      title: data.title,
      description: data.description ?? null,
      category_id: data.categoryId ?? null,
      exam_category: data.examCategory ?? null,
      file_path: data.filePath ?? null,
      pages: data.pages ?? null,
      size_label: data.sizeLabel ?? null,
      is_free: data.isFree ?? true,
      is_published: data.isPublished ?? false,
      sort_order: data.sortOrder ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return {};
}

export async function deleteResource(id: number, filePath?: string | null) {
  if (filePath) {
    await supabaseAdmin.storage.from("resources").remove([filePath]);
  }
  const { error } = await supabaseAdmin.from("resources").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return {};
}

export async function toggleResourcePublished(id: number, published: boolean) {
  const { error } = await supabaseAdmin
    .from("resources")
    .update({ is_published: published })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return {};
}

// ── Question Bank ─────────────────────────────────────────────────────────────

export async function createQuestionBankCategory(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data, error } = await supabaseAdmin
    .from("question_bank_categories")
    .insert({ name, slug })
    .select("id, name, slug, sort_order")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/question-bank");
  revalidatePath("/question-bank");
  return { category: data };
}

export async function deleteQuestionBankCategory(id: number) {
  const { error } = await supabaseAdmin.from("question_bank_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/question-bank");
  revalidatePath("/question-bank");
  return {};
}

export interface QuestionBankFormData {
  title: string;
  description?: string;
  subject?: string | null;
  examCategory?: string | null;
  filePath?: string | null;
  isFree?: boolean;
  price?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

function questionBankPricing(data: QuestionBankFormData): { is_free: boolean; price: number } | { error: string } {
  const isFree = data.isFree ?? true;
  const price = isFree ? 0 : Number(data.price ?? 0);
  if (!isFree && (!Number.isFinite(price) || price <= 0)) return { error: "Enter a price above ₹0 for a paid question set." };
  return { is_free: isFree, price };
}

export async function uploadQuestionBankFile(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("question-bank")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };
  return { path };
}

export async function createQuestionBankItem(data: QuestionBankFormData) {
  const pricing = questionBankPricing(data);
  if ("error" in pricing) return { error: pricing.error };
  const { error, data: row } = await supabaseAdmin
    .from("question_bank")
    .insert({
      title: data.title,
      description: data.description ?? null,
      subject: data.subject ?? null,
      exam_category: data.examCategory ?? null,
      file_path: data.filePath ?? null,
      ...pricing,
      is_published: data.isPublished ?? true,
      sort_order: data.sortOrder ?? 0,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/question-bank");
  revalidatePath("/question-bank");
  return { id: (row as { id: number }).id };
}

export async function updateQuestionBankItem(id: number, data: QuestionBankFormData) {
  const pricing = questionBankPricing(data);
  if ("error" in pricing) return { error: pricing.error };
  const { error } = await supabaseAdmin
    .from("question_bank")
    .update({
      title: data.title,
      description: data.description ?? null,
      subject: data.subject ?? null,
      exam_category: data.examCategory ?? null,
      file_path: data.filePath ?? null,
      ...pricing,
      is_published: data.isPublished ?? true,
      sort_order: data.sortOrder ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/question-bank");
  revalidatePath("/question-bank");
  return {};
}

export async function deleteQuestionBankItem(id: number, filePath?: string | null) {
  if (filePath) {
    await supabaseAdmin.storage.from("question-bank").remove([filePath]);
  }
  const { error } = await supabaseAdmin.from("question_bank").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/question-bank");
  revalidatePath("/question-bank");
  return {};
}

export async function toggleQuestionBankPublished(id: number, published: boolean) {
  const { error } = await supabaseAdmin
    .from("question_bank")
    .update({ is_published: published })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/question-bank");
  revalidatePath("/question-bank");
  return {};
}

// ── Testimonials ────────────────────────────────────────────────────────────────

export async function uploadTestimonialAvatar(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `testimonials/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from("course-images")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (error) return { error: error.message };

  const { data: urlData } = supabaseAdmin.storage.from("course-images").getPublicUrl(path);
  return { url: urlData.publicUrl };
}

export interface TestimonialFormData {
  name: string;
  role: string;
  avatarUrl?: string | null;
  rating?: number;
  body: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export async function createTestimonial(data: TestimonialFormData) {
  const { error, data: row } = await supabaseAdmin
    .from("testimonials")
    .insert({
      name: data.name,
      role: data.role,
      avatar_url: data.avatarUrl ?? null,
      rating: data.rating ?? 5,
      body: data.body,
      is_published: data.isPublished ?? true,
      sort_order: data.sortOrder ?? 0,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { id: (row as { id: number }).id };
}

export async function updateTestimonial(id: number, data: TestimonialFormData) {
  const { error } = await supabaseAdmin
    .from("testimonials")
    .update({
      name: data.name,
      role: data.role,
      avatar_url: data.avatarUrl ?? null,
      rating: data.rating ?? 5,
      body: data.body,
      is_published: data.isPublished ?? true,
      sort_order: data.sortOrder ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return {};
}

export async function deleteTestimonial(id: number) {
  const { error } = await supabaseAdmin.from("testimonials").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return {};
}

export async function toggleTestimonialPublished(id: number, published: boolean) {
  const { error } = await supabaseAdmin
    .from("testimonials")
    .update({ is_published: published })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return {};
}

// ── QuickSkills / Programmes ──────────────────────────────────────────────────

export type ProgrammeUpdateData = {
  title?: string;
  short_title?: string;
  tagline?: string;
  badge?: string;
  is_new?: boolean;
  category?: string;
  duration?: string;
  hours_per_week?: string;
  price?: number;
  enrollment?: string;
  cover_img?: string;
  description?: string;
  highlights?: string[];
  who_for?: { label: string; desc: string }[];
  learnings?: string[];
  methodology?: { title: string; desc: string }[];
  objectives_groups?: { title: string; items: string[] }[];
  syllabus?: { title: string; items: string[] }[];
  faculty?: { name: string; role: string; bio: string; img: string }[];
  features?: string[];
  faqs?: { q: string; a: string }[];
  is_coming_soon?: boolean;
  enrollment_email?: string | null;
};

export async function createProgramme(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get("title") as string)?.trim();
  const customSlug = (formData.get("slug") as string)?.trim();

  if (!title) return "Title is required.";

  const slug = customSlug ? slugify(customSlug) : slugify(title);
  if (!slug) return "Could not generate a valid slug.";

  const { data: existing } = await supabaseAdmin
    .from("programmes")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return `A programme with slug "${slug}" already exists.`;

  const { error } = await supabaseAdmin.from("programmes").insert({
    slug,
    title,
    short_title: "",
    tagline: "",
    badge: "Certificate Programme",
    is_new: false,
    category: "",
    duration: "",
    hours_per_week: "",
    price: 0,
    enrollment: "closed",
    cover_img: "",
    description: "",
    highlights: [],
    who_for: [],
    learnings: [],
    methodology: [],
    objectives_groups: [],
    syllabus: [],
    faculty: [],
    features: [],
    faqs: [],
  });

  if (error) return error.message;

  revalidatePath("/admin/quick-skills");
  redirect(`/admin/quick-skills/${slug}`);
}

export async function updateProgramme(
  slug: string,
  data: ProgrammeUpdateData
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("programmes")
    .update(data)
    .eq("slug", slug);

  if (error) return { error: error.message };

  revalidatePath(`/skill-training/${slug}`);
  revalidatePath("/skill-training");
  revalidatePath("/admin/quick-skills");
  return {};
}

export async function deleteProgramme(slug: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from("programmes").delete().eq("slug", slug);
  if (error) return { error: error.message };
  revalidatePath("/admin/quick-skills");
  revalidatePath("/skill-training");
  return {};
}

export async function uploadProgrammeCoverImage(
  slug: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `programme-${slug}-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("course-images")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabaseAdmin.storage.from("course-images").getPublicUrl(path);

  const { error: dbError } = await supabaseAdmin
    .from("programmes")
    .update({ cover_img: data.publicUrl })
    .eq("slug", slug);

  if (dbError) return { error: dbError.message };

  revalidatePath(`/skill-training/${slug}`);
  revalidatePath("/skill-training");

  return { url: data.publicUrl };
}
