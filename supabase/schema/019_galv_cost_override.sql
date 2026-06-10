alter table public.takeoffs
  add column if not exists galv_cost_override numeric;
