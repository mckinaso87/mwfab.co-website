# Post-build: Phase 1 summary and recommendations

## Folder structure summary

```
/app
  layout.tsx, page.tsx, not-found.tsx
  globals.css removed; styles in /styles/global.css
  /admin          — protected placeholder (Clerk)
  /api/contact    — contact form API (zod, Resend scaffold, honeypot)
  /about          — About page
  /contact        — Contact / Request a Bid page
  /projects       — Projects grid + filter scaffold (ProjectsGrid client)
  /services       — Services sections (structural, ornamental, misc, finishes)
  sitemap.ts, robots.ts
/components
  /layout         — Header, Footer
  /providers      — ClerkProvider
  /sections       — Hero, ServicesOverview, ServiceArea, WhyChooseUs, ProjectGalleryPreview, CtaSection, ContactForm
  /seo            — JsonLd
  /ui             — Button; /ui/icons — SteelBeamIcon, ColumnIcon, WeldingSparkIcon, StructuralFrameIcon
/lib
  utils.ts (cn), env.ts, data/projects.ts (placeholder)
  /supabase       — client.ts, server.ts
/public
  /images         — hero-placeholder.svg, project-placeholder.svg; /images/logo/logo.svg; /images/projects/
  /svg            — steel-beam, column, welding-spark, structural-frame SVGs
/styles
  global.css      — Tailwind, theme variables, gradients, prefers-reduced-motion
/docs             — README, future-schema.md, contact-form.md, post-build.md
/supabase         — .gitkeep (schema later in /supabase/schema/)
middleware.ts     — Clerk; protects /admin
```

## Dependency list

| Package | Purpose |
|--------|---------|
| next, react, react-dom | Core framework |
| tailwindcss, @tailwindcss/postcss | Styling |
| @clerk/nextjs | Auth scaffold; /admin protection |
| @supabase/supabase-js, @supabase/ssr | Supabase client (browser + server) |
| resend | Contact email scaffold (optional) |
| zod | Form/API validation |
| clsx, tailwind-merge | cn() for class names |
| typescript, eslint, eslint-config-next, @types/* | Dev/type-checking |

No UI component library (no MUI, Chakra, etc.). No emoji; custom SVG icons only.

## Lighthouse optimization notes

- **Done**: Server Components by default; minimal client components (form, mobile menu, project filter). `next/image` for all images with sizes. Single webfont (Geist). No heavy animation libs. Semantic HTML and heading hierarchy. Prefers-reduced-motion respected in CSS.
- **Tips**: Run Lighthouse on production build (`npm run build && npm run start`). Replace placeholder images with optimized assets (correct aspect ratios, WebP where appropriate). Consider adding an OG image for social sharing. Ensure `metadataBase` and canonical URLs match production domain.

## SEO checklist

| Item | Status |
|------|--------|
| Semantic HTML (main, section, nav, headings) | Yes |
| Single H1 per page, logical H2/H3 | Yes |
| Meta title/description per route | Yes |
| metadataBase (mwfab.co) | Yes |
| OpenGraph tags | Yes (layout + per-page where set) |
| Twitter card tags | Yes |
| JSON-LD (LocalBusiness / construction) | Yes, in layout |
| Sitemap (sitemap.ts) | Yes |
| robots.txt (robots.ts) | Yes, allow /, disallow /admin, /api |
| Clean URLs | Yes (/services, /projects, /about, /contact) |
| Keyword-aware copy | Yes (structural steel Florida, ornamental steel Florida, etc.) |

## Recommendations before production

1. **Environment**: Never commit `.env.local`. Use platform env (Vercel, etc.) for production. Restrict Clerk and Supabase keys by domain if supported.
2. **Domain**: Point mwfab.co to the deployment and set `metadataBase` if different from default.
3. **Analytics**: Add analytics (e.g. Vercel Analytics, Plausible, or GA4) if desired; prefer minimal script and privacy-friendly options.
4. **Error monitoring**: Consider Sentry or similar for runtime errors in production.
5. **Contact form**: Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` and uncomment the Resend send block in `app/api/contact/route.ts`. Optionally add rate limiting or Turnstile for anti-spam (see `docs/contact-form.md`).
6. **Assets**: Replace placeholder images and logo with final assets. Keep aspect ratios and use `next/image` with proper `sizes`.
7. **Phase 2**: When adding admin, CRM, or Supabase schema, follow `docs/future-schema.md` and keep schema in `/supabase/schema/` versioned and commented.
