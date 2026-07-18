import { supabaseAdmin } from "./supabaseAdmin";

export interface Category {
  id: number;
  name: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id, name, icon_name, sort_order, is_active")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getActiveCategories(): Promise<Pick<Category, "name" | "icon_name">[]> {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("name, icon_name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
