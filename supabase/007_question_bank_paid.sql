-- Question Bank: paid sets + purchases.
-- Safe to run more than once. Existing tables/data are kept as they are.

-- ── Base tables (no-op if they already exist) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS question_bank_categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_bank (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  subject       TEXT,
  exam_category TEXT,
  file_path     TEXT,          -- storage path inside "question-bank" bucket
  is_published  BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Paid question sets ─────────────────────────────────────────────────────────
-- Existing sets stay free; mark individual sets as paid from /admin/question-bank.
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS price   NUMERIC(10,2) NOT NULL DEFAULT 0;

-- The PDF API looks sets up by file_path.
CREATE INDEX IF NOT EXISTS question_bank_file_path_idx ON question_bank (file_path);

-- ── Purchases ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_bank_purchases (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id           BIGINT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  amount_rupees     NUMERIC(10,2),
  razorpay_order_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, item_id)
);

-- ── RLS ────────────────────────────────────────────────────────────────────────
-- All reads/writes go through the server (service role), which bypasses RLS.
-- Enabling RLS with no public policies blocks direct access from the browser.
ALTER TABLE question_bank_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank            ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_purchases  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_question_bank_categories" ON question_bank_categories;
CREATE POLICY "public_read_question_bank_categories"
  ON question_bank_categories FOR SELECT USING (true);

-- Public may read published set metadata (title, price…). The PDFs themselves
-- live in a private bucket and are only served via the access-checked API.
DROP POLICY IF EXISTS "public_read_published_question_bank" ON question_bank;
CREATE POLICY "public_read_published_question_bank"
  ON question_bank FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "service_role_all_question_bank_purchases" ON question_bank_purchases;
CREATE POLICY "service_role_all_question_bank_purchases"
  ON question_bank_purchases USING (auth.role() = 'service_role');

-- ── Storage bucket (private; no-op if it exists) ──────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('question-bank', 'question-bank', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Make sure the bucket is private even if it was created as public earlier,
-- otherwise paid PDFs could be downloaded via their public URL.
UPDATE storage.buckets SET public = false WHERE id = 'question-bank';
