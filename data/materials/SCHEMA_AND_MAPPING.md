# material_catalog schema and CSV mapping

## Pulling schema from Supabase

Run the SQL in **Supabase Dashboard → SQL Editor**:

```bash
# File to run (copy contents into SQL Editor):
scripts/get-material-catalog-schema.sql
```

That script returns:

1. **Columns** – name, type, nullable, default  
2. **Check constraints** – category enum, pricing_unit  
3. **Unique constraint** – (category, item_code)  
4. **Indexes** – category, item_code  

Compare the results with `supabase/schema/008_material_catalog.sql` and this mapping.

---

## Table schema (from 008_material_catalog.sql)

| Column          | Type      | Nullable | Notes                          |
|-----------------|-----------|----------|--------------------------------|
| id              | uuid      | no       | PK, default gen_random_uuid()  |
| category        | text      | no       | Check: angles, wide_flange, …  |
| item_code       | text      | no       | Unique with category           |
| display_name    | text      | yes      |                                |
| dimensions      | jsonb     | yes      | Category-specific keys         |
| weight_per_ft   | numeric   | yes      |                                |
| cost_per_lb     | numeric   | yes      | Used when pricing_unit=per_lb  |
| cost_per_foot   | numeric   | yes      | Used when pricing_unit=per_foot|
| pricing_unit    | text      | no       | 'per_lb' \| 'per_foot'         |
| source_file     | text      | yes      | Which CSV row came from        |
| created_at      | timestamptz | no     | default now()                  |

Unique: `(category, item_code)`.

---

## CSV source and cost column by category

Cost is read from the CSV column below; the seed maps it into `cost_per_lb` or `cost_per_foot` depending on `pricing_unit`.

| Category         | Source CSV(s)              | Pricing unit | CSV cost column (exact header to match) |
|------------------|---------------------------|--------------|----------------------------------------|
| angles           | mwfab-base-materials.csv  | per_lb       | Current cost per lbs.                  |
| wide_flange      | mwfab-base-materials2.csv | per_foot     | Current cost per foot                  |
| bars_hr_rounds   | mwfab-base-materials3.csv | per_lb       | Current cost per ft. in lbs.           |
| bars_cf_rounds   | mwfab-base-materials3.csv | per_lb       | Current cost per lbs.                  |
| bars_flat        | mwfab-base-materials4.csv, 5 | per_lb    | Current Cost per ft. in Lbs.           |
| channels         | mwfab-base-materials6.csv | per_lb       | Current Cost per Lbs.                  |
| mc_channels      | mwfab-base-materials7.csv | per_lb       | Current Cost per Lbs.                  |
| pipe             | mwfab-base-materials8.csv | per_lb       | Current Cost per Lbs.                  |
| tube             | mwfab-base-materials9.csv | per_lb       | Current Cost per Lbs.                  |

The seed script uses these aliases (with normalizations) so small header spelling differences still match.
