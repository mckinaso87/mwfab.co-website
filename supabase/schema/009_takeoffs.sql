-- Phase 3: Takeoff and proposal schema (grand-totals layout). One takeoff per job.

create table if not exists public.takeoffs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  quote_date date,
  quoted_by text,
  tax_rate numeric not null default 0.07,
  margin_rate numeric not null default 0.2,
  notes text,
  -- Stored totals (recomputed on save)
  metal_subtotal numeric default 0,
  other_material_subtotal numeric default 0,
  all_material_subtotal numeric default 0,
  tax_total numeric default 0,
  material_total_with_tax numeric default 0,
  -- Shop labor
  shop_labor_hours numeric,
  shop_labor_rate numeric,
  shop_days_or_nights numeric,
  shop_labor_amount numeric default 0,
  shop_drawings_amount numeric default 0,
  shop_total numeric default 0,
  -- Field labor
  field_labor_amount numeric,
  field_labor_rate numeric,
  field_days_or_nights numeric,
  field_labor_total numeric default 0,
  field_total numeric default 0,
  -- Grand
  project_total numeric default 0,
  with_pct_total numeric default 0,
  grand_total numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id)
);

comment on table public.takeoffs is 'One takeoff/proposal per job; totals stored for display and PDF.';
create index if not exists idx_takeoffs_job_id on public.takeoffs (job_id);

alter table public.takeoffs enable row level security;
create policy "Service role full access to takeoffs"
  on public.takeoffs for all to service_role using (true) with check (true);

create trigger takeoffs_updated_at
  before update on public.takeoffs
  for each row execute function public.set_updated_at();

-- Metal lines (linked catalog + other metals)
create table if not exists public.takeoff_metal_lines (
  id uuid primary key default gen_random_uuid(),
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  material_catalog_id uuid references public.material_catalog (id) on delete set null,
  category text not null check (category in (
    'angles', 'wide_flange', 'bars_hr_rounds', 'bars_cf_rounds', 'bars_flat',
    'channels', 'mc_channels', 'pipe', 'tube', 'other'
  )),
  display_name text not null,
  count numeric default 1,
  total_length_ft numeric,
  total_pounds_per_piece numeric,
  total_pounds numeric,
  cost_per_unit numeric,
  total_price numeric default 0,
  sort_order int not null default 0
);

comment on table public.takeoff_metal_lines is 'Metal lines per takeoff; catalog-linked or other (custom).';
create index if not exists idx_takeoff_metal_lines_takeoff_id on public.takeoff_metal_lines (takeoff_id);
create index if not exists idx_takeoff_metal_lines_sort on public.takeoff_metal_lines (takeoff_id, sort_order);

alter table public.takeoff_metal_lines enable row level security;
create policy "Service role full access to takeoff_metal_lines"
  on public.takeoff_metal_lines for all to service_role using (true) with check (true);

-- Component lines
create table if not exists public.takeoff_component_lines (
  id uuid primary key default gen_random_uuid(),
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  display_name text not null,
  count numeric default 1,
  total_pounds_per_piece numeric,
  total_pounds numeric,
  cost_per_measure numeric,
  total_price numeric default 0,
  sort_order int not null default 0
);

create index if not exists idx_takeoff_component_lines_takeoff_id on public.takeoff_component_lines (takeoff_id);
alter table public.takeoff_component_lines enable row level security;
create policy "Service role full access to takeoff_component_lines"
  on public.takeoff_component_lines for all to service_role using (true) with check (true);

-- Miscellaneous materials (Galvanizer, paint, concrete, etc.)
create table if not exists public.takeoff_misc_lines (
  id uuid primary key default gen_random_uuid(),
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  label text not null,
  amount numeric,
  weight_of_galv numeric,
  price_per numeric,
  total_price numeric default 0,
  sort_order int not null default 0
);

create index if not exists idx_takeoff_misc_lines_takeoff_id on public.takeoff_misc_lines (takeoff_id);
alter table public.takeoff_misc_lines enable row level security;
create policy "Service role full access to takeoff_misc_lines"
  on public.takeoff_misc_lines for all to service_role using (true) with check (true);

-- Field miscellaneous (crane, fuel, transport, per diem, lodging)
create table if not exists public.takeoff_field_misc (
  id uuid primary key default gen_random_uuid(),
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  label text not null,
  amount numeric,
  price_per numeric,
  hrs_days_nights text,
  total numeric default 0,
  sort_order int not null default 0
);

create index if not exists idx_takeoff_field_misc_takeoff_id on public.takeoff_field_misc (takeoff_id);
alter table public.takeoff_field_misc enable row level security;
create policy "Service role full access to takeoff_field_misc"
  on public.takeoff_field_misc for all to service_role using (true) with check (true);
