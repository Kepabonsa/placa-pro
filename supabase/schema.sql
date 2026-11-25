-- PlacaPro database schema (Supabase / PostgreSQL 15+).
-- Tables: profiles, vehicle_cache, lookup_jobs, credit_ledger, deal_calculations.
-- Credit movements only happen through the atomic RPCs at the end of this file, which are
-- executable by service_role only (the Next.js server), never directly by browser clients.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles: one row per auth user, holds the credit balance
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  business_name text,
  phone text,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. vehicle_cache: provider responses shared across users (server-only access)
-- ---------------------------------------------------------------------------

create table public.vehicle_cache (
  plate text primary key check (plate ~ '^[A-Z]{3}[0-9]{2}[0-9A-Z]$'),
  provider text not null check (provider in ('mock', 'placapi')),
  report jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint vehicle_cache_expiry_after_fetch check (expires_at > fetched_at)
);

create index vehicle_cache_expires_at_idx on public.vehicle_cache (expires_at);

-- ---------------------------------------------------------------------------
-- 3. lookup_jobs: every plate query a user makes (audit + per-user report snapshot)
-- ---------------------------------------------------------------------------

create table public.lookup_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plate text not null check (plate ~ '^[A-Z]{3}[0-9]{2}[0-9A-Z]$'),
  owner_document text check (owner_document ~ '^[0-9]{5,10}$'),
  query_mode text not null check (query_mode in ('full', 'plate_only')),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  source text check (source in ('provider', 'cache')),
  credits_charged integer not null default 0 check (credits_charged >= 0),
  traffic_light text check (traffic_light in ('green', 'yellow', 'red')),
  vehicle_label text,
  report jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint lookup_jobs_full_requires_document
    check (query_mode <> 'full' or owner_document is not null),
  constraint lookup_jobs_completed_has_result
    check (status <> 'completed' or (report is not null and traffic_light is not null and source is not null))
);

create index lookup_jobs_user_plate_created_idx
  on public.lookup_jobs (user_id, plate, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. credit_ledger: append-only history of credit movements
-- ---------------------------------------------------------------------------

create table public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lookup_id uuid references public.lookup_jobs (id) on delete set null,
  delta integer not null check (delta <> 0),
  reason text not null
    check (reason in ('initial_grant', 'purchase', 'lookup_charge', 'lookup_refund', 'adjustment')),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);

create index credit_ledger_user_created_idx on public.credit_ledger (user_id, created_at desc);

-- A lookup can be refunded at most once.
create unique index credit_ledger_single_refund_idx
  on public.credit_ledger (lookup_id)
  where reason = 'lookup_refund';

-- ---------------------------------------------------------------------------
-- 5. deal_calculations: one negotiation per user and plate (offer inputs + commercial tag)
-- ---------------------------------------------------------------------------

create table public.deal_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plate text not null check (plate ~ '^[A-Z]{3}[0-9]{2}[0-9A-Z]$'),
  lookup_id uuid references public.lookup_jobs (id) on delete set null,
  market_value bigint not null default 0 check (market_value >= 0),
  detected_debts bigint not null default 0 check (detected_debts >= 0),
  transfer_cost bigint not null default 0 check (transfer_cost >= 0),
  repair_costs bigint not null default 0 check (repair_costs >= 0),
  target_margin_percent numeric(5, 2) not null default 10
    check (target_margin_percent between 0 and 100),
  max_offer bigint not null default 0 check (max_offer >= 0),
  deal_tag text not null default 'new'
    check (deal_tag in ('new', 'negotiating', 'bought', 'discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deal_calculations_user_plate_key unique (user_id, plate)
);

create index deal_calculations_user_tag_idx
  on public.deal_calculations (user_id, deal_tag, updated_at desc);

create trigger deal_calculations_set_updated_at
before update on public.deal_calculations
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.vehicle_cache enable row level security;
alter table public.lookup_jobs enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.deal_calculations enable row level security;

-- Anonymous visitors never touch these tables.
revoke all on public.profiles, public.vehicle_cache, public.lookup_jobs,
  public.credit_ledger, public.deal_calculations from anon;

-- profiles: read own row; update only contact fields (never credit_balance).
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, business_name, phone) on public.profiles to authenticated;

-- vehicle_cache: no policies and no grants; only service_role (bypasses RLS) can use it.
revoke all on public.vehicle_cache from authenticated;

-- lookup_jobs: read own history; writes only through RPCs / service_role.
create policy lookup_jobs_select_own on public.lookup_jobs
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.lookup_jobs from authenticated;

-- credit_ledger: read own movements; writes only through RPCs.
create policy credit_ledger_select_own on public.credit_ledger
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.credit_ledger from authenticated;

-- deal_calculations: full CRUD on own rows, linked only to own lookups.
create policy deal_calculations_select_own on public.deal_calculations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy deal_calculations_insert_own on public.deal_calculations
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      lookup_id is null
      or exists (
        select 1 from public.lookup_jobs as lookup
        where lookup.id = lookup_id and lookup.user_id = (select auth.uid())
      )
    )
  );

create policy deal_calculations_update_own on public.deal_calculations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      lookup_id is null
      or exists (
        select 1 from public.lookup_jobs as lookup
        where lookup.id = lookup_id and lookup.user_id = (select auth.uid())
      )
    )
  );

create policy deal_calculations_delete_own on public.deal_calculations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Atomic RPCs (service_role only)
-- ---------------------------------------------------------------------------

-- Debits credits (if any), writes the ledger entry and creates the pending lookup in a single
-- transaction. The profile row is locked so concurrent lookups cannot overdraw the balance.
-- p_credits = 0 is valid (cache hits are free). Raises INSUFFICIENT_CREDITS when the balance is low.
create or replace function public.create_lookup_with_credits(
  p_user_id uuid,
  p_plate text,
  p_query_mode text,
  p_owner_document text,
  p_credits integer
)
returns public.lookup_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance integer;
  v_job public.lookup_jobs;
begin
  if p_credits is null or p_credits < 0 then
    raise exception 'INVALID_CREDITS' using errcode = '22023';
  end if;

  select credit_balance into v_balance
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_balance < p_credits then
    raise exception 'INSUFFICIENT_CREDITS'
      using errcode = 'P0001', detail = format('balance=%s required=%s', v_balance, p_credits);
  end if;

  insert into public.lookup_jobs (user_id, plate, owner_document, query_mode, credits_charged)
  values (p_user_id, p_plate, p_owner_document, p_query_mode, p_credits)
  returning * into v_job;

  if p_credits > 0 then
    update public.profiles
    set credit_balance = credit_balance - p_credits
    where id = p_user_id;

    insert into public.credit_ledger (user_id, lookup_id, delta, reason, balance_after)
    values (p_user_id, v_job.id, -p_credits, 'lookup_charge', v_balance - p_credits);
  end if;

  return v_job;
end;
$$;

-- Returns the credits of a pending/failed lookup and marks it as refunded. Idempotent: a second
-- call returns 0 without moving credits. Completed lookups cannot be refunded.
create or replace function public.refund_lookup_credits(
  p_lookup_id uuid,
  p_reason text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.lookup_jobs;
  v_balance integer;
begin
  select * into v_job
  from public.lookup_jobs
  where id = p_lookup_id
  for update;

  if not found then
    raise exception 'LOOKUP_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_job.status = 'refunded' then
    return 0;
  end if;

  if v_job.status = 'completed' then
    raise exception 'LOOKUP_ALREADY_COMPLETED' using errcode = 'P0001';
  end if;

  update public.lookup_jobs
  set status = 'refunded', error_message = p_reason, completed_at = now()
  where id = p_lookup_id;

  if v_job.credits_charged > 0 then
    update public.profiles
    set credit_balance = credit_balance + v_job.credits_charged
    where id = v_job.user_id
    returning credit_balance into v_balance;

    insert into public.credit_ledger (user_id, lookup_id, delta, reason, balance_after)
    values (v_job.user_id, v_job.id, v_job.credits_charged, 'lookup_refund', v_balance);
  end if;

  return v_job.credits_charged;
end;
$$;

revoke all on function public.create_lookup_with_credits(uuid, text, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.refund_lookup_credits(uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_lookup_with_credits(uuid, text, text, text, integer)
  to service_role;
grant execute on function public.refund_lookup_credits(uuid, text) to service_role;

-- Trigger helpers are not callable through the API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
