# app

App Router routes and layouts for mwfab.co.

## Structure

- **layout.tsx** — Root layout: metadata, ClerkProvider, global CSS.
- **page.tsx** — Home page.
- **not-found.tsx** — 404 page.
- **/(public)** — Optional route group for public pages (services, projects, about, contact).
- **/admin** — Protected placeholder; no admin logic in Phase 1.
- **/api** — API routes (e.g. contact form, Resend scaffold).

## Conventions

- Use Server Components by default. Add `"use client"` only for form, mobile menu, or filter UI.
- One H1 per page; semantic headings H2/H3.
- Per-route metadata via `metadata` or `generateMetadata`.
