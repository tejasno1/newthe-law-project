-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists public.test_results (
  id bigint generated always as identity primary key,
  candidate_name text not null,
  test_slug text not null,
  test_title text not null,
  score numeric not null,
  max_score numeric not null,
  correct integer not null,
  incorrect integer not null,
  unattempted integer not null,
  accuracy integer not null,
  percentile integer not null,
  rank integer not null,
  time_taken_seconds integer not null,
  attempted_at timestamptz not null default now()
);

alter table public.test_results enable row level security;

-- No login system: anyone can submit a result (insert-only, write-only from the
-- browser's anon key). There is intentionally no public select policy, so
-- nobody can read other candidates' results back through the anon key.
create policy "Public insert access" on public.test_results
  for insert with check (true);
