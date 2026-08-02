import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { randomUUID } from "crypto";

function deviceHint(ua: string): string {
  const browser = ua.includes("Edg/") ? "Edge"
    : ua.includes("Chrome") ? "Chrome"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Safari") ? "Safari"
    : "Browser";
  const os = ua.includes("Windows") ? "Windows"
    : ua.includes("Macintosh") ? "Mac"
    : ua.includes("iPhone") ? "iPhone"
    : ua.includes("Android") ? "Android"
    : "device";
  return `${browser} on ${os}`;
}

// GET /api/session?token=xxx — validate stored token for current user
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ valid: false });

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });

  const { data } = await supabaseService
    .from("user_sessions")
    .select("session_token")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ valid: data?.session_token === token }, {
    headers: { "Cache-Control": "private, max-age=55, stale-while-revalidate=10" },
  });
}

// POST /api/session — check for conflict then register if none
// Returns { conflict: false, token } or { conflict: true, previousDevice }
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hint = deviceHint(req.headers.get("user-agent") ?? "");

  const { data: existing } = await supabaseService
    .from("user_sessions")
    .select("session_token, device_hint")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ conflict: true, previousDevice: existing.device_hint ?? "another device" });
  }

  const token = randomUUID();
  await supabaseService
    .from("user_sessions")
    .insert({ user_id: user.id, session_token: token, device_hint: hint });

  return NextResponse.json({ conflict: false, token });
}

// PUT /api/session — force-replace session (user confirmed kick)
export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hint = deviceHint(req.headers.get("user-agent") ?? "");
  const token = randomUUID();

  await supabaseService
    .from("user_sessions")
    .upsert(
      { user_id: user.id, session_token: token, device_hint: hint, created_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  return NextResponse.json({ token });
}

// DELETE /api/session — clean up on normal logout
export async function DELETE() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: true });

  await supabaseService.from("user_sessions").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
