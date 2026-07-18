"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function moveCategoryOrder(id: number, direction: "up" | "down") {
  const { data: all } = await supabaseAdmin
    .from("categories")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (!all) return;

  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];

  await supabaseAdmin.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabaseAdmin.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id);

  revalidatePath("/admin/categories");
  revalidatePath("/course");
}

export async function toggleCategoryActive(id: number, current: boolean) {
  await supabaseAdmin
    .from("categories")
    .update({ is_active: !current })
    .eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/course");
}

export async function createCategory(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get("name") as string)?.trim();
  const icon_name = (formData.get("icon_name") as string)?.trim() || "BookOpen";

  if (!name) return "Category name is required.";

  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("id")
    .ilike("name", name)
    .maybeSingle();
  if (existing) return `A category named "${name}" already exists.`;

  const { data: maxRow } = await supabaseAdmin
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { error } = await supabaseAdmin
    .from("categories")
    .insert({ name, icon_name, sort_order, is_active: true });

  if (error) return error.message;

  revalidatePath("/admin/categories");
  revalidatePath("/course");
  return null;
}

export async function deleteCategory(id: number) {
  await supabaseAdmin.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/course");
}
