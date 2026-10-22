import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { sendEnrollmentEmail } from "@/lib/email";
import { parseRupees } from "@/lib/razorpay";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ enrollments: [] });

  const { data } = await supabaseService
    .from("enrollments")
    .select("course_slug, enrolled_at, payment_status")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  return NextResponse.json({ enrollments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseSlug } = await req.json();
  if (!courseSlug) return NextResponse.json({ error: "courseSlug required" }, { status: 400 });

  // Free courses only — paid enrollments are granted by /api/verify-payment
  // and /api/razorpay-webhook after Razorpay confirms the payment.
  const { data: course } = await supabaseService
    .from("courses")
    .select("price")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (parseRupees(course.price ?? 0) > 0) {
    return NextResponse.json({ error: "This course requires payment" }, { status: 402 });
  }

  const { error } = await supabaseService
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_slug: courseSlug, payment_status: "free" },
      { onConflict: "user_id,course_slug", ignoreDuplicates: false }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send enrollment confirmation email (non-blocking)
  if (user.email) {
    const { data: courseRow } = await supabaseService
      .from("courses")
      .select("title, enrollment_email")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (courseRow?.enrollment_email) {
      sendEnrollmentEmail({
        to: user.email,
        courseTitle: courseRow.title,
        emailBody: courseRow.enrollment_email,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
