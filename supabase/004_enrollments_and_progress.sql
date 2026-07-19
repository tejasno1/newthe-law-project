-- ─── Enrollments ────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  course_slug   text        not null,
  enrolled_at   timestamptz not null default now(),
  payment_status text       not null default 'free' check (payment_status in ('free','paid')),
  unique(user_id, course_slug)
);

alter table public.enrollments enable row level security;

create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "Service role can manage enrollments"
  on public.enrollments for all
  using (true);

-- ─── Lesson Progress ─────────────────────────────────────────────────────────
create table if not exists public.lesson_progress (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  course_slug   text        not null,
  module_index  int         not null,
  lesson_index  int         not null,
  completed_at  timestamptz not null default now(),
  unique(user_id, course_slug, module_index, lesson_index)
);

alter table public.lesson_progress enable row level security;

create policy "Users can read own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Service role can manage lesson progress"
  on public.lesson_progress for all
  using (true);
