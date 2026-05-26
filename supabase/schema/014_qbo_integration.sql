-- Phase 1: QuickBooks Online OAuth + one-way customer/estimate sync

create table if not exists public.qbo_connections (
  id uuid primary key default gen_random_uuid(),
  realm_id text not null unique,
  company_name text,
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz,
  connected_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.qbo_connections is 'Single-company QBO OAuth tokens (encrypted at app layer).';

alter table public.customers
  add column if not exists qbo_customer_id text,
  add column if not exists qbo_sync_token text,
  add column if not exists qbo_synced_at timestamptz,
  add column if not exists qbo_sync_error text;

create index if not exists idx_customers_qbo_customer_id
  on public.customers (qbo_customer_id) where qbo_customer_id is not null;

alter table public.proposals
  add column if not exists qbo_estimate_id text,
  add column if not exists qbo_sync_token text,
  add column if not exists qbo_synced_at timestamptz,
  add column if not exists qbo_sync_error text;

create index if not exists idx_proposals_qbo_estimate_id
  on public.proposals (qbo_estimate_id) where qbo_estimate_id is not null;

-- One QBO anchor row per takeoff (estimate re-push updates same row)
create unique index if not exists idx_proposals_takeoff_qbo_anchor
  on public.proposals (takeoff_id) where qbo_estimate_id is not null;

alter table public.qbo_connections enable row level security;

create policy "Service role full access to qbo_connections"
  on public.qbo_connections for all
  to service_role
  using (true)
  with check (true);

create trigger qbo_connections_updated_at
  before update on public.qbo_connections
  for each row execute function public.set_updated_at();
