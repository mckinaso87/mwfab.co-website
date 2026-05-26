-- Wide flange takeoff columns: W designation (Section Number) + weight per foot (×).
-- Run this on an EXISTING database — do NOT re-run 011_materials_restructure.sql.

-- Infer W nominal from depth when Section Number was blank in the source CSV.
create or replace function public.infer_wide_flange_section_from_depth(depth numeric)
returns text
language plpgsql
immutable
as $$
begin
  if depth is null then
    return null;
  end if;
  if depth < 4.6 then return 'W4';
  elsif depth < 5.6 then return 'W5';
  elsif depth < 6.6 then return 'W6';
  elsif depth < 7.6 then return 'W7';
  elsif depth < 9.0 then return 'W8';
  elsif depth < 11.0 then return 'W10';
  elsif depth < 13.0 then return 'W12';
  elsif depth < 15.0 then return 'W14';
  elsif depth < 17.0 then return 'W16';
  elsif depth < 19.0 then return 'W18';
  elsif depth < 22.0 then return 'W21';
  elsif depth < 25.0 then return 'W24';
  else return 'W' || round(depth)::text;
  end if;
end;
$$;

delete from public.material_field_config
where category = 'wide_flange';

insert into public.material_field_config (category, field_key, label, show_in_takeoff, sort_order)
values
  ('wide_flange', 'section_number', 'W', true, 0),
  ('wide_flange', 'weight_per_ft', '× lb/ft', true, 1);

-- Move legacy size_c (Section Number) into section_number.
update public.material_catalog mc
set dimensions =
  (coalesce(dimensions, '{}'::jsonb) - 'size_c')
  || case
    when coalesce(dimensions->>'section_number', '') ~* '^W' then '{}'::jsonb
    when coalesce(dimensions->>'size_c', '') ~* '^W' then
      jsonb_build_object('section_number', dimensions->'size_c')
    when split_part(item_code, '-', 1) ~* '^W[0-9]' then
      jsonb_build_object('section_number', to_jsonb(split_part(item_code, '-', 1)))
    else '{}'::jsonb
  end
where category = 'wide_flange';

-- Rows with blank Section Number in CSV: infer W from depth of section (e.g. 5.15 → W5, 5.90 → W6).
update public.material_catalog mc
set dimensions =
  coalesce(dimensions, '{}'::jsonb)
  || jsonb_build_object(
    'section_number',
    public.infer_wide_flange_section_from_depth(
      nullif(regexp_replace(coalesce(dimensions->>'section_depth_a', ''), '[^0-9.+-]', '', 'g'), '')::numeric
    )
  )
where category = 'wide_flange'
  and coalesce(dimensions->>'section_number', '') !~* '^W'
  and coalesce(dimensions->>'section_depth_a', '') <> '';

-- Rebuild shorthand / size_label for all wide flange rows (W12×30 not Wx30 or W4.16×13).
update public.material_catalog mc
set
  shorthand_code =
    'W'
    || regexp_replace(
      coalesce(dimensions->>'section_number', ''),
      '^[Ww]\s*',
      '',
      'g'
    )
    || 'x'
    || trim(to_char(weight_per_ft, 'FM999990.####')),
  size_label =
    'W'
    || regexp_replace(
      coalesce(dimensions->>'section_number', ''),
      '^[Ww]\s*',
      '',
      'g'
    )
    || '×'
    || trim(to_char(weight_per_ft, 'FM999990.####'))
where category = 'wide_flange'
  and weight_per_ft is not null
  and coalesce(dimensions->>'section_number', '') ~* '^W';

-- After applying this migration, re-seed materials so item_code values use CSV row ids
-- (fixes WF-15 collisions that dropped W10x15, W10x19, etc.):
--   npm run seed:materials
