-- ============================================================================
-- AI DriveX — Marketing & Monetization Schema
-- ----------------------------------------------------------------------------
-- HOW TO RUN:
--   1. Open your Supabase project → SQL Editor → New query
--   2. Paste this ENTIRE file and click "Run"
--   3. It is idempotent — safe to run more than once.
--
-- WHAT IT DOES:
--   1) waitlist        — pre-launch email captures (anyone can join, only
--                        the service role / admins can read).
--   2) subscriptions   — paying customers from /checkout. Created by the
--                        server-side API using the service role. Each row
--                        carries currency, plan, card brand, status, and
--                        an optional auth.users link for logged-in buyers.
--   3) contact_leads   — WhatsApp/Calendly fallback when neither integration
--                        is yet wired up. Stores the message + a contact
--                        channel so support can follow up.
-- ============================================================================

-- Helper trigger reused from the main schema
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1) WAITLIST
-- ============================================================================
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  full_name   text,
  language    text default 'en' check (language in ('ar', 'en', 'fr')),
  country     text,
  source      text,
  user_agent  text,
  referrer    text,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists waitlist_created_idx on public.waitlist (created_at desc);
create index if not exists waitlist_email_idx   on public.waitlist (email);

-- ============================================================================
-- 2) SUBSCRIPTIONS
-- ============================================================================
create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users (id) on delete set null,
  email               text not null,
  full_name           text,
  plan                text not null default 'pro' check (plan in ('pro', 'basic')),
  currency            text not null check (currency in ('SAR', 'USD', 'EUR')),
  amount              numeric(10, 2) not null,
  vat_amount          numeric(10, 2) not null default 0,
  total_amount        numeric(10, 2) not null,
  status              text not null default 'pending'
                      check (status in ('pending', 'active', 'past_due', 'canceled', 'failed')),
  country             text,
  card_last4          text,
  card_brand          text,
  payment_provider    text default 'manual',
  payment_intent_id   text,
  starts_at           timestamptz,
  ends_at             timestamptz,
  canceled_at         timestamptz,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists subscriptions_user_idx     on public.subscriptions (user_id);
create index if not exists subscriptions_email_idx    on public.subscriptions (email);
create index if not exists subscriptions_status_idx   on public.subscriptions (status);
create index if not exists subscriptions_created_idx  on public.subscriptions (created_at desc);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3) CONTACT LEADS  — generic message intake (Contact section fallback)
-- ============================================================================
create table if not exists public.contact_leads (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  email        text,
  phone        text,
  message      text,
  channel      text check (channel in ('whatsapp', 'calendly', 'form', 'other')),
  language     text default 'en',
  user_agent   text,
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists contact_leads_created_idx on public.contact_leads (created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.waitlist       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.contact_leads  enable row level security;

-- ---------------- waitlist ----------------
-- Anyone can join the waitlist (anonymous insert is safe — email is unique).
drop policy if exists "waitlist public insert" on public.waitlist;
create policy "waitlist public insert"
  on public.waitlist for insert
  with check (true);

-- No public read — only the service role (server-side) can list emails.
-- (Add a policy here later if you need an authenticated admin to read.)

-- ---------------- subscriptions ----------------
-- Subscribers can read THEIR OWN subscription row(s).
drop policy if exists "subscriptions self read" on public.subscriptions;
create policy "subscriptions self read"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Writes are server-side only via the service role (which bypasses RLS).
-- No public INSERT/UPDATE policy is granted.

-- ---------------- contact_leads ----------------
-- Anonymous insert allowed so the Landing contact form works for guests.
drop policy if exists "contact_leads public insert" on public.contact_leads;
create policy "contact_leads public insert"
  on public.contact_leads for insert
  with check (true);

-- No public read.

-- ============================================================================
-- DONE.
-- ============================================================================
