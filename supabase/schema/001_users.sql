-- Phase 2: Internal users synced from Clerk (role: admin | estimator | office | read_only).
-- Used for job assignment and audit (changed_by, uploaded_by).

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  role text not null check (role in ('admin', 'estimator', 'office', 'read_only')),
  clerk_id text unique not null,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Admin platform users; synced from Clerk. Role controls access.';
create index if not exists idx_users_clerk_id on public.users (clerk_id);
create index if not exists idx_users_role on public.users (role);

alter table public.users enable row level security;

-- Only service role used from server for admin; no anon policies (admin routes use Clerk + service role).
create policy "Service role full access to users"
  on public.users for all
  to service_role
  using (true)
  with check (true);
