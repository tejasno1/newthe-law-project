import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getQuestionBankAccess } from "@/lib/questionBank";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  // Only sign files that belong to a published question set the user may open.
  const { data: item } = await supabaseAdmin
    .from("question_bank")
    .select("id, is_free, is_published")
    .eq("file_path", path)
    .maybeSingle();
  if (!item || !item.is_published) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!item.is_free) {
    const { hasPass, purchasedIds } = await getQuestionBankAccess(user.id);
    if (!hasPass && !purchasedIds.includes(Number(item.id))) {
      return NextResponse.json({ error: "Purchase required" }, { status: 403 });
    }
  }

  const { data, error } = await supabaseAdmin.storage
    .from("question-bank")
    .createSignedUrl(path, 3600);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl }, {
    headers: { "Cache-Control": "private, max-age=3300, stale-while-revalidate=300" },
  });
}
