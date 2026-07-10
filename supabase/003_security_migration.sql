-- ============================================================
-- THE LAW PROJECT — Security Migration 003
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. test_attempts table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_slug        TEXT NOT NULL,
  started_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  submitted_at     TIMESTAMPTZ,
  status           TEXT DEFAULT 'in_progress'
                   CHECK (status IN (
                     'in_progress',
                     'submitted',
                     'auto_submitted_timer',
                     'auto_submitted_violations'
                   )),
  violation_count  INT DEFAULT 0,
  answers          JSONB,
  question_times   JSONB,
  score            NUMERIC,
  correct          INT,
  incorrect        INT,
  unattempted      INT
);

-- Index for fast lookup by user + slug
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_slug
  ON public.test_attempts (user_id, test_slug);

-- ── 2. RLS on test_attempts ────────────────────────────────
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own attempts; no client-side writes.
-- All INSERT/UPDATE happen via service role in route handlers.
CREATE POLICY "Users can read own attempts"
  ON public.test_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- ── 3. Safe catalog view for mock_tests ────────────────────
-- Exposes metadata only — questions column (which contains correctIndex)
-- is intentionally excluded.
CREATE OR REPLACE VIEW public.mock_tests_catalog AS
  SELECT
    id,
    slug,
    title,
    section,
    category,
    difficulty,
    duration_minutes,
    total_questions,
    total_marks,
    marks_per_correct,
    negative_mark,
    language,
    attempted_label,
    recent_attempt_line,
    description
  FROM public.mock_tests;

-- Allow anon and authenticated to read the safe catalog view.
GRANT SELECT ON public.mock_tests_catalog TO anon, authenticated;

-- ── 4. RLS on mock_tests ───────────────────────────────────
-- Enable RLS and revoke direct SELECT access.
-- The questions column (with correctIndex) is only accessible via
-- the service role client used in route handlers.
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

-- No SELECT policy for anon/authenticated on mock_tests itself.
-- They use the mock_tests_catalog view instead.
-- Route handlers use service role which bypasses RLS.

-- If you had a previous permissive policy, drop it:
DROP POLICY IF EXISTS "Allow read access to mock_tests" ON public.mock_tests;
DROP POLICY IF EXISTS "Anyone can read mock_tests" ON public.mock_tests;

-- ── 5. RLS on test_results (legacy) ───────────────────────
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Keep existing public read for the stats/leaderboard view.
-- Writes are now done server-side in the submit route handler.
DROP POLICY IF EXISTS "Anyone can insert test results" ON public.test_results;

-- test_results_public view (already exists from earlier migration)
-- Re-grant in case it was affected:
GRANT SELECT ON public.test_results_public TO anon, authenticated;

-- ── 6. RLS on blogs & courses ─────────────────────────────
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read blogs" ON public.blogs;
CREATE POLICY "Anyone can read blogs"
  ON public.blogs FOR SELECT USING (TRUE);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read courses" ON public.courses;
CREATE POLICY "Anyone can read courses"
  ON public.courses FOR SELECT USING (TRUE);

-- ── 7. RLS on profiles ────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- After running this migration, add to your .env.local:
--
--   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
--
-- Get it from: Supabase → Project Settings → API → service_role key
-- Also add this same variable in Vercel environment variables.
-- NEVER commit this key or expose it to the browser.
-- ============================================================
