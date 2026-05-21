"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateFieldConfig } from "@/app/admin/materials/actions";
import type { MaterialFieldConfig } from "@/lib/db-types";

type Group = {
  category: string;
  label: string;
  fields: MaterialFieldConfig[];
};

export function FieldConfigEditor({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [localGroups, setLocalGroups] = useState(groups);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(
    category: string,
    fieldKey: string,
    patch: Partial<Pick<MaterialFieldConfig, "show_in_takeoff" | "sort_order">>
  ) {
    setLocalGroups((prev) =>
      prev.map((g) =>
        g.category !== category
          ? g
          : {
              ...g,
              fields: g.fields.map((f) =>
                f.field_key === fieldKey ? { ...f, ...patch } : f
              ),
            }
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const rows = localGroups.flatMap((g) =>
      g.fields.map((f) => ({
        category: f.category,
        field_key: f.field_key,
        show_in_takeoff: f.show_in_takeoff,
        sort_order: f.sort_order,
      }))
    );
    const { error: err } = await updateFieldConfig(rows);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {localGroups.map((group) => (
        <section
          key={group.category}
          className="rounded-xl border border-steel/50 bg-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">{group.label}</h2>
          <ul className="space-y-3">
            {group.fields.map((f) => (
              <li
                key={`${f.category}-${f.field_key}`}
                className="flex flex-wrap items-center gap-4 border-b border-steel/30 pb-3 last:border-0"
              >
                <span className="min-w-[8rem] text-sm font-medium text-foreground">
                  {f.label}
                  <span className="ml-2 font-mono text-xs text-foreground-muted">
                    {f.field_key}
                  </span>
                </span>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={f.show_in_takeoff}
                    onChange={(e) =>
                      updateField(f.category, f.field_key, {
                        show_in_takeoff: e.target.checked,
                      })
                    }
                  />
                  Show in takeoff
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground-muted">
                  Order
                  <input
                    type="number"
                    className="w-16 rounded border border-steel/50 bg-charcoal px-2 py-1 text-foreground"
                    value={f.sort_order}
                    onChange={(e) =>
                      updateField(f.category, f.field_key, {
                        sort_order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save field config"}
      </button>
    </div>
  );
}
