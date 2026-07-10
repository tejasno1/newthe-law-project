import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

// Public stats endpoint — no auth required (aggregate only, no PII beyond display name)
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabaseService
    .from("test_results")
    .select("score, candidate_name")
    .eq("test_slug", params.slug);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ stats: null });
  }

  const rows = data.map((r) => ({
    score: Number(r.score),
    name: String(r.candidate_name ?? "Anonymous"),
  }));

  const count = rows.length;
  const average =
    Math.round((rows.reduce((s, r) => s + r.score, 0) / count) * 100) / 100;
  const top = rows.reduce((best, r) => (r.score > best.score ? r : best), rows[0]);

  return NextResponse.json({
    stats: {
      count,
      average,
      best: top.score,
      topPerformerName: top.name,
      topPerformerScore: top.score,
    },
  });
}
