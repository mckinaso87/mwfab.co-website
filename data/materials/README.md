# Base materials and pricing (CSV source)

This folder holds the canonical CSV exports for MWFAB base materials and pricing. They are the reference data for the future Material Catalog and takeoff/proposal features.

## Files

| File | Content |
|------|---------|
| `mwfab-base-materials.csv` | Bar size standard, structural size standard (angles/bars; Item #, sizes A/B/C, weight per ft, cost per lb) |
| `mwfab-base-materials2.csv` | W-shapes / wide flange beams (Section Number, weight per foot, depth, flange, web, cost per foot) |
| `mwfab-base-materials3.csv` | Round bar, reinforcing bar (Item #, thickness, weight per ft, cost) |
| `mwfab-base-materials4.csv` | Flat bar by size (size, weight per linear ft, cost per lb) |
| `mwfab-base-materials5.csv` | Flat bar by thickness/width (Item #, thickness, width, weight per ft, cost) |
| `mwfab-base-materials6.csv` | C-shapes / channel (Item #, section, dimensions, weight per ft, cost per lb) |
| `mwfab-base-materials7.csv` | MC / miscellaneous channel, bar (Item #, section, dimensions, cost) |
| `mwfab-base-materials8.csv` | Pipe (Item #, pipe size, schedule, OD, wall, weight per ft, cost) |
| `mwfab-base-materials9.csv` | Square tube, rectangle tube (Item #, type, width, height, gauge, weight per ft, cost) |

## Usage

- **Phase 3:** Material catalog is seeded from these CSVs into Supabase `material_catalog`. Apply `supabase/schema/008_material_catalog.sql` in the Supabase SQL Editor, then run:
  ```bash
  npx tsx scripts/seed-material-catalog.ts
  ```
  Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The script is idempotent (upserts by `category` + `item_code`); re-run to refresh prices.

## Category mapping (grand-totals)

| CSV file | material_catalog category |
|----------|---------------------------|
| mwfab-base-materials.csv | angles |
| mwfab-base-materials2.csv | wide_flange |
| mwfab-base-materials3.csv | bars_hr_rounds / bars_cf_rounds (by Type) |
| mwfab-base-materials4.csv, mwfab-base-materials5.csv | bars_flat |
| mwfab-base-materials6.csv | channels |
| mwfab-base-materials7.csv | mc_channels |
| mwfab-base-materials8.csv | pipe |
| mwfab-base-materials9.csv | tube |

## Conventions

- Columns include both catalog fields (dimensions, weight, cost) and input/calculated fields (length, total pounds, total price).
- Cost is per pound or per foot depending on the sheet; see headers in each file.
- Update CSVs when base material list or pricing changes; keep filenames stable so import scripts can target them.
