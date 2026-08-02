-- ── Resource Categories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Resources ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  category_id  BIGINT REFERENCES resource_categories(id) ON DELETE SET NULL,
  file_path    TEXT,           -- storage path inside "resources" bucket
  pages        INT,
  size_label   TEXT,           -- human-readable, e.g. "2.4 MB"
  is_free      BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources            ENABLE ROW LEVEL SECURITY;

-- Public can read categories
CREATE POLICY "public_read_resource_categories"
  ON resource_categories FOR SELECT USING (true);

-- Public can read published resources
CREATE POLICY "public_read_published_resources"
  ON resources FOR SELECT USING (is_published = true);

-- Service role has full access (used by server actions / admin)
CREATE POLICY "service_role_all_resource_categories"
  ON resource_categories USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_resources"
  ON resources USING (auth.role() = 'service_role');

-- ── Seed default categories ────────────────────────────────────────────────────
INSERT INTO resource_categories (name, slug, sort_order) VALUES
  ('Notes',          'notes',          1),
  ('Bare Acts',      'bare-acts',      2),
  ('MCQ PDFs',       'mcq-pdfs',       3),
  ('Case Summaries', 'case-summaries', 4)
ON CONFLICT (slug) DO NOTHING;

-- ── Storage bucket (run in SQL editor — Supabase does not auto-create buckets) ─
-- NOTE: If the bucket already exists this will error safely; just skip it.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  false,          -- private; we serve via signed URL
  52428800,       -- 50 MB max per file
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only service_role may write; no direct public download
CREATE POLICY "service_role_storage_resources"
  ON storage.objects FOR ALL
  USING (bucket_id = 'resources' AND auth.role() = 'service_role');
