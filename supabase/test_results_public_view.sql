-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- The mock-test report page needs to know how many people have taken a
-- given test, the real average/best score, and who the top performer is
-- (by name), to label "Average Score" / "Best Score" / "Top Performer" as
-- "Current ..." until there's more than one attempt to compare against.
--
-- test_results has RLS enabled with an insert-only policy (no select policy),
-- by design, so individual attempts can't be read back wholesale by the anon
-- key. Instead of loosening that, this creates a narrow view exposing only
-- test_slug + score + candidate_name (no question_times, no rank/percentile,
-- no timestamps), and grants the anon role select access to the view only.
-- Views created by the table owner bypass the base table's RLS, so this does
-- not require adding a select policy on test_results itself.
--
-- Note: this does expose candidate_name publicly (needed to show the real
-- "Top Performer" name on the report page) — previously the view only
-- exposed score. If you'd rather keep names private, say so and this can
-- go back to an anonymous "Top Scorer" label instead.

create or replace view public.test_results_public as
  select test_slug, score, candidate_name
  from public.test_results;

grant select on public.test_results_public to anon;
