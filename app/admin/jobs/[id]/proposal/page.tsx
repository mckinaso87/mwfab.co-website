import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProposalData, deriveProposalScopeLabel } from "./loadProposalData";
import { formatMoney } from "../takeoff/formatMoney";
import { normalizeRate } from "@/lib/takeoff-calculations";
import type { ProposalData } from "./loadProposalData";
import { SendProposalForm } from "./SendProposalForm";
import { PushEstimateToQboForm } from "./PushEstimateToQboForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConnectionStatus } from "@/lib/qbo/connection-store";
import { getQboSyncEnv } from "@/lib/env";
import { getQboAppEstimateUrl } from "@/lib/qbo/oauth";
import { QboSyncBadge } from "@/components/admin";
import { Letterhead } from "@/components/admin/proposal/Letterhead";
import { SignatureBlock } from "@/components/admin/proposal/SignatureBlock";
import { TermsSection } from "@/components/admin/proposal/TermsSection";
import { ProposalLineSections } from "@/components/admin/proposal/ProposalLineSections";

export const metadata: Metadata = {
  title: "Proposal preview | Admin | McKinados Welding & Fabrication",
  description: "Preview and send proposal.",
  robots: "noindex, nofollow",
};

const metaLabelClass =
  "text-xs uppercase tracking-wider text-foreground-muted print:text-gray-600";
const sectionTitleClass =
  "text-[13px] font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600 mb-3";

function proposalScopeHeaderLabel(lines: Array<{ scope?: string | null }>): string {
  const scopes = new Set(
    lines.map((l) => l.scope).filter((s): s is string => !!s)
  );
  if (scopes.has("furnish") && scopes.has("furnish_install")) {
    return "Mixed — see line items";
  }
  return deriveProposalScopeLabel(lines);
}

function PricingRow({ label, value }: { label: string; value: number }) {
  if (!value || value === 0) return null;
  return (
    <div className="flex justify-between border-b border-steel/40 py-2.5 text-sm print:border-gray-300">
      <span className="text-foreground-muted print:text-gray-600">{label}</span>
      <span className="tabular-nums font-medium text-foreground print:text-black">
        {formatMoney(value)}
      </span>
    </div>
  );
}

function ProposalDocument({ data, jobId }: { data: ProposalData; jobId: string }) {
  const {
    job,
    takeoff,
    metalLines,
    componentLines,
    miscLines,
    fieldMiscLines,
    sectionNotes,
    exclusions,
    terms,
  } = data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";
  const allScopedLines = [
    ...metalLines,
    ...componentLines,
    ...miscLines,
    ...fieldMiscLines,
  ];
  const scopeLabel = proposalScopeHeaderLabel(allScopedLines);
  const galvMode = takeoff.galv_mode ?? "not_galvanized";
  const jobNumber = `JOB-${jobId.slice(0, 6).toUpperCase()}`;

  const marginAmount = (takeoff.grand_total ?? 0) - (takeoff.project_total ?? 0);
  const marginPct = normalizeRate(takeoff.margin_rate, 0.2) * 100;

  const grandWithGalv =
    galvMode === "optional_addon"
      ? (takeoff.grand_total ?? 0) + (takeoff.galv_addon_amount ?? 0)
      : null;

  return (
    <>
      <style>{`
        @media print {
          body { font-size: 14px; color: #000; background: #fff; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          article { box-shadow: none !important; border: none !important; }
          table { page-break-inside: avoid; }
          h2, h3 { page-break-after: avoid; }
        }
      `}</style>
      <article
        id="proposal-document"
        className="mx-auto max-w-[820px] rounded-xl border border-steel/50 bg-card px-6 py-8 text-sm text-foreground shadow-sm print:max-w-none print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none sm:p-10"
      >
        <Letterhead />

        <div className="mb-6 mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted print:text-gray-600">
            Proposal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground print:text-black">
            {job.job_name}
          </h1>
          {galvMode === "baked_in" && (
            <p className="mt-2 text-sm text-foreground-muted print:text-gray-600">
              Galvanization is included on applicable metal lines (marked galv).
            </p>
          )}
        </div>

        <dl className="mb-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          {(
            [
              ["Customer", customerName],
              ["Quote date", quoteDate],
              ["Quoted by", quotedBy],
              ["Job #", jobNumber],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border-2 border-steel-blue/50 bg-steel-blue/25 px-4 py-3 shadow-sm ring-1 ring-steel/30 print:border-gray-400 print:bg-gray-100 print:shadow-none"
            >
              <dt className={metaLabelClass}>{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground print:text-black">
                {value}
              </dd>
            </div>
          ))}
          <div className="rounded-lg border-2 border-steel-blue/50 bg-steel-blue/25 px-4 py-3 shadow-sm ring-1 ring-steel/30 sm:col-span-2 lg:col-span-4 print:border-gray-400 print:bg-gray-100 print:shadow-none">
            <dt className={metaLabelClass}>Scope</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground print:text-black">
              {scopeLabel}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <ProposalLineSections
            metalLines={metalLines}
            componentLines={componentLines}
            miscLines={miscLines}
            fieldMiscLines={fieldMiscLines}
            sectionNotes={sectionNotes}
            galvMode={galvMode}
          />
        </div>

        <section className="mt-10 rounded-xl border-2 border-steel-blue/50 bg-steel-blue/15 p-6 shadow-md ring-1 ring-steel/40 print:border-gray-400 print:bg-gray-100 print:shadow-none">
          <h2 className={sectionTitleClass}>Pricing summary</h2>
          <div className="w-full">
            <PricingRow
              label="Materials (w/ tax)"
              value={takeoff.material_total_with_tax ?? 0}
            />
            <PricingRow label="Drawings" value={takeoff.drawings_total ?? 0} />
            <PricingRow label="Shop / Fabrication" value={takeoff.shop_total ?? 0} />
            <PricingRow label="Installation" value={takeoff.install_total ?? 0} />
            <PricingRow label="Miscellaneous" value={takeoff.misc_total ?? 0} />
            <PricingRow label="Subtotal" value={takeoff.project_total ?? 0} />
            {marginAmount > 0 && (
              <div className="flex justify-between border-b border-steel/40 py-2.5 text-sm print:border-gray-300">
                <span className="text-foreground-muted print:text-gray-600">
                  Margin (
                  {marginPct % 1 === 0 ? marginPct.toFixed(0) : marginPct.toFixed(1)}%)
                </span>
                <span className="tabular-nums font-medium text-foreground print:text-black">
                  {formatMoney(marginAmount)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 w-full rounded-lg border-2 border-steel-blue/70 bg-steel-blue/15 px-5 py-4 print:border-gray-400 print:bg-gray-100">
            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-semibold text-foreground print:text-black">
                Grand total
              </span>
              <span className="text-[28px] font-bold tabular-nums text-foreground print:text-black">
                {formatMoney(takeoff.grand_total)}
              </span>
            </div>
          </div>

          {galvMode === "optional_addon" && (takeoff.galv_addon_amount ?? 0) > 0 && (
            <div className="mt-4 w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-4 print:border-gray-400 print:bg-gray-50">
              <p className="text-sm text-foreground print:text-black">
                Optional galvanization add-on:{" "}
                <strong>{formatMoney(takeoff.galv_addon_amount)}</strong>
                <br />
                Total if galvanized:{" "}
                <strong>{formatMoney(grandWithGalv ?? takeoff.grand_total)}</strong>
              </p>
            </div>
          )}
        </section>

        {exclusions.length > 0 && (
          <section className="mt-10">
            <h2 className={sectionTitleClass}>Exclusions</h2>
            <ul className="list-disc space-y-3 pl-5 text-sm text-foreground print:text-black">
              {exclusions.map((ex) => (
                <li key={ex.id}>
                  <span className="font-medium">{ex.label}</span>
                  <span className="mt-0.5 block text-foreground-muted print:text-gray-600">
                    {ex.body}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <SignatureBlock quotedBy={takeoff.quoted_by} />
      </article>

      {terms?.body_md && (
        <article className="page-break mx-auto mt-8 max-w-[820px] rounded-xl border border-steel/50 bg-card px-6 py-8 shadow-sm print:max-w-none print:border-0 print:bg-white print:p-0 print:shadow-none sm:p-10">
          <TermsSection bodyMd={terms.body_md} />
        </article>
      )}
    </>
  );
}

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const data = await getProposalData(jobId);
  if (!data) notFound();

  const supabase = createAdminClient();
  const [qboConnection, syncEnv, { data: qboAnchor }] = await Promise.all([
    getConnectionStatus(),
    Promise.resolve(getQboSyncEnv()),
    supabase
      .from("proposals")
      .select("qbo_estimate_id, qbo_synced_at, qbo_sync_error")
      .eq("takeoff_id", data.takeoff.id)
      .not("qbo_estimate_id", "is", null)
      .maybeSingle(),
  ]);

  let pushDisabled = false;
  let pushDisabledReason: string | undefined;
  if (!qboConnection.connected) {
    pushDisabled = true;
    pushDisabledReason = "Connect QuickBooks under Settings → Integrations.";
  } else if (!syncEnv) {
    pushDisabled = true;
    pushDisabledReason =
      "Set QBO_DEFAULT_ITEM_ID and QBO_LINE_TAX_CODE (TAX or NON) in environment variables.";
  }

  const estimateUrl =
    qboAnchor?.qbo_estimate_id && syncEnv
      ? getQboAppEstimateUrl(syncEnv.environment, qboAnchor.qbo_estimate_id)
      : null;

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-center gap-4">
        <Link
          href={`/admin/jobs/${jobId}/takeoff`}
          className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          ← Back to takeoff
        </Link>
      </div>

      <ProposalDocument data={data} jobId={jobId} />

      <div className="no-print space-y-6">
        {qboAnchor?.qbo_estimate_id && (
          <div className="flex flex-wrap items-center gap-3">
            <QboSyncBadge
              connected={qboConnection.connected}
              qboId={qboAnchor.qbo_estimate_id}
              syncedAt={qboAnchor.qbo_synced_at}
              syncError={qboAnchor.qbo_sync_error}
            />
            {estimateUrl && (
              <a
                href={estimateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-admin-teal hover:text-admin-amber"
              >
                Open in QuickBooks →
              </a>
            )}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <SendProposalForm jobId={jobId} data={data} />
          <PushEstimateToQboForm
            jobId={jobId}
            disabled={pushDisabled}
            disabledReason={pushDisabledReason}
          />
        </div>
      </div>
    </div>
  );
}
