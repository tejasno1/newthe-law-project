import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ attempts: [] });

  const { data } = await supabaseService
    .from("test_attempts")
    .select("id, test_slug, score, correct, incorrect, unattempted, status, submitted_at, started_at")
    .eq("user_id", user.id)
    .neq("status", "in_progress")
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  return NextResponse.json({ attempts: data ?? [] });
}
