-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

alter table public.question_reports
  add column if not exists report_types jsonb not null default '[]'::jsonb,
  add column if not exists additional_note text not null default '';

-- The old single-select "report_type" column is superseded by "report_types"
-- (an array of selected checkboxes). Make it optional so new inserts that
-- don't set it no longer fail the NOT NULL constraint.
alter table public.question_reports
  alter column report_type drop not null;
