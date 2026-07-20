import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Plus, ClipboardList, Pencil, Lock, Unlock } from "lucide-react";

interface TestRow {
  slug: string;
  title: string;
  section: string;
  category: string | null;
  difficulty: string;
  total_questions: number | string;
  duration_minutes: number | string;
  is_free: boolean | null;
  price: number | string | null;
}

export const dynamic = "force-dynamic";

export default async function MockTestsAdminPage() {
  const { data, error } = await supabaseAdmin
    .from("mock_tests")
    .select("slug, title, section, category, difficulty, total_questions, duration_minutes, is_free, price")
    .order("id", { ascending: true });

  const tests = (data ?? []) as TestRow[];

  const diffColor = (d: string) => {
    if (d?.toUpperCase() === "EASY") return "bg-green-50 text-green-700";
    if (d?.toUpperCase() === "HARD") return "bg-red-50 text-red-700";
    return "bg-yellow-50 text-yellow-700";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mock Tests</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tests.length} test{tests.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/mock-tests/new"
          className="inline-flex items-center gap-2 bg-[#4d65ff] hover:bg-[#3a52e8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> New Test
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          Failed to load tests: {error.message}
        </div>
      )}

      {tests.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl px-8 py-14 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No mock tests yet</h3>
          <p className="text-sm text-gray-400 mb-5">Create your first test to get started.</p>
          <Link
            href="/admin/mock-tests/new"
            className="inline-flex items-center gap-2 bg-[#4d65ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#3a52e8] transition-colors"
          >
            <Plus size={15} /> New Test
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-semibold text-gray-600 px-5 py-3">Test</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3 hidden sm:table-cell">Section</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3 hidden md:table-cell">Difficulty</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3 hidden lg:table-cell">Questions</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3 hidden lg:table-cell">Access</th>
                <th className="text-right font-semibold text-gray-600 px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tests.map((test) => (
                <tr key={test.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 leading-tight">{test.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{test.slug}</p>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell text-gray-600">{test.section || "—"}</td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${diffColor(test.difficulty)}`}>
                      {test.difficulty || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-gray-600">
                    {Number(test.total_questions)} · {Number(test.duration_minutes)} min
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    {test.is_free ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                        <Unlock size={10} /> Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md">
                        <Lock size={10} /> ₹{Number(test.price ?? 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/mock-tests/${test.slug}`}
                      className="inline-flex items-center gap-1.5 text-[#4d65ff] hover:text-[#3a52e8] font-medium text-xs"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
