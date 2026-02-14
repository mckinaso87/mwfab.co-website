-- Phase 2: Jobs linked to customers; workflow states and assignment.

create type public.job_status as enum (
  'To Bid',
  'In Takeoff',
  'Under Review',
  'Proposal Ready',
  'Sent',
  'Awarded',
  'Lost'
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  job_name text not null,
  description text,
  bid_due_date date,
  status public.job_status not null default 'To Bid',
  assigned_to uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.jobs is 'Jobs (bids); one per customer. Status drives workflow.';
create index if not exists idx_jobs_customer_id on public.jobs (customer_id);
create index if not exists idx_jobs_status on public.jobs (status);
create index if not exists idx_jobs_bid_due_date on public.jobs (bid_due_date);
create index if not exists idx_jobs_assigned_to on public.jobs (assigned_to);

alter table public.jobs enable row level security;

create policy "Service role full access to jobs"
  on public.jobs for all
  to service_role
  using (true)
  with check (true);

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();
