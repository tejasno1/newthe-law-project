-- ── Passage-Based Mock Test Schema ───────────────────────────────────────────
-- Run this in Supabase SQL Editor to enable passage-based tests.

-- 1. Add test_type column to mock_tests
ALTER TABLE mock_tests
  ADD COLUMN IF NOT EXISTS test_type TEXT NOT NULL DEFAULT 'normal';

-- 2. Create passages table
CREATE TABLE IF NOT EXISTS passages (
  id              BIGSERIAL PRIMARY KEY,
  test_slug       TEXT NOT NULL REFERENCES mock_tests(slug) ON DELETE CASCADE,
  passage_number  INTEGER NOT NULL,
  title           TEXT,
  text            TEXT NOT NULL,
  source          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (test_slug, passage_number)
);

-- 3. Add passage_id FK to mock_test_questions
ALTER TABLE mock_test_questions
  ADD COLUMN IF NOT EXISTS passage_id BIGINT REFERENCES passages(id) ON DELETE SET NULL;

-- Index for fast lookup by test_slug
CREATE INDEX IF NOT EXISTS passages_test_slug_idx ON passages (test_slug);
CREATE INDEX IF NOT EXISTS mock_test_questions_passage_id_idx ON mock_test_questions (passage_id);
