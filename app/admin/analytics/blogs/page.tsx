import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Eye, Users, Clock, Globe, Smartphone, Monitor } from "lucide-react";

export const dynamic = "force-dynamic";

type EventRow = {
  blog_slug: string;
  event_type: string;
  session_id: string | null;
  value: number | null;
  referrer: string | null;
  device_type: string | null;
};

type BlogStat = {
  slug: string;
  title: string;
  category: string;
  author: string;
  views: number;
  uniqueReaders: number;
  avgReadSec: number;
  pctReadFully: number;
};

function fmtTime(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function getReferrerDomain(url: string | null): string {
  if (!url) return "Direct / Unknown";
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Direct";
  } catch {
    return url.slice(0, 40);
  }
}

function Bar({ pct, color = "bg-[#4d65ff]" }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default async function AdminBlogAnalyticsPage() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: events, error }, { data: blogs }] = await Promise.all([
    supabaseAdmin
      .from("blog_events")
      .select("blog_slug, event_type, session_id, value, referrer, device_type")
      .gte("created_at", since)
      .limit(50000),
    supabaseAdmin.from("blogs").select("slug, title, category, author").order("id"),
  ]);

  if (error?.message?.includes("does not exist") || error?.code === "42P01") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Blog Analytics</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="font-semibold text-amber-800 mb-2">One-time setup required</p>
          <p className="text-sm text-amber-700 mb-4">
            Run this SQL in your Supabase dashboard (SQL Editor):
          </p>
          <pre className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE blog_events (
  id BIGSERIAL PRIMARY KEY,
  blog_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  session_id TEXT,
  value NUMERIC,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_be_slug ON blog_events(blog_slug);
CREATE INDEX idx_be_type ON blog_events(event_type);
CREATE INDEX idx_be_created ON blog_events(created_at DESC);`}
          </pre>
          <p className="text-xs text-amber-600 mt-3">After running this, refresh the page. Data will collect automatically as readers visit your blog posts.</p>
        </div>
      </div>
    );
  }

  const blogMap = new Map((blogs ?? []).map((b) => [b.slug, b]));

  const raw: Record<string, {
    views: number;
    sessions: Set<string>;
    times: number[];
    fullScrollSessions: Set<string>;
    devices: Record<string, number>;
    referrers: string[];
  }> = {};

  const globalDevices: Record<string, number> = {};
  const globalReferrers: Record<string, number> = {};

  for (const ev of (events ?? []) as EventRow[]) {
    const slug = ev.blog_slug;
    if (!raw[slug]) {
      raw[slug] = { views: 0, sessions: new Set(), times: [], fullScrollSessions: new Set(), devices: {}, referrers: [] };
    }
    const s = raw[slug];

    if (ev.event_type === "page_view") {
      s.views++;
      if (ev.session_id) s.sessions.add(ev.session_id);
      const domain = getReferrerDomain(ev.referrer);
      globalReferrers[domain] = (globalReferrers[domain] ?? 0) + 1;
      if (ev.device_type) {
        s.devices[ev.device_type] = (s.devices[ev.device_type] ?? 0) + 1;
        globalDevices[ev.device_type] = (globalDevices[ev.device_type] ?? 0) + 1;
      }
    } else if (ev.event_type === "time_spent" && ev.value != null) {
      s.times.push(Number(ev.value));
    } else if (ev.event_type === "scroll_depth" && Number(ev.value) >= 100 && ev.session_id) {
      s.fullScrollSessions.add(ev.session_id);
    }
  }

  const stats: BlogStat[] = Object.entries(raw)
    .map(([slug, s]) => {
      const avgRead = s.times.length ? Math.round(s.times.reduce((a, b) => a + b, 0) / s.times.length) : 0;
      const pctFull = s.sessions.size > 0 ? (s.fullScrollSessions.size / s.sessions.size) * 100 : 0;
      const blog = blogMap.get(slug);
      return {
        slug,
        title: blog?.title ?? slug,
        category: blog?.category ?? "",
        author: blog?.author ?? "",
        views: s.views,
        uniqueReaders: s.sessions.size,
        avgReadSec: avgRead,
        pctReadFully: pctFull,
      };
    })
    .sort((a, b) => b.views - a.views);

  const totalViews = stats.reduce((s, b) => s + b.views, 0);
  const totalUnique = stats.reduce((s, b) => s + b.uniqueReaders, 0);
  const totalDevices = Object.values(globalDevices).reduce((a, b) => a + b, 0);
  const topReferrers = Object.entries(globalReferrers).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const avgEngagementTime = stats.filter(b => b.avgReadSec > 0).length
    ? Math.round(stats.filter(b => b.avgReadSec > 0).reduce((s, b) => s + b.avgReadSec, 0) / stats.filter(b => b.avgReadSec > 0).length)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blog Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 30 days</p>
      </div>

      {totalViews === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          No data yet — analytics will appear here as soon as readers visit your blog posts.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Blog Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-600 bg-blue-50" },
          { label: "Unique Readers", value: totalUnique.toLocaleString(), icon: Users, color: "text-violet-600 bg-violet-50" },
          { label: "Posts Tracked", value: stats.length.toString(), icon: Eye, color: "text-emerald-600 bg-emerald-50" },
          { label: "Avg. Read Time", value: avgEngagementTime > 0 ? fmtTime(avgEngagementTime) : "—", icon: Clock, color: "text-orange-600 bg-orange-50" },
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

      {/* Per-post table */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Per-Post Breakdown</h2>
        </div>
        {stats.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 font-medium">Post</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-medium">Views</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 font-medium">Unique</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 font-medium">Avg. Read Time</th>
                  <th className="text-right px-3 sm:px-6 py-3 font-medium">Read %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.map((b) => (
                  <tr key={b.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="font-medium text-gray-900 truncate max-w-[140px] sm:max-w-[220px] text-sm">{b.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {b.category && <span className="text-xs text-[#4d65ff] font-medium">{b.category}</span>}
                        {b.author && <span className="hidden sm:inline text-xs text-gray-400">by {b.author}</span>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-medium text-gray-800 text-sm">{b.views.toLocaleString()}</td>
                    <td className="hidden sm:table-cell px-4 py-4 text-right text-gray-600 text-sm">{b.uniqueReaders.toLocaleString()}</td>
                    <td className="hidden sm:table-cell px-4 py-4 text-right text-gray-600 text-sm">
                      {b.avgReadSec > 0 ? fmtTime(b.avgReadSec) : "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <span className="text-sm font-semibold text-[#4d65ff]">{b.pctReadFully.toFixed(0)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Insights grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device breakdown */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Device Breakdown</h2>
          {totalDevices === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {(["mobile", "desktop", "tablet"] as const).map((device) => {
                const count = globalDevices[device] ?? 0;
                const pct = totalDevices > 0 ? (count / totalDevices) * 100 : 0;
                const Icon = device === "mobile" ? Smartphone : Monitor;
                return (
                  <div key={device}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-gray-500" />
                        <span className="text-sm font-medium capitalize text-gray-700">{device}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count.toLocaleString()} <span className="text-gray-400 text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <Bar pct={pct} color={device === "mobile" ? "bg-[#4d65ff]" : device === "desktop" ? "bg-emerald-500" : "bg-amber-400"} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Traffic sources */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Globe size={15} className="text-gray-500" /> Traffic Sources
          </h2>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topReferrers.map(([domain, count]) => {
                const pct = totalViews > 0 ? (count / totalViews) * 100 : 0;
                return (
                  <div key={domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">{domain}</span>
                      <span className="text-sm text-gray-600 flex-shrink-0 ml-2">{count.toLocaleString()} <span className="text-gray-400 text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <Bar pct={pct} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top posts */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">🏆 Top Blog Posts</h2>
          {stats.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Most Read</p>
                {stats.slice(0, 5).map((b, i) => (
                  <div key={b.slug} className="flex items-center gap-3 py-2">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{b.title}</p>
                      {b.category && <p className="text-xs text-gray-400">{b.category}</p>}
                    </div>
                    <span className="text-sm text-gray-600 flex-shrink-0">{b.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Most engaging posts */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">⏱ Most Engaging Posts</h2>
          {stats.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Highest Avg. Read Time</p>
                {[...stats].filter(b => b.avgReadSec > 0).sort((a, b) => b.avgReadSec - a.avgReadSec).slice(0, 5).map((b, i) => (
                  <div key={b.slug} className="flex items-center gap-3 py-2">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{b.title}</p>
                    </div>
                    <span className="text-sm text-gray-600 flex-shrink-0 flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" /> {fmtTime(b.avgReadSec)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Most Fully Read</p>
                {[...stats].sort((a, b) => b.pctReadFully - a.pctReadFully).slice(0, 3).map((b, i) => (
                  <div key={b.slug} className="flex items-center gap-3 py-2">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{b.title}</p>
                    </div>
                    <span className="text-sm text-[#4d65ff] font-semibold flex-shrink-0">{b.pctReadFully.toFixed(0)}% read fully</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
