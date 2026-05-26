-- Optional customer-facing note per takeoff line (shown indented on proposal when enabled).

alter table public.takeoff_metal_lines
  add column if not exists customer_note text,
  add column if not exists customer_note_in_proposal boolean not null default false;

alter table public.takeoff_component_lines
  add column if not exists customer_note text,
  add column if not exists customer_note_in_proposal boolean not null default false;

alter table public.takeoff_misc_lines
  add column if not exists customer_note text,
  add column if not exists customer_note_in_proposal boolean not null default false;

alter table public.takeoff_field_misc
  add column if not exists customer_note text,
  add column if not exists customer_note_in_proposal boolean not null default false;
