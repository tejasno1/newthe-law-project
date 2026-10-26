import { supabaseService } from "@/lib/supabase/service";

export interface QuestionBankCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface QuestionBankFile {
  id: number;
  item_id: number;
  title: string;
  file_path: string;
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
  files: QuestionBankFile[];
}

const ITEM_SELECT = "*, files:question_bank_files(id, item_id, title, file_path, sort_order)";

function withSortedFiles(rows: unknown[] | null): QuestionBankItem[] {
  return ((rows ?? []) as QuestionBankItem[]).map((item) => ({
    ...item,
    files: [...(item.files ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
  }));
}

/**
 * IDs of paid question sets this user has bought. Question sets are sold
 * separately — courses and the All-Access Plan do not unlock them.
 */
export async function getQuestionBankAccess(userId: string): Promise<{ purchasedIds: number[] }> {
  const { data } = await supabaseService
    .from("question_bank_purchases")
    .select("item_id")
    .eq("user_id", userId);
  return {
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
    .select(ITEM_SELECT)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return withSortedFiles(data);
}

export async function getAllQuestionBankAdmin(): Promise<QuestionBankItem[]> {
  const { data } = await supabaseService
    .from("question_bank")
    .select(ITEM_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return withSortedFiles(data);
}
