import { createClient } from "@supabase/supabase-js";

// Server-only — NEVER import this in client components
// Uses SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: {
      // Opt every Supabase request out of Next.js's fetch cache so admin
      // pages always see the latest data from the database.
      fetch: (url, options = {}) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  }
);
