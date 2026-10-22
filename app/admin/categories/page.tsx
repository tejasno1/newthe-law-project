import { getAllCategories } from "@/lib/categories";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const [categories, coursesRes] = await Promise.all([
    getAllCategories(),
    supabaseAdmin.from("courses").select("category"),
  ]);

  const managedNames = new Set(categories.map((c) => c.name));
  const unmanaged = Array.from(
    new Set(
      (coursesRes.data ?? [])
        .map((r: { category: string | null }) => r.category)
        .filter((c): c is string => c !== null && c !== "")
        .filter((c) => !managedNames.has(c))
    )
  ).sort();

  return <CategoriesClient categories={categories} unmanagedCategories={unmanaged} />;
}
