# Future Schema & Expansion

This document describes the database and product expansion. SQL migrations live under **`/supabase/schema/`**, versioned and commented.

---

## Phased Roadmap

| Phase | Focus | Status |
|-------|--------|--------|
| **Phase 1** | Public website + scaffold | Done |
| **Phase 2** | Admin Core (customers, jobs, workflow, files, dashboard) | **Implemented** |
| **Phase 3** | Takeoff & Material Engine (`/data/materials/` catalog, weight-per-ft, buffers, line items) | Planned |
| **Phase 4** | Proposal automation (PDF, buffers, Resend, versioning) | Planned |
| **Phase 5** | AI assist (suggestions, consistency checks, alerts, analytics) | Planned |

**Principle:** Build the most logical next step first; do not complete the next big phase until the current build phase is validated.

---

## Phase 2 (Admin Core) — Implemented

Phase 2 provides the structural backbone: customer management, job management, workflow states, cloud file storage, role-based access, and dashboard visibility. No takeoff engine, material catalog, or proposal generation yet.

### Tables (Supabase)

- **users** — `id`, `name`, `role`, `clerk_id`, `created_at`. Synced from Clerk; role: `admin` \| `estimator` \| `office` \| `read_only`.
- **customers** — `id`, `company_name`, `contact_name`, `email`, `phone`, `address`, `notes`, `created_at`.
- **jobs** — `id`, `customer_id` (FK), `job_name`, `description`, `bid_due_date`, `status`, `assigned_to` (FK users), `created_at`, `updated_at`.
- **job_files** — `id`, `job_id` (FK), `file_url` (storage path), `file_name`, `uploaded_by` (FK users), `created_at`. Files live in Supabase Storage bucket `job-files`.
- **job_status_history** — `id`, `job_id` (FK), `previous_status`, `new_status`, `changed_by`, `timestamp`. Audit trail for status changes.

### Workflow states (job status)

`To Bid` \| `In Takeoff` \| `Under Review` \| `Proposal Ready` \| `Sent` \| `Awarded` \| `Lost`.

### Auth & access

- Clerk protects `/admin` and children; only users with `publicMetadata.role` in `admin`, `estimator`, `office` can access.
- Supabase CRUD uses the **service role** client (`lib/supabase/admin.ts`) from server actions and RSC so RLS is bypassed; policies are in place for future anon-key use.

### Routes

- `/admin` → redirects to `/admin/dashboard`
- `/admin/dashboard` — open bids, jobs by status, overdue bids, jobs per estimator, recent uploads
- `/admin/customers` — list; `/admin/customers/new`, `/admin/customers/[id]`
- `/admin/jobs` — list (filter by status); `/admin/jobs/new`, `/admin/jobs/[id]` (detail, files, status history)

---

## Phase 3 and beyond

- **Phase 3 — Takeoff & Material Engine:** Master material catalog seeded from **`/data/materials/`** (see that folder’s README), weight-per-foot logic, pricing buffers, line-item modeling, material summaries. This is where the core IP (expert judgment → repeatable systems) starts.
- **Phase 4 — Proposal automation:** Auto-generate PDF proposals, buffer logic, margin visibility, send via Resend, version tracking.
- **Phase 5 — AI assist:** Suggestions, consistency checks, price alerts, historical comparison, productivity analytics.

---

## Intended expansion areas (reference)

- **Customer Management** — Implemented in Phase 2.
- **Job Management & Workflow** — Implemented in Phase 2.
- **Takeoff Engine** — Phase 3; quantities, units, links to jobs/proposals.
- **Material Catalog** — Phase 3; source data in `/data/materials/`.
- **Proposal Generation** — Phase 4; proposals and quotes tied to jobs/customers.
- **Reporting Dashboard** — Phase 2 dashboard is operational; extended reporting in later phases.

---

## Schema location

- Migrations: **`/supabase/schema/`** — `001_users.sql` through `006_storage_bucket.sql`.
- Apply via Supabase Dashboard SQL Editor (run in order) or via `supabase db push` if using the CLI.
- **Service role key:** Set `SUPABASE_SERVICE_ROLE_KEY` in env for admin server code.
