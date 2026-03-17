-- Phase 4: Track sent proposals per customer (one row per send).

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  sent_at timestamptz not null default now(),
  recipient_email text not null,
  subject text,
  created_at timestamptz not null default now()
);

comment on table public.proposals is 'One row per proposal email sent; links to customer, job, takeoff for history.';
create index if not exists idx_proposals_customer_id on public.proposals (customer_id);
create index if not exists idx_proposals_job_id on public.proposals (job_id);
create index if not exists idx_proposals_takeoff_id on public.proposals (takeoff_id);
create index if not exists idx_proposals_sent_at on public.proposals (sent_at desc);

alter table public.proposals enable row level security;
create policy "Service role full access to proposals"
  on public.proposals for all to service_role using (true) with check (true);
