import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Next.js's App Router auto-caches every fetch() made inside Server Components
// (including the ones supabase-js makes internally) unless told not to. In
// `next dev` that means the first query in a session gets cached indefinitely,
// so rows added in Supabase afterwards silently don't show up until a restart.
// Only force no-store in dev: at build time (output: 'export' / next build),
// a no-store fetch makes Next treat the page as dynamic and it skips static
// generation entirely — since there's no server runtime to serve a dynamic
// page from, that would silently produce no HTML for that route at all.
const isDev = process.env.NODE_ENV !== "production";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: isDev
    ? { fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }) }
    : {},
});
