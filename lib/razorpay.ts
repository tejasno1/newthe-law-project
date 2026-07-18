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

export async function openRazorpayCheckout({
  amountRupees,
  name,
  description,
  prefill = {},
  onSuccess,
  onFailure,
}: {
  amountRupees: number;
  name: string;
  description: string;
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
      body: JSON.stringify({ amountRupees, description }),
    });
    const data = await res.json();
    if (!res.ok || !data.id) throw new Error(data.error || "Order creation failed");
    orderId = data.id;
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
