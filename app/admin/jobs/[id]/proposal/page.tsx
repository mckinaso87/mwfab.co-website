import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProposalData } from "./loadProposalData";
import { formatMoney } from "../takeoff/formatMoney";
import { CATEGORY_LABELS } from "@/lib/takeoff-catalog-spec";
import type { ProposalData } from "./loadProposalData";
import { SendProposalForm } from "./SendProposalForm";

export const metadata: Metadata = {
  title: "Proposal preview | Admin | McKinados Welding & Fabrication",
  description: "Preview and send proposal.",
  robots: "noindex, nofollow",
};

function ProposalDocument({ data }: { data: ProposalData }) {
  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines } = data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";

  return (
    <article
      id="proposal-document"
      className="mx-auto max-w-3xl rounded-xl border border-steel/50 bg-card p-8 print:max-w-none print:border-0 print:bg-white print:p-0"
    >
      {/* Header */}
      <header className="border-b border-steel/50 pb-6 print:border-gray-300">
        <div className="flex items-start gap-4">
          <Image
            src="/images/logo/mwf-logo.png"
            alt="McKinados Welding & Fabrication"
            width={80}
            height={80}
            className="shrink-0 print:h-16 print:w-16"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground print:text-black sm:text-2xl">
              McKinados Welding & Fabrication
            </h1>
            <p className="mt-1 text-sm text-foreground-muted print:text-gray-600">
              Structural and ornamental steel construction. East Coast Florida — St. Augustine to Miami.
              Licensed and insured. 17+ years experience.
            </p>
          </div>
        </div>
      </header>

      {/* Meta */}
      <div className="mt-6 grid gap-2 text-sm print:mt-6">
        <p><span className="font-medium text-foreground-muted print:text-gray-600">Job:</span> <span className="text-foreground print:text-black">{job.job_name}</span></p>
        <p><span className="font-medium text-foreground-muted print:text-gray-600">Customer:</span> <span className="text-foreground print:text-black">{customerName}</span></p>
        <p><span className="font-medium text-foreground-muted print:text-gray-600">Quote date:</span> <span className="text-foreground print:text-black">{quoteDate}</span></p>
        <p><span className="font-medium text-foreground-muted print:text-gray-600">Quoted by:</span> <span className="text-foreground print:text-black">{quotedBy}</span></p>
      </div>

      {/* Line items */}
      {metalLines.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600">Metal</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel/50 text-left print:border-gray-300">
                  <th className="py-2 pr-4 font-medium text-foreground print:text-black">Description</th>
                  <th className="py-2 pr-4 font-medium text-foreground print:text-black">Category</th>
                  <th className="py-2 text-right font-medium text-foreground print:text-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {metalLines.map((line) => (
                  <tr key={line.id} className="border-b border-steel/30 print:border-gray-200">
                    <td className="py-2 pr-4 text-foreground print:text-black">{line.display_name}</td>
                    <td className="py-2 pr-4 text-foreground-muted print:text-gray-600">{CATEGORY_LABELS[line.category] ?? line.category}</td>
                    <td className="py-2 text-right tabular-nums text-foreground print:text-black">{formatMoney(line.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {componentLines.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600">Components</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel/50 text-left print:border-gray-300">
                  <th className="py-2 pr-4 font-medium text-foreground print:text-black">Name</th>
                  <th className="py-2 text-right font-medium text-foreground print:text-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {componentLines.map((line) => (
                  <tr key={line.id} className="border-b border-steel/30 print:border-gray-200">
                    <td className="py-2 pr-4 text-foreground print:text-black">{line.display_name}</td>
                    <td className="py-2 text-right tabular-nums text-foreground print:text-black">{formatMoney(line.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {miscLines.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600">Materials – Miscellaneous</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel/50 text-left print:border-gray-300">
                  <th className="py-2 pr-4 font-medium text-foreground print:text-black">Label</th>
                  <th className="py-2 text-right font-medium text-foreground print:text-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {miscLines.map((line) => (
                  <tr key={line.id} className="border-b border-steel/30 print:border-gray-200">
                    <td className="py-2 pr-4 text-foreground print:text-black">{line.label}</td>
                    <td className="py-2 text-right tabular-nums text-foreground print:text-black">{formatMoney(line.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {fieldMiscLines.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600">Field – Miscellaneous</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel/50 text-left print:border-gray-300">
                  <th className="py-2 pr-4 font-medium text-foreground print:text-black">Label</th>
                  <th className="py-2 text-right font-medium text-foreground print:text-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {fieldMiscLines.map((line) => (
                  <tr key={line.id} className="border-b border-steel/30 print:border-gray-200">
                    <td className="py-2 pr-4 text-foreground print:text-black">{line.label}</td>
                    <td className="py-2 text-right tabular-nums text-foreground print:text-black">{formatMoney(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing summary */}
      <section className="mt-8 border-t border-steel/50 pt-6 print:border-gray-300">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600">Pricing summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-foreground-muted print:text-gray-600">Materials</p>
            <p className="font-medium tabular-nums text-foreground print:text-black">{formatMoney(takeoff.all_material_subtotal)}</p>
          </div>
          <div>
            <p className="text-foreground-muted print:text-gray-600">Tax</p>
            <p className="font-medium tabular-nums text-foreground print:text-black">{formatMoney(takeoff.tax_total)}</p>
          </div>
          <div>
            <p className="text-foreground-muted print:text-gray-600">Material w/ tax</p>
            <p className="font-medium tabular-nums text-foreground print:text-black">{formatMoney(takeoff.material_total_with_tax)}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-foreground-muted print:text-gray-600">Shop total</p>
            <p className="font-medium tabular-nums text-foreground print:text-black">{formatMoney(takeoff.shop_total)}</p>
          </div>
          <div>
            <p className="text-foreground-muted print:text-gray-600">Field total</p>
            <p className="font-medium tabular-nums text-foreground print:text-black">{formatMoney(takeoff.field_total)}</p>
          </div>
          <div>
            <p className="text-foreground-muted print:text-gray-600">Project total</p>
            <p className="font-medium tabular-nums text-foreground print:text-black">{formatMoney(takeoff.project_total)}</p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border-2 border-steel-blue/60 bg-steel-blue/10 px-4 py-4 print:border-gray-400 print:bg-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-foreground print:text-black">Grand total</span>
            <span className="text-2xl font-bold tabular-nums text-foreground print:text-black">{formatMoney(takeoff.grand_total)}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-steel/50 pt-6 text-sm text-foreground-muted print:border-gray-300 print:text-gray-600">
        <p className="font-semibold text-foreground print:text-black">McKinados Welding & Fabrication</p>
        <p className="mt-1">Service area: East Coast Florida (St. Augustine to Miami). Licensed steel contractor Florida.</p>
      </footer>
    </article>
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

  return (
    <div className="space-y-8">
      <div className="print:hidden flex flex-wrap items-center gap-4">
        <Link
          href={`/admin/jobs/${jobId}/takeoff`}
          className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          ← Back to takeoff
        </Link>
      </div>

      <ProposalDocument data={data} />

      <div className="print:hidden">
        <SendProposalForm jobId={jobId} data={data} />
      </div>
    </div>
  );
}
