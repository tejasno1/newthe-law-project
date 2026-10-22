import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import ProgrammeStatusToggle from "./ProgrammeStatusToggle";
import ProgrammeDeleteButton from "./ProgrammeDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminQuickSkillsPage() {
  const { data: programmes } = await supabaseAdmin
    .from("programmes")
    .select("slug, title, category, enrollment, price, is_new, is_coming_soon")
    .order("id", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QuickSkills</h1>
          <p className="text-sm text-gray-500 mt-0.5">{programmes?.length ?? 0} programme{programmes?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/quick-skills/new"
          className="inline-flex items-center gap-1.5 bg-[#4d65ff] hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Zap size={15} /> New Programme
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {!programmes || programmes.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No programmes yet.{" "}
            <Link href="/admin/quick-skills/new" className="text-[#4d65ff] hover:underline">Create one</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Programme</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Enrollment</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {(programmes as { slug: string; title: string; category: string; enrollment: string; price: number; is_new: boolean; is_coming_soon: boolean | null }[]).map((p) => (
                <tr key={p.slug} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 line-clamp-1">{p.title}</span>
                      {p.is_new && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">New</span>}
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{p.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{p.category || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.enrollment === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {p.enrollment === "open" ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">
                    {p.price > 0 ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Free"}
                  </td>
                  <td className="px-5 py-3.5">
                    <ProgrammeStatusToggle slug={p.slug} initialValue={p.is_coming_soon ?? false} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ProgrammeDeleteButton slug={p.slug} title={p.title} />
                      <Link
                        href={`/admin/quick-skills/${p.slug}`}
                        className="inline-flex items-center gap-1 text-[#4d65ff] text-xs font-semibold hover:underline"
                      >
                        Edit <ChevronRight size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
