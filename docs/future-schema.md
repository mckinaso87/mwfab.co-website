# Future Schema & Expansion

This document describes the intended database and product expansion beyond Phase 1. **No schema or migrations are created in Phase 1.** When added, SQL and migrations will live under `/supabase/schema/`, versioned and commented.

## Intended Expansion Areas

- **Internal Admin Platform** — Dashboard, user roles, and configuration. Auth is scaffolded with Clerk; admin UI and logic come in a later phase.
- **Customer Management** — Customers, contacts, and project associations. Schema will support CRM-style entities without blocking current placeholder data.
- **Takeoff Engine** — Quantities and measurements for estimates. Tables for takeoff line items, units, and links to projects/proposals.
- **Material Catalog** — Products, materials, and pricing. Structured so that proposals can reference catalog items.
- **Proposal Generation** — Proposals and quotes tied to projects and customers. Workflow states (draft, sent, accepted, etc.).
- **Workflow States** — Status and stage for projects, proposals, and jobs. Kept generic to allow different pipelines.
- **Reporting Dashboard** — Aggregations and reports (e.g. by period, by customer, by project type). Read-optimized views or tables as needed.

## Schema Location

- All SQL migrations and schema definitions: **`/supabase/schema/`**
- Naming: versioned, descriptive (e.g. `001_initial.sql`, `002_customers.sql`).
- Comment all tables and important columns so future changes stay clear.

## Phase 1 Constraints

- Do not hardcode data structures in the app that conflict with the above (e.g. project data is placeholder in `lib/data/projects.ts` and can be replaced by Supabase without refactoring page structure).
- Supabase client is scaffolded in `lib/supabase/`; use it once schema exists.
