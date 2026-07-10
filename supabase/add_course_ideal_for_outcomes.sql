-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

alter table public.courses
  add column if not exists ideal_for jsonb not null default '[]'::jsonb,
  add column if not exists outcomes jsonb not null default '[]'::jsonb;

-- Example: populate for the CLAT Scholars Programme course
-- (swap 'your-course-slug' for the real slug of that course row)
update public.courses
set
  ideal_for = '[
    "Students currently in Class XI who want to start CLAT preparation early",
    "Aspirants targeting CLAT 2027 and other national law entrance exams",
    "Students who want concept-based teaching without unnecessary academic pressure",
    "School students who need a weekend-friendly schedule alongside academics"
  ]'::jsonb,
  outcomes = '[
    "Complete coverage of the CLAT syllabus: English, Current Affairs & GK, Legal Reasoning, Logical Reasoning, and Quantitative Techniques",
    "Strong conceptual foundation reinforced through assignments, sectional practice, and mock tests",
    "Exam temperament built through full-length mock tests and performance reviews",
    "A personalised study plan with continuous mentoring and strategic guidance",
    "Readiness for CLAT, AILET, and other law entrance examinations"
  ]'::jsonb
where slug = 'your-course-slug';
