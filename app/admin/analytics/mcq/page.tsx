import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ClipboardList, Users, TrendingUp, AlertTriangle, Clock, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

type AttemptRow = {
  test_slug: string;
  status: string;
  violation_count: number | null;
  score: number | null;
  correct: number | null;
  incorrect: number | null;
  unattempted: number | null;
  started_at: string;
  submitted_at: string | null;
};

type McqEventRow = {
  test_slug: string;
  event_type: string;
  session_id: string | null;
};

type TestStat = {
  slug: string;
  title: string;
  section: string;
  category: string;
  totalMarks: number;
  starts: number;
  completions: number;
  completionRate: number;
  autoTimerCount: number;
  violationCount: number;
  avgScore: number;
  avgAccuracy: number;
  avgCorrect: number;
  avgIncorrect: number;
  avgUnattempted: number;
  instructionViews: number;
  resultViews: number;
  reattempts: number;
};

function fmtNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function Bar({ pct, color = "bg-[#4d65ff]" }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default async function AdminMcqAnalyticsPage() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: attempts, error: attemptsErr }, { data: mcqEventsRaw, error: eventsErr }, { data: tests }] = await Promise.all([
    supabaseAdmin
      .from("test_attempts")
      .select("test_slug, status, violation_count, score, correct, incorrect, unattempted, started_at, submitted_at")
      .gte("started_at", since)
      .limit(50000),
    supabaseAdmin
      .from("mcq_events")
      .select("test_slug, event_type, session_id")
      .gte("created_at", since)
      .limit(50000),
    supabaseAdmin.from("mock_tests_catalog").select("slug, title, section, category, total_marks").order("id"),
  ]);

  const mcqEventsTableMissing = eventsErr?.code === "42P01" || eventsErr?.message?.includes("does not exist");

  if (attemptsErr?.code === "42P01" || attemptsErr?.message?.includes("does not exist")) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MCQ / Practice Test Analytics</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          The <code>test_attempts</code> table is missing. Run the security migration SQL first.
        </div>
      </div>
    );
  }

  const testMap = new Map((tests ?? []).map((t) => [t.slug, t]));

  // ── Aggregate test_attempts ──────────────────────────────────────────────
  const raw: Record<string, {
    starts: number;
    completions: number;
    autoTimer: number;
    autoViolation: number;
    scores: number[];
    accuracies: number[];
    corrects: number[];
    incorrects: number[];
    unattempteds: number[];
  }> = {};

  for (const a of (attempts ?? []) as AttemptRow[]) {
    const slug = a.test_slug;
    if (!raw[slug]) {
      raw[slug] = { starts: 0, completions: 0, autoTimer: 0, autoViolation: 0, scores: [], accuracies: [], corrects: [], incorrects: [], unattempteds: [] };
    }
    const s = raw[slug];
    s.starts++;
    if (a.status === "submitted") s.completions++;
    if (a.status === "auto_submitted_timer") { s.completions++; s.autoTimer++; }
    if (a.status === "auto_submitted_violations") { s.completions++; s.autoViolation++; }
    if (a.score != null) s.scores.push(Number(a.score));
    if (a.correct != null && a.incorrect != null) {
      const total = (a.correct ?? 0) + (a.incorrect ?? 0);
      const pct = total > 0 ? (a.correct / total) * 100 : 0;
      s.accuracies.push(pct);
      s.corrects.push(a.correct);
      s.incorrects.push(a.incorrect);
      if (a.unattempted != null) s.unattempteds.push(a.unattempted);
    }
  }

  // ── Aggregate mcq_events ─────────────────────────────────────────────────
  const eventsRaw: Record<string, { views: number; resultViews: number; reattempts: number; viewSessions: Set<string> }> = {};
  if (!mcqEventsTableMissing) {
    for (const ev of (mcqEventsRaw ?? []) as McqEventRow[]) {
      const slug = ev.test_slug;
      if (!eventsRaw[slug]) eventsRaw[slug] = { views: 0, resultViews: 0, reattempts: 0, viewSessions: new Set() };
      if (ev.event_type === "test_view") {
        eventsRaw[slug].views++;
        if (ev.session_id) eventsRaw[slug].viewSessions.add(ev.session_id);
      } else if (ev.event_type === "result_view") {
        eventsRaw[slug].resultViews++;
      } else if (ev.event_type === "test_reattempt") {
        eventsRaw[slug].reattempts++;
      }
    }
  }

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const stats: TestStat[] = Object.entries(raw)
    .map(([slug, s]) => {
      const meta = testMap.get(slug);
      const events = eventsRaw[slug] ?? { views: 0, resultViews: 0, reattempts: 0 };
      return {
        slug,
        title: meta?.title ?? slug,
        section: meta?.section ?? "",
        category: meta?.category ?? "",
        totalMarks: Number(meta?.total_marks ?? 0),
        starts: s.starts,
        completions: s.completions,
        completionRate: s.starts > 0 ? (s.completions / s.starts) * 100 : 0,
        autoTimerCount: s.autoTimer,
        violationCount: s.autoViolation,
        avgScore: avg(s.scores),
        avgAccuracy: avg(s.accuracies),
        avgCorrect: avg(s.corrects),
        avgIncorrect: avg(s.incorrects),
        avgUnattempted: avg(s.unattempteds),
        instructionViews: events.views,
        resultViews: events.resultViews,
        reattempts: events.reattempts,
      };
    })
    .sort((a, b) => b.starts - a.starts);

  const totalStarts = stats.reduce((s, t) => s + t.starts, 0);
  const totalCompletions = stats.reduce((s, t) => s + t.completions, 0);
  const totalViolations = stats.reduce((s, t) => s + t.violationCount, 0);
  const overallCompletionRate = totalStarts > 0 ? ((totalCompletions / totalStarts) * 100).toFixed(1) : "0";
  const allScores = (attempts ?? []).filter((a: AttemptRow) => a.score != null).map((a: AttemptRow) => Number(a.score));
  const globalAvgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MCQ / Practice Test Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 30 days · from test_attempts + mcq_events</p>
      </div>

      {mcqEventsTableMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          <p className="font-semibold mb-1">Optional setup: instruction page views</p>
          <p className="mb-3">To also track how many people VIEW test instructions (before starting), run this SQL:</p>
          <pre className="bg-white border border-amber-200 rounded-lg p-3 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE mcq_events (
  id BIGSERIAL PRIMARY KEY,
  test_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  session_id TEXT,
  value NUMERIC,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_me_slug ON mcq_events(test_slug);
CREATE INDEX idx_me_created ON mcq_events(created_at DESC);`}
          </pre>
        </div>
      )}

      {totalStarts === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          No attempt data yet. Data will appear once users start taking tests.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Starts", value: totalStarts.toLocaleString(), icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
          { label: "Completions", value: totalCompletions.toLocaleString(), icon: Users, color: "text-emerald-600 bg-emerald-50" },
          { label: "Completion Rate", value: `${overallCompletionRate}%`, icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
          { label: "Violations", value: totalViolations.toLocaleString(), icon: AlertTriangle, color: "text-rose-600 bg-rose-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon size={16} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-test table */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Per-Test Breakdown</h2>
          <p className="text-xs text-gray-400 mt-0.5">Completion = submitted + auto-submitted</p>
        </div>
        {stats.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 font-medium">Test</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-medium">Starts</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-medium">Comp.</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 font-medium">Avg Score</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 font-medium">Accuracy</th>
                  <th className="hidden md:table-cell text-right px-4 py-3 font-medium">Violations</th>
                  {!mcqEventsTableMissing && <th className="hidden md:table-cell text-right px-6 py-3 font-medium">Instr. Views</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.map((t) => (
                  <tr key={t.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="font-medium text-gray-900 truncate max-w-[130px] sm:max-w-[200px] text-sm">{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.section && <span className="text-xs text-[#4d65ff] font-medium">{t.section}</span>}
                        {t.category && <span className="hidden sm:inline text-xs text-gray-400">{t.category}</span>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-medium text-gray-800 text-sm">{t.starts}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-sm">
                      <span className={`font-semibold ${t.completionRate >= 70 ? "text-emerald-600" : t.completionRate >= 40 ? "text-amber-600" : "text-gray-500"}`}>
                        {t.completionRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-right text-gray-600 text-sm">
                      {t.avgScore > 0 ? `${fmtNum(t.avgScore)}${t.totalMarks > 0 ? `/${t.totalMarks}` : ""}` : "—"}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-right text-sm">
                      {t.avgAccuracy > 0 ? (
                        <span className={`font-semibold ${t.avgAccuracy >= 70 ? "text-emerald-600" : t.avgAccuracy >= 40 ? "text-amber-600" : "text-rose-500"}`}>
                          {t.avgAccuracy.toFixed(0)}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-right text-sm">
                      {t.violationCount > 0 ? (
                        <span className="text-rose-600 font-semibold">{t.violationCount}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    {!mcqEventsTableMissing && (
                      <td className="hidden md:table-cell px-6 py-4 text-right text-gray-600 text-sm">{t.instructionViews || "—"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Insights grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top tests by starts */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">🏆 Most Attempted Tests</h2>
          {stats.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.slice(0, 5).map((t, i) => (
                <div key={t.slug} className="flex items-center gap-3 py-2">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    {t.section && <p className="text-xs text-gray-400">{t.section}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{t.starts}</p>
                    <p className="text-xs text-gray-400">starts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Highest avg accuracy */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            <Trophy className="inline w-4 h-4 mr-1 text-amber-500" />Highest Avg. Accuracy
          </h2>
          {stats.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {[...stats].filter(t => t.avgAccuracy > 0).sort((a, b) => b.avgAccuracy - a.avgAccuracy).slice(0, 5).map((t, i) => (
                <div key={t.slug} className="flex items-center gap-3 py-2">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <Bar pct={t.avgAccuracy} color={t.avgAccuracy >= 70 ? "bg-emerald-500" : t.avgAccuracy >= 40 ? "bg-amber-400" : "bg-rose-400"} />
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${t.avgAccuracy >= 70 ? "text-emerald-600" : t.avgAccuracy >= 40 ? "text-amber-600" : "text-rose-500"}`}>
                    {t.avgAccuracy.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completion rate */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            <Clock className="inline w-4 h-4 mr-1 text-gray-400" />Completion Rates
          </h2>
          {stats.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Test</span>
                <span>Completed / Started</span>
              </div>
              {stats.slice(0, 6).map((t) => (
                <div key={t.slug}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate max-w-[180px]">{t.title}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{t.completions}/{t.starts}</span>
                  </div>
                  <Bar pct={t.completionRate} color={t.completionRate >= 70 ? "bg-emerald-500" : t.completionRate >= 40 ? "bg-amber-400" : "bg-rose-400"} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Violations / discipline */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            <AlertTriangle className="inline w-4 h-4 mr-1 text-rose-500" />Proctoring Summary
          </h2>
          <p className="text-xs text-gray-400 mb-5">Auto-submitted due to violations = tab switches exceeding limit</p>
          {totalStarts === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Voluntarily Submitted", value: stats.reduce((s, t) => s + (t.completions - t.autoTimerCount - t.violationCount), 0), color: "text-emerald-600" },
                  { label: "Auto (Timer)", value: stats.reduce((s, t) => s + t.autoTimerCount, 0), color: "text-amber-600" },
                  { label: "Auto (Violations)", value: stats.reduce((s, t) => s + t.violationCount, 0), color: "text-rose-600" },
                  { label: "In Progress / Abandoned", value: totalStarts - totalCompletions, color: "text-gray-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
              {!mcqEventsTableMissing && stats.filter(t => t.reattempts > 0).length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Reattempt Clicks</p>
                  {stats.filter(t => t.reattempts > 0).sort((a, b) => b.reattempts - a.reattempts).slice(0, 3).map((t) => (
                    <div key={t.slug} className="flex justify-between py-1.5">
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">{t.title}</span>
                      <span className="text-sm font-semibold text-[#4d65ff]">{t.reattempts}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Global avg score callout */}
      {allScores.length > 0 && (
        <div className="bg-gradient-to-r from-[#4d65ff]/10 to-violet-50 border border-[#4d65ff]/20 rounded-2xl p-6 flex items-center gap-6">
          <div className="text-center flex-shrink-0">
            <p className="text-4xl font-bold text-[#4d65ff]">{globalAvgScore}</p>
            <p className="text-xs text-gray-500 mt-1">Global avg. score (30 days)</p>
          </div>
          <div className="text-sm text-gray-600">
            Based on <strong className="text-gray-800">{allScores.length.toLocaleString()}</strong> completed attempts across <strong className="text-gray-800">{stats.length}</strong> test{stats.length !== 1 ? "s" : ""}.
          </div>
        </div>
      )}
    </div>
  );
}
