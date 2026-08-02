import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import MockTestEditForm from "./MockTestEditForm";

export const dynamic = "force-dynamic";

export default async function MockTestAdminPage({ params }: { params: { slug: string } }) {
  const [{ data, error }, { count }, { data: passagesData }] = await Promise.all([
    supabaseAdmin.from("mock_tests").select("*").eq("slug", params.slug).maybeSingle(),
    supabaseAdmin
      .from("mock_test_questions")
      .select("*", { count: "exact", head: true })
      .eq("test_slug", params.slug),
    supabaseAdmin
      .from("passages")
      .select("id, passage_number, title, text, source")
      .eq("test_slug", params.slug)
      .order("passage_number", { ascending: true }),
  ]);

  if (error || !data) notFound();

  return (
    <MockTestEditForm
      test={data}
      questionCount={count ?? 0}
      passages={(passagesData ?? []) as { id: number; passage_number: number; title: string | null; text: string; source: string | null }[]}
    />
  );
}
