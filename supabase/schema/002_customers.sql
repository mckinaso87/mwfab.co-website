-- Phase 2: Customers for jobs and future proposals.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.customers is 'Customers; linked to jobs.';
create index if not exists idx_customers_company_name on public.customers (company_name);

alter table public.customers enable row level security;

create policy "Service role full access to customers"
  on public.customers for all
  to service_role
  using (true)
  with check (true);
