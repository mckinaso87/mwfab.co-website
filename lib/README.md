# lib

Shared utilities and integrations.

## Contents

- **utils.ts** — `cn()` and other helpers.
- **env.ts** — Centralized env access and validation.
- **supabase/** — Browser and server Supabase clients (scaffold). Future schema lives in `/supabase/schema/`.

## Conventions

- No business logic that belongs in components or API routes.
- Env: use `env` from `env.ts` instead of `process.env` directly.
