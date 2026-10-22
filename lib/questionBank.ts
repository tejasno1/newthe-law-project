import { supabaseService } from "@/lib/supabase/service";
import { PASS_SLUG } from "@/lib/fulfillment";

export interface QuestionBankCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface QuestionBankItem {
  id: number;
  title: string;
  description: string | null;
  subject: string | null;
  exam_category: string | null;
  file_path: string | null;
  is_free: boolean;
  price: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

/** IDs of paid question sets this user may open, and whether they hold the All-Access pass. */
export async function getQuestionBankAccess(userId: string): Promise<{ hasPass: boolean; purchasedIds: number[] }> {
  const [{ count }, { data }] = await Promise.all([
    supabaseService
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("course_slug", PASS_SLUG)
      .eq("payment_status", "paid"),
    supabaseService
      .from("question_bank_purchases")
      .select("item_id")
      .eq("user_id", userId),
  ]);
  return {
    hasPass: (count ?? 0) > 0,
    purchasedIds: (data ?? []).map((r: { item_id: number }) => Number(r.item_id)),
  };
}

export async function getAllQuestionBankCategories(): Promise<QuestionBankCategory[]> {
  const { data } = await supabaseService
    .from("question_bank_categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as QuestionBankCategory[];
}

export async function getAllPublishedQuestionBankItems(): Promise<QuestionBankItem[]> {
  const { data } = await supabaseService
    .from("question_bank")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as QuestionBankItem[];
}

export async function getAllQuestionBankAdmin(): Promise<QuestionBankItem[]> {
  const { data } = await supabaseService
    .from("question_bank")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as QuestionBankItem[];
}
