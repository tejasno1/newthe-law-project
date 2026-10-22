import { getAllQuestionBankAdmin, getAllQuestionBankCategories } from "@/lib/questionBank";
import { getAllExamCategories } from "@/lib/resources";
import QuestionBankAdminClient from "./QuestionBankAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminQuestionBankPage() {
  const [items, categories, examCategories] = await Promise.all([
    getAllQuestionBankAdmin(),
    getAllQuestionBankCategories(),
    getAllExamCategories(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload and manage MCQ question sets for the Question Bank page.</p>
      </div>
      <QuestionBankAdminClient items={items} categories={categories} examCategories={examCategories} />
    </div>
  );
}
