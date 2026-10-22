import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { PASS_SLUG } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hasPass: false });

  const { count } = await supabaseService
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("course_slug", PASS_SLUG)
    .eq("payment_status", "paid");

  return NextResponse.json({ hasPass: (count ?? 0) > 0 });
}
