import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeroBanner from "@/components/PageHeroBanner";
import ResourcesCatalog from "./ResourcesCatalog";
import { getAllPublishedResources, getAllResourceCategories, getAllExamCategories } from "@/lib/resources";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [resources, categories, examCategories] = await Promise.all([
    getAllPublishedResources(),
    getAllResourceCategories(),
    getAllExamCategories(),
  ]);

  // Get current user for watermark (null if not logged in)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name ?? user?.email ?? "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <PageHeroBanner
        title="Legal Resources"
        subtitle="Free notes, bare acts, MCQ PDFs and case summaries — everything you need to ace your law exams, in one place."
        variant="resources"
      />
      <ResourcesCatalog
        resources={resources}
        categories={categories}
        examCategories={examCategories}
        candidateName={userName}
        isLoggedIn={!!user}
      />
      <Footer />
    </div>
  );
}
