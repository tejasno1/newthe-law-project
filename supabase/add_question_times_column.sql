-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

alter table public.test_results
  add column if not exists question_times jsonb not null default '{}'::jsonb;
