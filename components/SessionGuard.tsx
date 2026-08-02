"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const validate = async () => {
      // Skip if tab is hidden — no need to poll in background
      if (document.visibilityState === "hidden") return;

      const token = localStorage.getItem("tlp_session_token");
      if (!token) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        localStorage.removeItem("tlp_session_token");
        return;
      }

      const res = await fetch(`/api/session?token=${encodeURIComponent(token)}`).catch(() => null);
      if (!res) return;
      const { valid } = await res.json();

      if (!valid) {
        localStorage.removeItem("tlp_session_token");
        await supabase.auth.signOut();
        router.push("/auth/login?reason=kicked");
        router.refresh();
      }
    };

    // Run once on mount, then every 2 minutes (tab-focused only)
    validate();
    const id = setInterval(validate, 120_000);

    // Also validate immediately when user switches back to this tab
    const onVisible = () => {
      if (document.visibilityState === "visible") validate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}
