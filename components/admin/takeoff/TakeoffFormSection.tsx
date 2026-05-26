import { cn } from "@/lib/utils";
import {
  TAKEOFF_VARIANT,
  type TakeoffFormVariant,
} from "@/components/admin/takeoff/takeoff-form-variants";

export type { TakeoffFormVariant };

type Props = {
  title: string;
  subtitle?: string;
  step?: number;
  children: React.ReactNode;
  className?: string;
  variant?: TakeoffFormVariant;
};

/** @deprecated Use TakeoffFormVariant names (catalog, quantities, etc.) */
const LEGACY_VARIANT_MAP: Record<string, TakeoffFormVariant> = {
  highlight: "catalog",
  muted: "details",
};

export function TakeoffFormSection({
  title,
  subtitle,
  step,
  children,
  className,
  variant = "default",
}: Props) {
  const resolved = LEGACY_VARIANT_MAP[variant] ?? variant;
  const styles = TAKEOFF_VARIANT[resolved] ?? TAKEOFF_VARIANT.default;

  return (
    <section
      className={cn(
        "col-span-full overflow-hidden rounded-xl border p-4 sm:p-5",
        styles.section,
        className
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className={cn("mt-1 w-1 shrink-0 self-stretch rounded-full", styles.accentBar)}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <header className="mb-4">
            {step != null && (
              <p
                className={cn(
                  "mb-1 text-[11px] font-bold uppercase tracking-[0.14em]",
                  styles.step
                )}
              >
                Step {step}
              </p>
            )}
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            {subtitle && (
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-foreground-muted">
                {subtitle}
              </p>
            )}
          </header>
          {children}
        </div>
      </div>
    </section>
  );
}
