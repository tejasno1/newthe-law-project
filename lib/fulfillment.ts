import { supabaseService } from "@/lib/supabase/service";
import { sendEnrollmentEmail } from "@/lib/email";

// Server-only. Grants course access for a Razorpay order once Razorpay itself
// confirms the order is paid. Safe to call repeatedly for the same order
// (client callback, page-reload recovery and webhook may all fire).

export const PASS_SLUG = "tlp-all-access-plan";

type OrderNotes = {
  user_id?: string;
  kind?: "course" | "pass" | "question_bank";
  course_slug?: string;
  question_bank_id?: string;
};

export type FulfillResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

async function fetchOrder(orderId: string) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; status: string; amount: number; notes?: OrderNotes }>;
}

export async function fulfillOrder(orderId: string, expectedUserId?: string): Promise<FulfillResult> {
  const order = await fetchOrder(orderId);
  if (!order) return { ok: false, status: 404, error: "Order not found" };

  const notes = order.notes ?? {};
  if (!notes.user_id || !notes.kind) return { ok: false, status: 400, error: "Order has no purchase details" };
  if (expectedUserId && notes.user_id !== expectedUserId) return { ok: false, status: 403, error: "Order belongs to another user" };
  if (order.status !== "paid") return { ok: false, status: 402, error: `Order not paid (status: ${order.status})` };

  const userId = notes.user_id;

  if (notes.kind === "question_bank") {
    const itemId = Number(notes.question_bank_id);
    if (!itemId) return { ok: false, status: 400, error: "Order has no question set" };
    const { error } = await supabaseService
      .from("question_bank_purchases")
      .upsert(
        { user_id: userId, item_id: itemId, amount_rupees: order.amount / 100, razorpay_order_id: order.id },
        { onConflict: "user_id,item_id", ignoreDuplicates: true }
      );
    if (error) return { ok: false, status: 500, error: error.message };
    return { ok: true, userId };
  }

  // A purchase grants exactly the course bought; the All-Access pass is the
  // tlp-all-access-plan course.
  const slug = notes.kind === "pass" ? PASS_SLUG : notes.course_slug;
  if (!slug) return { ok: false, status: 400, error: "Order has no course" };

  // Only email on the first successful fulfillment of this purchase.
  const { count: already } = await supabaseService
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_slug", slug)
    .eq("payment_status", "paid");

  const { error: upsertErr } = await supabaseService
    .from("enrollments")
    .upsert(
      { user_id: userId, course_slug: slug, payment_status: "paid" },
      { onConflict: "user_id,course_slug", ignoreDuplicates: false }
    );
  if (upsertErr) return { ok: false, status: 500, error: upsertErr.message };

  if (!already) {
    const [{ data: courseRow }, { data: userRes }] = await Promise.all([
      supabaseService.from("courses").select("title, enrollment_email").eq("slug", slug).maybeSingle(),
      supabaseService.auth.admin.getUserById(userId),
    ]);
    const email = userRes?.user?.email;
    if (email && courseRow?.enrollment_email) {
      sendEnrollmentEmail({ to: email, courseTitle: courseRow.title, emailBody: courseRow.enrollment_email }).catch(() => {});
    }
  }

  return { ok: true, userId };
}
