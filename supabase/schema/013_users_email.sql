-- Login email for Clerk-linked staff; optional for display-only rows.

alter table public.users add column if not exists email text;

create unique index if not exists idx_users_email_unique
  on public.users (email) where email is not null;

comment on column public.users.email is 'Login email when linked to Clerk; optional for display-only staff.';
