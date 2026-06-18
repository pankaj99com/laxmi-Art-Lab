create extension if not exists pgcrypto with schema extensions;

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (
    form_type in ('contact_message', 'class_registration', 'painting_purchase')
  ),
  payload jsonb not null,
  page jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.form_submissions enable row level security;

grant insert on public.form_submissions to anon, authenticated;

drop policy if exists "Anyone can submit website forms" on public.form_submissions;
create policy "Anyone can submit website forms"
  on public.form_submissions
  for insert
  to anon, authenticated
  with check (true);
