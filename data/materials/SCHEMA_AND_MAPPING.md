# material_catalog schema and CSV mapping

## Migration

Apply [`supabase/schema/011_materials_restructure.sql`](../../supabase/schema/011_materials_restructure.sql) after `010_proposals.sql`, then seed:

```bash
npm run seed:materials
```

Requires `ALLOWED_SEED_HOSTS` (comma-separated Supabase project URLs), `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Table schema (011)

| Column          | Type      | Notes |
|-----------------|-----------|-------|
| id              | uuid      | PK |
| category        | text      | angle, wide_flange, round_bar, flat_bar, channel, mc_channel, pipe, tube |
| item_code       | text      | Unique with category |
| shorthand_code  | text      | e.g. L4x4x1/4, W12x30, HSS4x4x1/4 |
| size_label      | text      | Pretty display for operators |
| finish          | text      | HR or CF for round_bar only |
| dimensions      | jsonb     | Internal section properties |
| weight_per_ft   | numeric   | |
| cost_per_lb     | numeric   | When pricing_unit=per_lb |
| cost_per_foot   | numeric   | When pricing_unit=per_foot |
| pricing_unit    | text      | per_lb \| per_foot |
| is_active       | boolean   | Soft-hide from takeoff search |
| source_file     | text      | Source CSV |
| created_at      | timestamptz | |

## material_field_config

Operator-visible fields per category in takeoff search results. Defaults seeded in migration; editable at `/admin/materials/field-config`.

## CSV → category mapping

| Source CSV | Category | Shorthand pattern |
|------------|----------|-------------------|
| mwfab-base-materials.csv | angle | L{A}x{B}x{C} |
| mwfab-base-materials2.csv | wide_flange | W{section#}x{wpf} (e.g. W12×30 from Section Number + Weight Per/Foot) |
| mwfab-base-materials3.csv | round_bar | RB{size} (finish HR/CF) |
| mwfab-base-materials4.csv | flat_bar | FB{thk} (width optional) |
| mwfab-base-materials5.csv | flat_bar | FB{thk}x{w} (plate-like rows skipped) |
| mwfab-base-materials6.csv | channel | C{depth}x{wpf} |
| mwfab-base-materials7.csv | mc_channel | MC{depth}x{wpf} |
| mwfab-base-materials8.csv | pipe | PIPE{size}-SCH{sch} |
| mwfab-base-materials9.csv | tube | HSS{w}x{h}-{gauge} |

**Plate** is not a catalog category — takeoff uses line type `plate` with thickness/width/height inputs.

## Takeoff header (galvanization)

| Column | Values |
|--------|--------|
| scope_type | furnish_only, furnish_and_install |
| galv_mode | not_galvanized, baked_in, optional_addon |
| galv_total_override | Manual galvanizer lbs override |
| galv_addon_amount | Stored galvanizer $ when optional_addon |
| plate_default_cost_per_lb | Default $/lb for plate lines |
