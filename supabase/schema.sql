-- Daily Streak Wall — schema + RLS policies.
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).

create extension if not exists "pgcrypto";

-- One check-in per user per calendar date.
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, check_in_date)
);

create index if not exists check_ins_user_date_idx
  on public.check_ins (user_id, check_in_date desc);

alter table public.check_ins enable row level security;

-- Each user can only see/write their own rows.
drop policy if exists "check_ins select own" on public.check_ins;
create policy "check_ins select own"
  on public.check_ins for select
  using (auth.uid() = user_id);

drop policy if exists "check_ins insert own" on public.check_ins;
create policy "check_ins insert own"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

drop policy if exists "check_ins update own" on public.check_ins;
create policy "check_ins update own"
  on public.check_ins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "check_ins delete own" on public.check_ins;
create policy "check_ins delete own"
  on public.check_ins for delete
  using (auth.uid() = user_id);
