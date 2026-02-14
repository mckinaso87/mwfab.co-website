-- Phase 2: Audit trail for job status changes.

create table if not exists public.job_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  previous_status public.job_status,
  new_status public.job_status not null,
  changed_by uuid references public.users (id) on delete set null,
  timestamp timestamptz not null default now()
);

comment on table public.job_status_history is 'Audit log of job status changes.';
create index if not exists idx_job_status_history_job_id on public.job_status_history (job_id);
create index if not exists idx_job_status_history_timestamp on public.job_status_history (timestamp desc);

alter table public.job_status_history enable row level security;

create policy "Service role full access to job_status_history"
  on public.job_status_history for all
  to service_role
  using (true)
  with check (true);
