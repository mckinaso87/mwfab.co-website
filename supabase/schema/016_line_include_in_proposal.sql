-- Per-line toggle: hide from customer proposal while keeping takeoff totals.

alter table public.takeoff_metal_lines
  add column if not exists include_in_proposal boolean not null default true;

alter table public.takeoff_component_lines
  add column if not exists include_in_proposal boolean not null default true;

alter table public.takeoff_misc_lines
  add column if not exists include_in_proposal boolean not null default true;

alter table public.takeoff_field_misc
  add column if not exists include_in_proposal boolean not null default true;
