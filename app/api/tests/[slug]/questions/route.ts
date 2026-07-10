import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseService
    .from("mock_tests")
    .select("questions")
    .eq("slug", params.slug)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const safe = (data.questions as Array<{ id: number; text: string; options: string[]; correctIndex?: number }>)
    .map(({ correctIndex: _stripped, ...q }) => q);

  return NextResponse.json({ questions: safe });
}
