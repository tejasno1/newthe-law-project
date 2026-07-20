import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ purchases: [] });

  const { data } = await supabaseService
    .from("test_purchases")
    .select("test_slug")
    .eq("user_id", user.id)
    .eq("status", "completed");

  return NextResponse.json({ purchases: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { testSlug, amountRupees, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();
  if (!testSlug || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify Razorpay signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSig !== razorpaySignature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const { error } = await supabaseService
    .from("test_purchases")
    .upsert(
      {
        user_id: user.id,
        test_slug: testSlug,
        amount_rupees: amountRupees,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: "completed",
      },
      { onConflict: "user_id,test_slug" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
