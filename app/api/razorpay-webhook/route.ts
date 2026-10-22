import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/fulfillment";

// Razorpay Dashboard → Settings → Webhooks:
//   URL:    https://<site>/api/razorpay-webhook
//   Events: order.paid
//   Secret: same value as RAZORPAY_WEBHOOK_SECRET
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  const orderId: string | undefined =
    event.payload?.order?.entity?.id ?? event.payload?.payment?.entity?.order_id;

  if (orderId && (event.event === "order.paid" || event.event === "payment.captured")) {
    const result = await fulfillOrder(orderId);
    // Orders without purchase notes (mock tests, skill training) are handled elsewhere.
    if (!result.ok && result.status >= 500) {
      return NextResponse.json({ error: result.error }, { status: 500 }); // Razorpay retries
    }
  }

  return NextResponse.json({ ok: true });
}
