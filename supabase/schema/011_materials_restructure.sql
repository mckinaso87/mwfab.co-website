-- Materials restructure: catalog categories, field config, plate/galv takeoff lines.

-- a) Drop old constraints and policies
drop policy if exists "Service role full access to material_catalog" on public.material_catalog;

alter table public.takeoff_metal_lines drop constraint if exists takeoff_metal_lines_category_check;

-- b) Recreate material_catalog (data re-seeded via scripts/seed-material-catalog.ts)
drop table if exists public.material_catalog cascade;

create table public.material_catalog (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'angle','wide_flange','round_bar','flat_bar','channel','mc_channel','pipe','tube'
  )),
  item_code text not null,
  shorthand_code text not null,
  size_label text,
  finish text,
  dimensions jsonb,
  weight_per_ft numeric,
  cost_per_lb numeric,
  cost_per_foot numeric,
  pricing_unit text not null check (pricing_unit in ('per_lb','per_foot')),
  is_active boolean not null default true,
  source_file text,
  created_at timestamptz not null default now(),
  unique (category, item_code)
);

comment on table public.material_catalog is 'Base materials from data/materials CSVs; shorthand search for takeoff entry.';
comment on column public.material_catalog.shorthand_code is 'Industry shorthand e.g. L4x4x1/4, W12x30, HSS4x4x1/4';
comment on column public.material_catalog.size_label is 'Pretty display e.g. L 4×4×¼';
comment on column public.material_catalog.finish is 'HR or CF for round_bar only';
comment on column public.material_catalog.dimensions is 'Internal section properties only; not shown to operators by default';

create index idx_material_catalog_category_active on public.material_catalog (category, is_active);
create index idx_material_catalog_shorthand on public.material_catalog (shorthand_code);
create index idx_material_catalog_category_finish on public.material_catalog (category, finish);

alter table public.material_catalog enable row level security;

create policy "Service role full access to material_catalog"
  on public.material_catalog for all
  to service_role
  using (true)
  with check (true);

-- c) material_field_config
create table if not exists public.material_field_config (
  category text not null,
  field_key text not null,
  label text not null,
  show_in_takeoff boolean not null default true,
  sort_order int not null default 0,
  unique (category, field_key)
);

comment on table public.material_field_config is 'Operator-visible fields per catalog category in takeoff search results.';

alter table public.material_field_config enable row level security;

create policy "Service role full access to material_field_config"
  on public.material_field_config for all
  to service_role
  using (true)
  with check (true);

insert into public.material_field_config (category, field_key, label, show_in_takeoff, sort_order) values
  ('angle', 'size_a', 'Size A', true, 0),
  ('angle', 'size_b', 'Size B', true, 1),
  ('angle', 'size_c', 'Size C', true, 2),
  ('wide_flange', 'section_number', 'W', true, 0),
  ('wide_flange', 'weight_per_ft', '× lb/ft', true, 1),
  ('round_bar', 'size_a', 'Size', true, 0),
  ('round_bar', 'finish', 'Finish', true, 1),
  ('flat_bar', 'size_a', 'Thickness', true, 0),
  ('flat_bar', 'size_b', 'Width', true, 1),
  ('channel', 'section_depth_a', 'Depth', true, 0),
  ('channel', 'weight_per_ft', 'Weight/ft', true, 1),
  ('mc_channel', 'section_depth_a', 'Depth', true, 0),
  ('mc_channel', 'weight_per_ft', 'Weight/ft', true, 1),
  ('pipe', 'pipe_size', 'Pipe size', true, 0),
  ('pipe', 'schedule', 'Schedule', true, 1),
  ('tube', 'width', 'Width', true, 0),
  ('tube', 'height', 'Height', true, 1),
  ('tube', 'gauge', 'Gauge', true, 2)
on conflict (category, field_key) do nothing;

-- d) Migrate takeoff_metal_lines categories
update public.takeoff_metal_lines set category = 'angle' where category = 'angles';
update public.takeoff_metal_lines set category = 'round_bar' where category in ('bars_hr_rounds', 'bars_cf_rounds');
update public.takeoff_metal_lines set category = 'flat_bar' where category = 'bars_flat';
update public.takeoff_metal_lines set category = 'channel' where category = 'channels';
update public.takeoff_metal_lines set category = 'mc_channel' where category = 'mc_channels';

alter table public.takeoff_metal_lines
  add constraint takeoff_metal_lines_category_check check (category in (
    'angle','wide_flange','round_bar','flat_bar','channel','mc_channel','pipe','tube','plate','other'
  ));

-- e) Galv and plate columns on metal lines
alter table public.takeoff_metal_lines
  add column if not exists is_galvanized boolean not null default false,
  add column if not exists galv_length_ft numeric,
  add column if not exists galv_pounds numeric,
  add column if not exists plate_thickness_in numeric,
  add column if not exists plate_width_in numeric,
  add column if not exists plate_height_in numeric;

-- f) Takeoff header: scope, galvanization, plate default cost
alter table public.takeoffs
  add column if not exists scope_type text not null default 'furnish_only'
    check (scope_type in ('furnish_only','furnish_and_install')),
  add column if not exists galv_mode text not null default 'not_galvanized'
    check (galv_mode in ('not_galvanized','baked_in','optional_addon')),
  add column if not exists galv_total_override numeric,
  add column if not exists galv_addon_amount numeric default 0,
  add column if not exists plate_default_cost_per_lb numeric default 1.10;
