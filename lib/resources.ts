import { supabaseService } from "@/lib/supabase/service";

export interface ResourceCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface ExamCategory {
  id: number;
  name: string;
  sort_order: number;
}

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  category_id: number | null;
  exam_category: string | null;
  file_path: string | null;
  pages: number | null;
  size_label: string | null;
  is_free: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  resource_categories: { name: string; slug: string } | null;
}

export async function getAllResourceCategories(): Promise<ResourceCategory[]> {
  const { data } = await supabaseService
    .from("resource_categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });
  return (data ?? []) as ResourceCategory[];
}

export async function getAllPublishedResources(): Promise<Resource[]> {
  const { data } = await supabaseService
    .from("resources")
    .select("*, resource_categories(name, slug)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Resource[];
}

export async function getAllResourcesAdmin(): Promise<Resource[]> {
  const { data } = await supabaseService
    .from("resources")
    .select("*, resource_categories(name, slug)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Resource[];
}

export async function getAllExamCategories(): Promise<ExamCategory[]> {
  const { data } = await supabaseService
    .from("exam_categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as ExamCategory[];
}
