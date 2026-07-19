import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Trophy, CheckCircle2, Clock, BarChart3, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard");

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Student";

  // Fetch all three data sources in parallel
  const [enrollmentsRes, attemptsRes, progressRes] = await Promise.all([
    supabaseService
      .from("enrollments")
      .select("course_slug, enrolled_at, payment_status")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false }),

    supabaseService
      .from("test_attempts")
      .select("id, test_slug, score, correct, incorrect, unattempted, status, submitted_at")
      .eq("user_id", user.id)
      .neq("status", "in_progress")
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(10),

    supabaseService
      .from("lesson_progress")
      .select("course_slug, module_index, lesson_index, completed_at")
      .eq("user_id", user.id),
  ]);

  const enrollments = enrollmentsRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const progress = progressRes.data ?? [];

  // Group progress by course
  const progressByCourse: Record<string, number> = {};
  for (const p of progress) {
    progressByCourse[p.course_slug] = (progressByCourse[p.course_slug] ?? 0) + 1;
  }

  // Fetch course titles from DB
  const courseSlugs = [...new Set(enrollments.map(e => e.course_slug))];
  const courseMap: Record<string, string> = {};
  if (courseSlugs.length) {
    const { data: courses } = await supabaseService
      .from("courses")
      .select("slug, title")
      .in("slug", courseSlugs);
    for (const c of courses ?? []) courseMap[c.slug] = c.title;
  }

  // Fetch test titles
  const testSlugs = [...new Set(attempts.map(a => a.test_slug))];
  const testMap: Record<string, string> = {};
  if (testSlugs.length) {
    const { data: tests } = await supabaseService
      .from("mock_tests")
      .select("slug, title")
      .in("slug", testSlugs);
    for (const t of tests ?? []) testMap[t.slug] = t.title;
  }

  const bestScore = attempts.length
    ? Math.max(...attempts.map(a => a.score ?? 0))
    : null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "Enrolled Courses", value: enrollments.length, color: "text-primary-600 bg-primary-50 dark:bg-primary-900/20" },
            { icon: CheckCircle2, label: "Lessons Completed", value: progress.length, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
            { icon: Trophy, label: "Tests Attempted", value: attempts.length, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
            { icon: BarChart3, label: "Best Score", value: bestScore !== null ? `${bestScore}` : "—", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Enrolled Courses */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-600" /> My Courses
              </h2>
              <Link href="/course" className="text-xs text-primary-600 hover:underline">Browse more</Link>
            </div>
            {enrollments.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-gray-400">No courses enrolled yet.</p>
                <Link href="/course" className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
                  Browse courses <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                {enrollments.map(e => {
                  const done = progressByCourse[e.course_slug] ?? 0;
                  return (
                    <li key={e.course_slug}>
                      <Link href={`/course/${e.course_slug}/learn`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                            {courseMap[e.course_slug] ?? e.course_slug}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(done * 10, 100)}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{done} lessons</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          e.payment_status === "paid"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {e.payment_status === "paid" ? "Paid" : "Free"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Test History */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Test Results
              </h2>
              <Link href="/mock-test" className="text-xs text-primary-600 hover:underline">Take a test</Link>
            </div>
            {attempts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-gray-400">No tests taken yet.</p>
                <Link href="/mock-test" className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
                  Browse tests <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                {attempts.map(a => (
                  <li key={a.id}>
                    <Link href={`/mock-test/${a.test_slug}/report/${a.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                          {testMap[a.test_slug] ?? a.test_slug}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{a.score ?? 0}</p>
                        <p className="text-[10px] text-gray-400">
                          <span className="text-emerald-600">{a.correct ?? 0}✓</span>
                          {" "}<span className="text-red-500">{a.incorrect ?? 0}✗</span>
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
