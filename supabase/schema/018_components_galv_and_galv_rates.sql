alter table public.takeoff_component_lines
  add column if not exists is_galvanized boolean not null default false,
  add column if not exists galv_pounds numeric;

alter table public.takeoffs
  add column if not exists galv_pct numeric not null default 0.15,
  add column if not exists galv_rate_per_lb numeric not null default 0.50;
