import { createClient } from "@supabase/supabase-js";

// Server-only — NEVER import this in client components or expose to the browser.
// Uses the service role key which bypasses RLS and has full table access.
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
