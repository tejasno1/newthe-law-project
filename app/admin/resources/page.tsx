import { getAllResourcesAdmin, getAllResourceCategories } from "@/lib/resources";
import ResourcesAdminClient from "./ResourcesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const [resources, categories] = await Promise.all([
    getAllResourcesAdmin(),
    getAllResourceCategories(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upload PDFs and manage categories. Toggle Published to show on the public page.
        </p>
      </div>
      <ResourcesAdminClient resources={resources} categories={categories} />
    </>
  );
}
