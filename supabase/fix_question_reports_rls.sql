-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- The question_reports table has RLS enabled but no policy currently permits
-- inserts from the anon key, so every report submission is silently rejected
-- with "new row violates row-level security policy". This recreates the
-- missing insert policy.

drop policy if exists "Public insert access" on public.question_reports;

create policy "Public insert access" on public.question_reports
  for insert with check (true);
