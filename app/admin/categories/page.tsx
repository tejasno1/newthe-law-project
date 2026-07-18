import { getAllCategories } from "@/lib/categories";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await getAllCategories();
  return <CategoriesClient categories={categories} />;
}
