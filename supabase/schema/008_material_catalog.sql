-- Phase 3: Material catalog seeded from data/materials/*.csv for takeoff and proposal calculations.

create table if not exists public.material_catalog (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'angles', 'wide_flange', 'bars_hr_rounds', 'bars_cf_rounds', 'bars_flat',
    'channels', 'mc_channels', 'pipe', 'tube'
  )),
  item_code text not null,
  display_name text,
  dimensions jsonb,
  weight_per_ft numeric,
  cost_per_lb numeric,
  cost_per_foot numeric,
  pricing_unit text not null check (pricing_unit in ('per_lb', 'per_foot')),
  source_file text,
  created_at timestamptz not null default now(),
  unique (category, item_code)
);

comment on table public.material_catalog is 'Base materials from data/materials CSVs; used for takeoff metal lines and pricing.';
create index if not exists idx_material_catalog_category on public.material_catalog (category);
create index if not exists idx_material_catalog_item_code on public.material_catalog (item_code);

alter table public.material_catalog enable row level security;

create policy "Service role full access to material_catalog"
  on public.material_catalog for all
  to service_role
  using (true)
  with check (true);
