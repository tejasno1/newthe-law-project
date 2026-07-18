import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_EVENTS = new Set([
  "test_view",
  "test_start",
  "result_view",
  "test_reattempt",
]);

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { test_slug, event_type, session_id, value, referrer } = body;

    if (!test_slug || !event_type || !ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") ?? "";
    const device_type = detectDevice(ua);

    const { error } = await supabaseAdmin.from("mcq_events").insert({
      test_slug,
      event_type,
      session_id: session_id ?? null,
      value: value != null ? Number(value) : null,
      referrer: referrer || req.headers.get("referer") || null,
      device_type,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
