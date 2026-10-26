-- Question Bank: multiple PDFs per question set (one price unlocks all of them).
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS question_bank_files (
  id          BIGSERIAL PRIMARY KEY,
  item_id     BIGINT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  title       TEXT   NOT NULL,
  file_path   TEXT   NOT NULL UNIQUE,   -- storage path inside "question-bank" bucket
  sort_order  INT    DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS question_bank_files_item_id_idx ON question_bank_files (item_id);

-- Server-only access (service role bypasses RLS); PDFs are served via the access-checked API.
ALTER TABLE question_bank_files ENABLE ROW LEVEL SECURITY;

-- Move each existing set's single PDF into the new table.
INSERT INTO question_bank_files (item_id, title, file_path, sort_order)
SELECT qb.id, qb.title, qb.file_path, 0
FROM question_bank qb
WHERE qb.file_path IS NOT NULL
ON CONFLICT (file_path) DO NOTHING;

-- question_bank.file_path is no longer used by the app (kept so nothing is lost).
