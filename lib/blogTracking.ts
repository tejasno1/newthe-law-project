"use client";

import { useEffect, useRef } from "react";

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

function send(payload: {
  blog_slug: string;
  event_type: string;
  session_id?: string;
  value?: number;
  referrer?: string;
}) {
  try {
    fetch("/api/track/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackBlogEvent(blogSlug: string, eventType: string, value?: number) {
  send({
    blog_slug: blogSlug,
    event_type: eventType,
    session_id: getSessionId(),
    value,
    referrer: typeof document !== "undefined" ? document.referrer : undefined,
  });
}

export function useBlogTracking(blogSlug: string) {
  const enteredAt = useRef(0);
  const firedScrolls = useRef(new Set<number>());

  useEffect(() => {
    enteredAt.current = Date.now();
    firedScrolls.current = new Set();

    trackBlogEvent(blogSlug, "page_view");

    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop + el.clientHeight;
      const total = el.scrollHeight;
      if (total <= el.clientHeight) return;
      const pct = Math.round((scrolled / total) * 100);

      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !firedScrolls.current.has(milestone)) {
          firedScrolls.current.add(milestone);
          trackBlogEvent(blogSlug, "scroll_depth", milestone);
        }
      }
    }

    function onLeave() {
      const seconds = Math.round((Date.now() - enteredAt.current) / 1000);
      if (seconds < 2) return;
      const sid = getSessionId();
      const body = JSON.stringify({
        blog_slug: blogSlug,
        event_type: "time_spent",
        session_id: sid,
        value: seconds,
      });
      try {
        navigator.sendBeacon("/api/track/blog", new Blob([body], { type: "application/json" }));
      } catch {
        send({ blog_slug: blogSlug, event_type: "time_spent", session_id: sid, value: seconds });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [blogSlug]);
}
