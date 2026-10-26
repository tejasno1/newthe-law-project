import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeroBanner from "@/components/PageHeroBanner";
import QuestionBankCatalog from "./QuestionBankCatalog";
import { getAllPublishedQuestionBankItems, getAllQuestionBankCategories, getQuestionBankAccess } from "@/lib/questionBank";
import { getAllExamCategories } from "@/lib/resources";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function QuestionBankPage() {
  const [items, categories, examCategories] = await Promise.all([
    getAllPublishedQuestionBankItems(),
    getAllQuestionBankCategories(),
    getAllExamCategories(),
  ]);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name ?? user?.email ?? "";
  const access = user ? await getQuestionBankAccess(user.id) : { purchasedIds: [] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <PageHeroBanner
        title="Question Bank"
        subtitle="Thousands of exam-relevant MCQs across all law subjects — crafted by practising lawyers, not textbook rewrites."
        variant="question-bank"
      />
      <QuestionBankCatalog
        items={items}
        categories={categories}
        examCategories={examCategories}
        candidateName={userName}
        isLoggedIn={!!user}
        purchasedIds={access.purchasedIds}
        userEmail={user?.email ?? ""}
      />
      <Footer />
    </div>
  );
}
