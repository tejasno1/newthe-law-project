import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { sendEnrollmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { testSlug } = await req.json();
  if (!testSlug) return NextResponse.json({ error: "Missing testSlug" }, { status: 400 });

  // Record free access
  const { error } = await supabaseService
    .from("test_purchases")
    .upsert(
      { user_id: user.id, test_slug: testSlug, amount_rupees: 0, status: "completed" },
      { onConflict: "user_id,test_slug" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch title + custom email body
  const { data: testRow } = await supabaseService
    .from("mock_tests")
    .select("title, enrollment_email")
    .eq("slug", testSlug)
    .maybeSingle();

  const title = testRow?.title ?? testSlug;
  const emailBody = testRow?.enrollment_email?.trim() ||
    `Congratulations! Your free access to "${title}" has been confirmed.\n\nYou can now attempt the test anytime at thelawproject.in/mock-test.\n\nBest of luck with your preparation!\n\n— The Law Project Team`;

  let emailError: string | null = null;

  if (user.email) {
    if (!process.env.RESEND_API_KEY) {
      emailError = "RESEND_API_KEY not set in environment";
      console.error("[test-access] " + emailError);
    } else {
      try {
        await sendEnrollmentEmail({ to: user.email, courseTitle: title, emailBody });
      } catch (e) {
        emailError = String(e);
        console.error("[test-access] Email send failed:", e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    title,
    emailBody,
    emailError,
  });
}
