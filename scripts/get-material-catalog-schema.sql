-- Run this in Supabase SQL Editor to pull the full material_catalog schema in ONE result set.
-- Compare with supabase/schema/008_material_catalog.sql and data/materials/SCHEMA_AND_MAPPING.md.

SELECT * FROM (
  SELECT
    1 AS sort_key,
    ordinal_position AS sort_pos,
    'column' AS section,
    column_name AS name,
    data_type AS type,
    is_nullable AS nullable,
    column_default AS definition
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'material_catalog'

  UNION ALL

  SELECT 2, 0, 'check_constraint', conname, contype::text, '', pg_get_constraintdef(oid, true)
  FROM pg_constraint
  WHERE conrelid = 'public.material_catalog'::regclass AND contype = 'c'

  UNION ALL

  SELECT 3, 0, 'unique_constraint', conname, 'u', '', pg_get_constraintdef(oid, true)
  FROM pg_constraint
  WHERE conrelid = 'public.material_catalog'::regclass AND contype = 'u'

  UNION ALL

  SELECT 4, 0, 'index', indexname, '', '', indexdef
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'material_catalog'
) t
ORDER BY sort_key, sort_pos, name;
