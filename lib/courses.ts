import { supabase } from "@/lib/supabaseClient";

export interface CourseModuleItem {
  title: string;
  duration?: string;
  content_type?: "video" | "reading";
  video_url?: string;
}

export interface CourseModule {
  title: string;
  description?: string;
  lessonsCount?: number;
  moduleDuration?: string;
  items: CourseModuleItem[];
}

export interface Review {
  name: string;
  role: string;
  text: string;
  rating: number;
  img: string;
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface Course {
  slug: string;
  category: string;
  title: string;
  desc: string;
  longDesc: string;
  duration: string;
  lessons: string;
  level: string;
  language: string;
  files: string;
  lastUpdate: string;
  rating: string;
  reviewsCount: string;
  students: string;
  price: string;
  oldPrice: string;
  img: string;
  modules: CourseModule[];
  reviews: Review[];
  idealFor: string[];
  outcomes: string[];
  faqs: CourseFAQ[];
  accessType: "free" | "tlp_plus" | "one_time_purchase" | null;
  deliveryType: "online" | "recorded" | null;
}

interface RawModuleItem {
  title: string;
  duration?: string;
  content_type?: "video" | "reading";
  video_url?: string;
}

interface RawModule {
  title: string;
  description?: string;
  items?: Array<string | RawModuleItem>;
  lectures?: number;
  lessons_count?: number;
  module_duration?: string;
}

interface RawReview {
  name: string;
  role?: string;
  text: string;
  rating?: number;
  img?: string;
}

interface CourseRow {
  slug: string;
  category: string;
  title: string;
  desc: string;
  long_desc: string;
  duration: string;
  lessons: string | number;
  level: string;
  language: string;
  files: string | number;
  last_update: string;
  updated_at?: string;
  rating: string | number;
  reviews_count: string | number;
  students: string | number;
  price: string | number;
  old_price: string | number;
  img: string;
  modules: RawModule[] | null;
  reviews: RawReview[] | null;
  ideal_for: string[] | null;
  outcomes: string[] | null;
  faqs: Array<{ question: string; answer: string }> | null;
  access_type: string | null;
  delivery_type: string | null;
}

const withSuffix = (value: string | number, suffix: string) =>
  typeof value === "number" ? `${value} ${suffix}` : String(value);

const mapModule = (m: RawModule): CourseModule => {
  const lectureCount = m.lessons_count ?? m.lectures;
  const rawItems = m.items ?? (lectureCount !== undefined ? [`${lectureCount} lecture${lectureCount === 1 ? "" : "s"} in this module`] : []);
  return {
    title: m.title,
    description: m.description,
    lessonsCount: lectureCount,
    moduleDuration: m.module_duration,
    items: rawItems.map((item) =>
      typeof item === "string"
        ? { title: item }
        : { title: item.title, duration: item.duration, content_type: item.content_type, video_url: item.video_url }
    ),
  };
};

const mapReview = (r: RawReview): Review => ({
  name: r.name,
  role: r.role ?? "Verified Student",
  text: r.text,
  rating: r.rating ?? 5,
  img: r.img ?? `https://picsum.photos/seed/${encodeURIComponent(r.name)}/64/64`,
});

const mapRow = (row: CourseRow): Course => ({
  slug: row.slug,
  category: row.category,
  title: row.title,
  desc: row.desc,
  longDesc: row.long_desc,
  duration: row.duration,
  lessons: withSuffix(row.lessons, "Lessons"),
  level: row.level,
  language: row.language,
  files: withSuffix(row.files, "files"),
  lastUpdate: row.updated_at
    ? new Date(row.updated_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : row.last_update,
  rating: typeof row.rating === "number" ? row.rating.toFixed(1) : String(row.rating),
  reviewsCount: withSuffix(row.reviews_count, "reviews"),
  students: String(row.students),
  price: typeof row.price === "number" ? row.price.toFixed(2) : String(row.price),
  oldPrice: typeof row.old_price === "number" ? row.old_price.toFixed(2) : String(row.old_price),
  img: row.img,
  modules: (row.modules ?? []).map(mapModule),
  reviews: (row.reviews ?? []).map(mapReview),
  idealFor: row.ideal_for ?? [],
  outcomes: row.outcomes ?? [],
  faqs: row.faqs ?? [],
  accessType: (row.access_type as "free" | "tlp_plus" | "one_time_purchase" | null) ?? null,
  deliveryType: (row.delivery_type as "online" | "recorded" | null) ?? null,
});

export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from("courses").select("*").order("id", { ascending: true });

  if (error) {
    console.error("Failed to load courses from Supabase:", error.message);
    return [];
  }

  return (data as CourseRow[]).map(mapRow);
}

export async function getCourseSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("courses").select("slug");

  if (error) {
    console.error("Failed to load course slugs from Supabase:", error.message);
    return [];
  }

  return (data as { slug: string }[]).map((row) => row.slug);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    console.error("Failed to load course from Supabase:", error.message);
    return null;
  }

  if (!data) return null;

  return mapRow(data as CourseRow);
}
