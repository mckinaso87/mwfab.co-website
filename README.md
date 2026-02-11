# McKinados Welding & Fabrication (mwfab.co) — Phase 1

Production-grade Next.js marketing site and foundation for McKinados Welding & Fabrication. Phase 1 includes the public website, SEO, auth scaffold (Clerk), and Supabase scaffold. No admin platform logic.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys (Clerk, Supabase, optional Resend)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Run production build locally
- `npm run lint` — ESLint

## Environment variables

See `.env.example`. Required for full functionality:

- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — for `/admin` protection and sign-in.
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for future data; app runs without them in Phase 1.
- **Resend** (optional): `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — for contact form email delivery when enabled in the API route.

## Project structure

- **app/** — App Router routes, layouts, API routes. See `app/README.md`.
- **components/** — Layout (Header, Footer), sections, UI components. See `components/README.md`.
- **lib/** — Utils, env, Supabase client scaffold. See `lib/README.md`.
- **public/** — Static assets (images, logo, SVG). See `public/README.md`.
- **styles/** — Global CSS and theme. See `styles/README.md`.
- **docs/** — Architecture and future schema. See `docs/README.md` and `docs/future-schema.md`.

## Documentation

- [docs/future-schema.md](docs/future-schema.md) — Intended schema expansion (admin, CRM, takeoff, proposals, etc.).
- [docs/contact-form.md](docs/contact-form.md) — Contact form and anti-spam strategy.
- [docs/post-build.md](docs/post-build.md) — Folder summary, dependencies, Lighthouse, SEO checklist, production recommendations.

## Tech stack

- Next.js 16 (App Router), TypeScript (strict), Tailwind CSS
- Clerk (auth scaffold), Supabase (client scaffold), Resend (scaffold)
- No heavy UI libraries; custom SVG icons only
