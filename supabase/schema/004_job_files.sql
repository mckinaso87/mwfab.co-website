-- Phase 2: File references for jobs (actual files in Supabase Storage).

create table if not exists public.job_files (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  file_url text not null,
  file_name text not null,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.job_files is 'Files attached to jobs; file_url points to Storage.';
create index if not exists idx_job_files_job_id on public.job_files (job_id);

alter table public.job_files enable row level security;

create policy "Service role full access to job_files"
  on public.job_files for all
  to service_role
  using (true)
  with check (true);
