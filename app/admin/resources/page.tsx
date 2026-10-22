import { getAllResourcesAdmin, getAllResourceCategories, getAllExamCategories } from "@/lib/resources";
import ResourcesAdminClient from "./ResourcesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const [resources, categories, examCategories] = await Promise.all([
    getAllResourcesAdmin(),
    getAllResourceCategories(),
    getAllExamCategories(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upload PDFs and manage categories. Toggle Published to show on the public page.
        </p>
      </div>
      <ResourcesAdminClient resources={resources} categories={categories} examCategories={examCategories} />
    </>
  );
}
