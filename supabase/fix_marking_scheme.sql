-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- Fixes the marking scheme to the standard CLAT PG pattern: +1 for a correct
-- answer, -0.25 for an incorrect one. Also updates total_marks so the
-- "Maximum Marks" badge stays consistent with 15 questions x 1 mark each.

update public.mock_tests
set
  marks_per_correct = 1,
  negative_mark = 0.25,
  total_marks = total_questions
where marks_per_correct <> 1 or negative_mark <> 0.25;
