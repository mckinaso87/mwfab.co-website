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

- Apply `supabase/schema/011_materials_restructure.sql` in the Supabase SQL Editor, then seed:
  ```bash
  npm run seed:materials
  ```
  Requires `ALLOWED_SEED_HOSTS`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The script truncates and re-inserts catalog rows (source of truth).

See [SCHEMA_AND_MAPPING.md](./SCHEMA_AND_MAPPING.md) for column details and category mapping.

## Category mapping

| CSV file | material_catalog category |
|----------|---------------------------|
| mwfab-base-materials.csv | angle |
| mwfab-base-materials2.csv | wide_flange |
| mwfab-base-materials3.csv | round_bar (HR/CF finish) |
| mwfab-base-materials4.csv, mwfab-base-materials5.csv | flat_bar |
| mwfab-base-materials6.csv | channel |
| mwfab-base-materials7.csv | mc_channel |
| mwfab-base-materials8.csv | pipe |
| mwfab-base-materials9.csv | tube |

## Conventions

- Columns include both catalog fields (dimensions, weight, cost) and input/calculated fields (length, total pounds, total price).
- Cost is per pound or per foot depending on the sheet; see headers in each file.
- Update CSVs when base material list or pricing changes; keep filenames stable so import scripts can target them.
