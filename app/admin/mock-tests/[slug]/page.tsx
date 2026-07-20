import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import MockTestEditForm from "./MockTestEditForm";

export const dynamic = "force-dynamic";

export default async function MockTestAdminPage({ params }: { params: { slug: string } }) {
  const [{ data, error }, { count }] = await Promise.all([
    supabaseAdmin.from("mock_tests").select("*").eq("slug", params.slug).maybeSingle(),
    supabaseAdmin
      .from("mock_test_questions")
      .select("*", { count: "exact", head: true })
      .eq("test_slug", params.slug),
  ]);

  if (error || !data) notFound();

  return <MockTestEditForm test={data} questionCount={count ?? 0} />;
}
