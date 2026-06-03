-- ============================================================================
-- AI DriveX — Supabase schema + Row Level Security
-- ----------------------------------------------------------------------------
-- HOW TO RUN:
--   1. Open your Supabase project → SQL Editor → New query
--   2. Paste this ENTIRE file and click "Run"
--   3. It is idempotent — safe to run more than once.
--
-- WHAT IT DOES:
--   • Creates 4 long-term data tables (expenses, diagnostics, fuel,
--     maintenance_log), each owned by a user and isolated by RLS.
--   • Each row links back to the device's local Dexie id via `local_id`,
--     with a UNIQUE(user_id, local_id) constraint so cloud sync stays
--     idempotent (upsert never duplicates).
--   • Enables Row Level Security so every user can read/write ONLY their
--     own rows — no user can ever see another user's data.
-- ============================================================================

-- Helper: keep updated_at fresh on every UPDATE -----------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1) EXPENSES
-- ============================================================================
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  local_id    bigint,
  amount      double precision not null,
  category    text not null,
  date        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, local_id)
);

-- ============================================================================
-- 2) DIAGNOSTICS
-- ============================================================================
create table if not exists public.diagnostics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  local_id    bigint,
  result      text not null,
  date        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, local_id)
);

-- ============================================================================
-- 3) FUEL LOG
-- ============================================================================
create table if not exists public.fuel (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  local_id      bigint,
  odometer_km   double precision not null,
  liters        double precision not null,
  cost_per_liter double precision not null,
  total_cost    double precision not null,
  date          text not null,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, local_id)
);

-- ============================================================================
-- 4) MAINTENANCE LOG
-- ============================================================================
create table if not exists public.maintenance_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  local_id    bigint,
  type        text not null,
  service_km  double precision not null,
  date        text not null,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, local_id)
);

-- ============================================================================
-- Indexes for fast per-user reads
-- ============================================================================
create index if not exists expenses_user_idx        on public.expenses (user_id);
create index if not exists diagnostics_user_idx     on public.diagnostics (user_id);
create index if not exists fuel_user_idx            on public.fuel (user_id);
create index if not exists maintenance_log_user_idx on public.maintenance_log (user_id);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

drop trigger if exists diagnostics_set_updated_at on public.diagnostics;
create trigger diagnostics_set_updated_at
  before update on public.diagnostics
  for each row execute function public.set_updated_at();

drop trigger if exists fuel_set_updated_at on public.fuel;
create trigger fuel_set_updated_at
  before update on public.fuel
  for each row execute function public.set_updated_at();

drop trigger if exists maintenance_log_set_updated_at on public.maintenance_log;
create trigger maintenance_log_set_updated_at
  before update on public.maintenance_log
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY — every user sees ONLY their own rows
-- ============================================================================
alter table public.expenses        enable row level security;
alter table public.diagnostics     enable row level security;
alter table public.fuel            enable row level security;
alter table public.maintenance_log enable row level security;

-- EXPENSES policies
drop policy if exists "expenses owner read"   on public.expenses;
drop policy if exists "expenses owner write"  on public.expenses;
drop policy if exists "expenses owner update" on public.expenses;
drop policy if exists "expenses owner delete" on public.expenses;
create policy "expenses owner read"   on public.expenses for select using (auth.uid() = user_id);
create policy "expenses owner write"  on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses owner update" on public.expenses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses owner delete" on public.expenses for delete using (auth.uid() = user_id);

-- DIAGNOSTICS policies
drop policy if exists "diagnostics owner read"   on public.diagnostics;
drop policy if exists "diagnostics owner write"  on public.diagnostics;
drop policy if exists "diagnostics owner update" on public.diagnostics;
drop policy if exists "diagnostics owner delete" on public.diagnostics;
create policy "diagnostics owner read"   on public.diagnostics for select using (auth.uid() = user_id);
create policy "diagnostics owner write"  on public.diagnostics for insert with check (auth.uid() = user_id);
create policy "diagnostics owner update" on public.diagnostics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "diagnostics owner delete" on public.diagnostics for delete using (auth.uid() = user_id);

-- FUEL policies
drop policy if exists "fuel owner read"   on public.fuel;
drop policy if exists "fuel owner write"  on public.fuel;
drop policy if exists "fuel owner update" on public.fuel;
drop policy if exists "fuel owner delete" on public.fuel;
create policy "fuel owner read"   on public.fuel for select using (auth.uid() = user_id);
create policy "fuel owner write"  on public.fuel for insert with check (auth.uid() = user_id);
create policy "fuel owner update" on public.fuel for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fuel owner delete" on public.fuel for delete using (auth.uid() = user_id);

-- MAINTENANCE_LOG policies
drop policy if exists "maintenance owner read"   on public.maintenance_log;
drop policy if exists "maintenance owner write"  on public.maintenance_log;
drop policy if exists "maintenance owner update" on public.maintenance_log;
drop policy if exists "maintenance owner delete" on public.maintenance_log;
create policy "maintenance owner read"   on public.maintenance_log for select using (auth.uid() = user_id);
create policy "maintenance owner write"  on public.maintenance_log for insert with check (auth.uid() = user_id);
create policy "maintenance owner update" on public.maintenance_log for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "maintenance owner delete" on public.maintenance_log for delete using (auth.uid() = user_id);

-- ============================================================================
-- DONE. Your tables are created, isolated per-user, and ready for sync.
-- ============================================================================
