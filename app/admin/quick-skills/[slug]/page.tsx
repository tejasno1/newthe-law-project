import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProgrammeEditForm from "./ProgrammeEditForm";

export const dynamic = "force-dynamic";

export default async function AdminProgrammeEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: programme, error } = await supabaseAdmin
    .from("programmes")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !programme) notFound();

  return (
    <div>
      <Link
        href="/admin/quick-skills"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={15} />
        Back to QuickSkills
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Programme</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-mono">{programme.slug}</p>
      </div>

      <ProgrammeEditForm programme={programme} />
    </div>
  );
}
