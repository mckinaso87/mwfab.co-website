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

- **Phase 1:** Not used by the app; stored for reference and future import.
- **Phase 2:** When the Material Catalog and Supabase schema exist, use these CSVs to seed or sync the catalog (see `/docs/future-schema.md` and `/supabase/schema/`).

## Conventions

- Columns include both catalog fields (dimensions, weight, cost) and input/calculated fields (length, total pounds, total price).
- Cost is per pound or per foot depending on the sheet; see headers in each file.
- Update CSVs when base material list or pricing changes; keep filenames stable so import scripts can target them.
