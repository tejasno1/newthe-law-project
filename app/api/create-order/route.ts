import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { PASS_SLUG } from "@/lib/fulfillment";
import { parseRupees } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, purchase } = body;
    let amountRupees: number = body.amountRupees;

    // Course / All-Access purchases carry the buyer and item on the order itself,
    // so access can be granted server-side even if the browser never returns.
    // Their price is read from the DB, never trusted from the client.
    const notes: Record<string, string> = { description };
    if (purchase) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });

      if (purchase.kind === "question_bank") {
        const itemId = Number(purchase.itemId);
        const { data: item } = await supabaseService
          .from("question_bank")
          .select("id, price, is_free, is_published")
          .eq("id", itemId)
          .maybeSingle();
        if (!item || !item.is_published) return NextResponse.json({ error: "Question set not found" }, { status: 404 });
        if (item.is_free) return NextResponse.json({ error: "This question set is free" }, { status: 400 });
        amountRupees = parseRupees(item.price ?? 0);
        notes.question_bank_id = String(item.id);
      } else {
        const slug = purchase.kind === "pass" ? PASS_SLUG : purchase.kind === "course" ? purchase.courseSlug : null;
        if (!slug) return NextResponse.json({ error: "Invalid purchase" }, { status: 400 });

        const { data: course } = await supabaseService.from("courses").select("price").eq("slug", slug).maybeSingle();
        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
        amountRupees = parseRupees(course.price ?? 0);
        if (purchase.kind === "course") notes.course_slug = slug;
      }

      notes.user_id = user.id;
      notes.kind = purchase.kind;
    }

    if (!amountRupees || amountRupees <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amountRupees * 100), // paise
        currency: "INR",
        receipt: `tlp_${Date.now()}`,
        notes,
      }),
    });

    const order = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: order.error?.description || "Order creation failed" }, { status: 500 });
    }

    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
