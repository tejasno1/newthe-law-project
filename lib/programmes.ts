import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Programme {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  badge: string;
  isNew: boolean;
  category: string;
  duration: string;
  hoursPerWeek: string;
  price: string;
  enrollment: "open" | "closed";
  coverImg: string;
  description: string;
  highlights: string[];
  whoFor: { label: string; desc: string }[];
  learnings: string[];
  methodology: { title: string; desc: string }[];
  objectivesGroups: { title: string; items: string[] }[];
  syllabus: { title: string; items: string[] }[];
  faculty: { name: string; role: string; bio: string; img: string }[];
  features: string[];
  faqs: { q: string; a: string }[];
}

export interface ProgrammeRow {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  tagline: string;
  badge: string;
  is_new: boolean | null;
  category: string;
  duration: string;
  hours_per_week: string;
  price: number | null;
  enrollment: string | null;
  cover_img: string | null;
  description: string | null;
  highlights: string[] | null;
  who_for: { label: string; desc: string }[] | null;
  learnings: string[] | null;
  methodology: { title: string; desc: string }[] | null;
  objectives_groups: { title: string; items: string[] }[] | null;
  syllabus: { title: string; items: string[] }[] | null;
  faculty: { name: string; role: string; bio: string; img: string }[] | null;
  features: string[] | null;
  faqs: { q: string; a: string }[] | null;
  is_coming_soon: boolean | null;
  enrollment_email: string | null;
}

export function mapProgrammeRow(row: ProgrammeRow): Programme {
  const priceNum = Number(row.price ?? 0);
  return {
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title,
    tagline: row.tagline,
    badge: row.badge,
    isNew: row.is_new ?? false,
    category: row.category,
    duration: row.duration,
    hoursPerWeek: row.hours_per_week,
    price: priceNum > 0 ? `₹${priceNum.toLocaleString("en-IN")}` : "₹0",
    enrollment: row.enrollment === "open" ? "open" : "closed",
    coverImg: row.cover_img ?? "",
    description: row.description ?? "",
    highlights: row.highlights ?? [],
    whoFor: row.who_for ?? [],
    learnings: row.learnings ?? [],
    methodology: row.methodology ?? [],
    objectivesGroups: row.objectives_groups ?? [],
    syllabus: row.syllabus ?? [],
    faculty: row.faculty ?? [],
    features: row.features ?? [],
    faqs: row.faqs ?? [],
  };
}

export async function getAllProgrammes(): Promise<Programme[]> {
  const { data, error } = await supabaseAdmin
    .from("programmes")
    .select("*")
    .order("id", { ascending: true });

  if (error) { console.error("Failed to load programmes:", error.message); return []; }
  return (data as ProgrammeRow[]).map(mapProgrammeRow);
}

export async function getProgramme(slug: string): Promise<Programme | null> {
  const { data, error } = await supabaseAdmin
    .from("programmes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapProgrammeRow(data as ProgrammeRow);
}
