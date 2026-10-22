import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fulfillOrder } from "@/lib/fulfillment";

// Called by the browser after checkout (and again on page load for any order
// that was left pending). Access is granted only if Razorpay reports the order paid.
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const result = await fulfillOrder(orderId, user.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
