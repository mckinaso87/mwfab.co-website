-- Allow staff to be added from the admin panel without a Clerk account.
-- Staff with clerk_id NULL are internal-only (name + role for job assignment).

alter table public.users
  alter column clerk_id drop not null;

comment on column public.users.clerk_id is 'Clerk user ID when linked to Clerk; NULL for staff added in admin only.';
