# Schema migrations (Phase 2+)

Run in order: `001_users.sql` → `002_customers.sql` → `003_jobs.sql` → `004_job_files.sql` → `005_job_status_history.sql` → `006_storage_bucket.sql` → `007_users_optional_clerk.sql`.

**Apply via Supabase Dashboard:** SQL Editor → paste and run each file in order.

**Or via CLI:** If using `supabase link`, run `supabase db push` with migrations in `supabase/migrations/`; copy these files there and name with version prefix (e.g. `20240214000001_users.sql`) as needed.

After applying, set `SUPABASE_SERVICE_ROLE_KEY` in your env (Project Settings → API in Supabase dashboard) so admin server code can perform CRUD.
