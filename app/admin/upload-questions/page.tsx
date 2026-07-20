import { supabaseAdmin } from "@/lib/supabaseAdmin";
import UploadQuestionsClient from "./UploadQuestionsClient";

export const dynamic = "force-dynamic";

export default async function UploadQuestionsPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const { data } = await supabaseAdmin
    .from("mock_tests")
    .select("slug, title")
    .order("id", { ascending: true });

  const tests = (data ?? []) as { slug: string; title: string }[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Upload Questions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload an Excel (.xlsx) file to append questions to a mock test.
        </p>
      </div>
      <UploadQuestionsClient tests={tests} preselectedSlug={searchParams.slug} />
    </div>
  );
}
