-- Proposals phase 2: jobs date_of_plan, per-line scope, pricing breakdown, misc hours/days,
-- section notes, settings (terms + exclusions), metal other_unit.

-- 1. Jobs: date of plan
alter table public.jobs
  add column if not exists date_of_plan date;

-- 2. Drop takeoff-level scope; add per-line scope
alter table public.takeoffs drop column if exists scope_type;

alter table public.takeoff_metal_lines
  add column if not exists scope text not null default 'furnish_install'
    check (scope in ('furnish','furnish_install'));

alter table public.takeoff_component_lines
  add column if not exists scope text not null default 'furnish_install'
    check (scope in ('furnish','furnish_install'));

alter table public.takeoff_misc_lines
  add column if not exists scope text not null default 'furnish_install'
    check (scope in ('furnish','furnish_install'));

alter table public.takeoff_field_misc
  add column if not exists scope text not null default 'furnish_install'
    check (scope in ('furnish','furnish_install'));

update public.takeoff_metal_lines set scope = 'furnish_install' where scope is null;
update public.takeoff_component_lines set scope = 'furnish_install' where scope is null;
update public.takeoff_misc_lines set scope = 'furnish_install' where scope is null;
update public.takeoff_field_misc set scope = 'furnish_install' where scope is null;

-- 3. Pricing breakdown columns on takeoffs
alter table public.takeoffs
  add column if not exists drawings_total numeric not null default 0,
  add column if not exists install_total numeric not null default 0,
  add column if not exists misc_total numeric not null default 0;

-- 4. Misc / field misc: hours, days, rates
alter table public.takeoff_misc_lines
  add column if not exists hours numeric,
  add column if not exists days numeric,
  add column if not exists rate_per_hour numeric,
  add column if not exists rate_per_day numeric;

alter table public.takeoff_field_misc
  add column if not exists hours numeric,
  add column if not exists days numeric,
  add column if not exists rate_per_hour numeric,
  add column if not exists rate_per_day numeric;

-- 5. Metal other unit
alter table public.takeoff_metal_lines
  add column if not exists other_unit text check (other_unit in ('lbs','ft'));

-- 6. Section notes
create table if not exists public.takeoff_section_notes (
  id uuid primary key default gen_random_uuid(),
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  section text not null check (section in (
    'metal','components','materials_misc','field_misc','drawings','shop','install','general'
  )),
  note text not null default '',
  include_in_proposal boolean not null default true,
  unique (takeoff_id, section)
);

create index if not exists idx_takeoff_section_notes_takeoff_id on public.takeoff_section_notes (takeoff_id);

alter table public.takeoff_section_notes enable row level security;

create policy "Service role full access to takeoff_section_notes"
  on public.takeoff_section_notes for all
  to service_role
  using (true)
  with check (true);

-- 7. Settings: terms
create table if not exists public.settings_terms (
  id uuid primary key default gen_random_uuid(),
  version int not null default 1,
  body_md text not null default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.settings_terms enable row level security;

create policy "Service role full access to settings_terms"
  on public.settings_terms for all
  to service_role
  using (true)
  with check (true);

-- 8. Settings: exclusions
create table if not exists public.settings_exclusions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  body text not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

alter table public.settings_exclusions enable row level security;

create policy "Service role full access to settings_exclusions"
  on public.settings_exclusions for all
  to service_role
  using (true)
  with check (true);

-- 9. Takeoff exclusions junction
create table if not exists public.takeoff_exclusions (
  takeoff_id uuid not null references public.takeoffs (id) on delete cascade,
  exclusion_id uuid not null references public.settings_exclusions (id) on delete cascade,
  primary key (takeoff_id, exclusion_id)
);

alter table public.takeoff_exclusions enable row level security;

create policy "Service role full access to takeoff_exclusions"
  on public.takeoff_exclusions for all
  to service_role
  using (true)
  with check (true);

-- 10. Seed default terms (only if none active)
insert into public.settings_terms (version, body_md, is_active)
select 1, $terms$
## 1. Proposal validity

This proposal is valid for thirty (30) days from the quote date shown above unless otherwise noted. Prices are subject to change after that period based on material availability, labor rates, and scope revisions.

## 2. Scope of work

The scope of work is limited to the items and quantities described in this proposal. Any work not expressly listed is excluded unless added by written change order signed by both parties.

## 3. Payment terms

A deposit may be required before fabrication begins. Progress payments may be invoiced at agreed milestones. Final payment is due upon substantial completion unless other terms are agreed in writing. Late payments may incur interest at the maximum rate permitted by law.

## 4. Changes and extras

Changes to scope, drawings, or specifications after acceptance may result in additional cost and schedule impact. Extras will be quoted and approved in writing before work proceeds.

## 5. Schedule and delays

Estimated schedules are based on information available at the time of proposal. McKinado's Welding & Fabrication is not responsible for delays caused by weather, permitting, owner-directed changes, material shortages, or other conditions beyond our reasonable control.

## 6. Warranty

Structural welding and fabrication are performed in accordance with applicable codes and standards specified in the contract documents. Warranty is limited to correction of defective workmanship attributable to McKinado's Welding & Fabrication for a period of one (1) year from substantial completion, excluding normal wear, misuse, or modifications by others.

## 7. Insurance and liability

McKinado's Welding & Fabrication maintains general liability and workers compensation insurance as required for our operations. Our liability is limited to the contract amount for work performed under this proposal except where prohibited by law.

## 8. Acceptance

Acceptance of this proposal constitutes agreement to these terms and the scope described herein. This proposal, when signed, becomes part of the binding agreement between McKinado's Welding & Fabrication, LLC and the customer named above.
$terms$, true
where not exists (select 1 from public.settings_terms where is_active = true);

-- 11. Seed default exclusions
insert into public.settings_exclusions (label, body, is_active, sort_order)
select v.label, v.body, true, v.sort_order
from (values
  ('Painting beyond shop primer', 'Field painting, specialty coatings, or finish systems beyond standard shop primer are excluded unless listed.', 1),
  ('Engineering / stamped drawings', 'Structural engineering, PE-stamped drawings, and design services are excluded unless listed.', 2),
  ('Fire-proofing', 'Fire-proofing application and related materials are excluded unless listed.', 3),
  ('Concrete', 'Concrete work, foundations, and related trades are excluded unless listed.', 4),
  ('Lifting / crane', 'Crane rental, rigging, and heavy lifting beyond standard shop handling are excluded unless listed.', 5),
  ('Permitting', 'Building permits, inspections, and jurisdictional fees are excluded unless listed.', 6)
) as v(label, body, sort_order)
where not exists (select 1 from public.settings_exclusions limit 1);
