"use client";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("tlp_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("tlp_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function trackMcqEvent(testSlug: string, eventType: string, value?: number) {
  try {
    fetch("/api/track/mcq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test_slug: testSlug,
        event_type: eventType,
        session_id: getSessionId(),
        value: value ?? null,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
