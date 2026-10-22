declare global {
  interface Window { Razorpay: any; }
}

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(false); return; }
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export type Purchase =
  | { kind: "course"; courseSlug: string }
  | { kind: "pass" }
  | { kind: "question_bank"; itemId: number };

const PENDING_KEY = "tlp_pending_orders";

function readPending(): string[] {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]"); } catch { return []; }
}
function writePending(ids: string[]) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(ids)); } catch {}
}

/** Ask the server to grant access for a paid order. Returns true once access is granted. */
export async function verifyOrder(orderId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    // Drop the order from the pending list unless it's worth retrying later
    // (not paid yet / network / server error).
    if (res.ok || res.status === 403 || res.status === 400 || res.status === 404) {
      writePending(readPending().filter((id) => id !== orderId));
    }
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Re-checks orders whose checkout never reported back (e.g. the tab was
 * reloaded or killed while the student was in their UPI app).
 * Returns true if any access was granted.
 */
export async function recoverPendingOrders(): Promise<boolean> {
  const ids = readPending();
  if (ids.length === 0) return false;
  const results = await Promise.all(ids.map(verifyOrder));
  return results.some(Boolean);
}

export async function openRazorpayCheckout({
  amountRupees,
  name,
  description,
  purchase,
  prefill = {},
  onSuccess,
  onFailure,
}: {
  amountRupees: number;
  name: string;
  description: string;
  /** Course / All-Access / question-set purchases: priced and fulfilled server-side. */
  purchase?: Purchase;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure?: (err: any) => void;
}) {
  const loaded = await loadScript();
  if (!loaded) {
    alert("Payment gateway could not be loaded. Please check your connection.");
    return;
  }

  let orderId = "";
  try {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountRupees, description, purchase }),
    });
    const data = await res.json();
    if (!res.ok || !data.id) throw new Error(data.error || "Order creation failed");
    orderId = data.id;
    if (purchase) writePending([...readPending(), orderId].slice(-5));
  } catch (err: any) {
    alert("Could not initiate payment: " + (err.message || "please try again."));
    return;
  }

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: Math.round(amountRupees * 100),
    currency: "INR",
    name: "The Law Project",
    description,
    order_id: orderId,
    prefill,
    theme: { color: "#2563eb" },
    handler(response: any) {
      onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature,
      );
    },
    modal: {
      ondismiss() { onFailure?.({ message: "Payment cancelled" }); },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (resp: any) => onFailure?.(resp.error));
  rzp.open();
}

export function parseRupees(price: string | number): number {
  if (typeof price === "number") return price;
  return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}
