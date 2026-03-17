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

const tableHeaderRowClass =
  "border-b border-steel/50 bg-steel/30 text-left print:border-gray-300 print:bg-gray-100";
const tableHeaderCellClass =
  "py-3 px-4 text-xs font-semibold uppercase tracking-wider text-foreground print:text-black";
const tableBodyRowClass =
  "border-b border-steel/30 print:border-gray-200 hover:bg-steel/10 print:hover:bg-transparent transition-colors";
const tableBodyCellClass = "py-3 px-4 text-sm text-foreground print:text-black";
const tableBodyCellMutedClass =
  "py-3 px-4 text-sm text-foreground-muted print:text-gray-600";
const tableCurrencyClass =
  "py-3 px-4 text-right text-sm tabular-nums text-foreground print:text-black";
const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-wider text-foreground-muted print:text-gray-600 mb-3";
const metaLabelClass =
  "text-xs uppercase tracking-wider text-foreground-muted print:text-gray-600";

function ProposalDocument({ data }: { data: ProposalData }) {
  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines } =
    data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";

  return (
    <article
      id="proposal-document"
      className="mx-auto max-w-3xl rounded-xl border border-steel/50 bg-card px-6 py-8 shadow-sm print:max-w-none print:border-0 print:bg-white print:p-0 print:shadow-none sm:p-10"
    >
      {/* Header: letterhead-style branding */}
      <header className="border-b border-steel/50 pb-8 print:border-gray-300">
        <div className="flex items-start gap-5">
          <Image
            src="/images/logo/mwf-logo.png"
            alt="McKinados Welding & Fabrication"
            width={80}
            height={80}
            className="shrink-0 print:h-16 print:w-16"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground print:text-black sm:text-3xl">
              McKinados Welding & Fabrication
            </h1>
            <p className="mt-1.5 text-sm text-foreground-muted print:text-gray-600">
              Structural and ornamental steel construction. East Coast Florida —
              St. Augustine to Miami.
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground-muted print:text-gray-600">
              Licensed and insured. 17+ years experience.
            </p>
          </div>
        </div>
      </header>

      {/* Proposal identity */}
      <div className="mb-6 mt-8">
        <p className="text-lg font-semibold text-foreground print:text-black">
          Project Proposal
        </p>
        <p className="mt-0.5 text-base text-foreground print:text-black">
          {job.job_name}
        </p>
      </div>

      {/* Metadata: compact definition list */}
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 print:grid-cols-2">
        <div>
          <dt className={metaLabelClass}>Customer</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground print:text-black">
            {customerName}
          </dd>
        </div>
        <div>
          <dt className={metaLabelClass}>Quote date</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground print:text-black">
            {quoteDate}
          </dd>
        </div>
        <div>
          <dt className={metaLabelClass}>Quoted by</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground print:text-black">
            {quotedBy}
          </dd>
        </div>
      </dl>

      {/* Line item tables */}
      {metalLines.length > 0 && (
        <section className="mb-10 mt-8">
          <h2 className={sectionTitleClass}>Metal</h2>
          <div className="overflow-x-auto rounded-md border border-steel/40 print:rounded-none print:border-gray-200">
            <table className="w-full">
              <thead>
                <tr className={tableHeaderRowClass}>
                  <th
                    className={`${tableHeaderCellClass} pr-4`}
                  >
                    Description
                  </th>
                  <th
                    className={`${tableHeaderCellClass} pr-4`}
                  >
                    Category
                  </th>
                  <th
                    className={`${tableHeaderCellClass} text-right`}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {metalLines.map((line) => (
                  <tr key={line.id} className={tableBodyRowClass}>
                    <td className={tableBodyCellClass}>{line.display_name}</td>
                    <td className={tableBodyCellMutedClass}>
                      {CATEGORY_LABELS[line.category] ?? line.category}
                    </td>
                    <td className={tableCurrencyClass}>
                      {formatMoney(line.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {componentLines.length > 0 && (
        <section className="mb-10 mt-8">
          <h2 className={sectionTitleClass}>Components</h2>
          <div className="overflow-x-auto rounded-md border border-steel/40 print:rounded-none print:border-gray-200">
            <table className="w-full">
              <thead>
                <tr className={tableHeaderRowClass}>
                  <th className={`${tableHeaderCellClass} pr-4`}>Name</th>
                  <th className={`${tableHeaderCellClass} text-right`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {componentLines.map((line) => (
                  <tr key={line.id} className={tableBodyRowClass}>
                    <td className={tableBodyCellClass}>{line.display_name}</td>
                    <td className={tableCurrencyClass}>
                      {formatMoney(line.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {miscLines.length > 0 && (
        <section className="mb-10 mt-8">
          <h2 className={sectionTitleClass}>Materials – Miscellaneous</h2>
          <div className="overflow-x-auto rounded-md border border-steel/40 print:rounded-none print:border-gray-200">
            <table className="w-full">
              <thead>
                <tr className={tableHeaderRowClass}>
                  <th className={`${tableHeaderCellClass} pr-4`}>Label</th>
                  <th className={`${tableHeaderCellClass} text-right`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {miscLines.map((line) => (
                  <tr key={line.id} className={tableBodyRowClass}>
                    <td className={tableBodyCellClass}>{line.label}</td>
                    <td className={tableCurrencyClass}>
                      {formatMoney(line.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {fieldMiscLines.length > 0 && (
        <section className="mb-10 mt-8">
          <h2 className={sectionTitleClass}>Field – Miscellaneous</h2>
          <div className="overflow-x-auto rounded-md border border-steel/40 print:rounded-none print:border-gray-200">
            <table className="w-full">
              <thead>
                <tr className={tableHeaderRowClass}>
                  <th className={`${tableHeaderCellClass} pr-4`}>Label</th>
                  <th className={`${tableHeaderCellClass} text-right`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {fieldMiscLines.map((line) => (
                  <tr key={line.id} className={tableBodyRowClass}>
                    <td className={tableBodyCellClass}>{line.label}</td>
                    <td className={tableCurrencyClass}>
                      {formatMoney(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing summary: grouped breakdown + dominant grand total */}
      <section className="mt-10 rounded-lg border border-steel/40 bg-card/80 p-6 pt-8 print:border-gray-300 print:bg-white">
        <h2 className={sectionTitleClass}>Pricing summary</h2>

        <div className="space-y-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex justify-between sm:block">
              <span className="text-foreground-muted print:text-gray-600">
                Materials subtotal
              </span>
              <span className="tabular-nums text-foreground print:text-black sm:mt-0.5 sm:block">
                {formatMoney(takeoff.all_material_subtotal)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-foreground-muted print:text-gray-600">
                Tax
              </span>
              <span className="tabular-nums text-foreground print:text-black sm:mt-0.5 sm:block">
                {formatMoney(takeoff.tax_total)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-foreground-muted print:text-gray-600">
                Material w/ tax
              </span>
              <span className="font-medium tabular-nums text-foreground print:text-black sm:mt-0.5 sm:block">
                {formatMoney(takeoff.material_total_with_tax)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex justify-between sm:block">
              <span className="text-foreground-muted print:text-gray-600">
                Shop total
              </span>
              <span className="tabular-nums text-foreground print:text-black sm:mt-0.5 sm:block">
                {formatMoney(takeoff.shop_total)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-foreground-muted print:text-gray-600">
                Field total
              </span>
              <span className="tabular-nums text-foreground print:text-black sm:mt-0.5 sm:block">
                {formatMoney(takeoff.field_total)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-foreground-muted print:text-gray-600">
                Project total
              </span>
              <span className="font-medium tabular-nums text-foreground print:text-black sm:mt-0.5 sm:block">
                {formatMoney(takeoff.project_total)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border-2 border-steel-blue/70 bg-steel-blue/15 px-5 py-4 shadow-sm print:border-gray-400 print:bg-gray-100 print:shadow-none">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-base font-semibold text-foreground print:text-black">
              Grand total
            </span>
            <span className="text-2xl font-bold tabular-nums text-foreground print:text-black sm:text-3xl">
              {formatMoney(takeoff.grand_total)}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-steel/50 pt-8 text-sm print:border-gray-300">
        <p className="font-semibold text-foreground print:text-black">
          McKinados Welding & Fabrication
        </p>
        <p className="mt-1 text-foreground-muted print:text-gray-600">
          Service area: East Coast Florida (St. Augustine to Miami). Licensed
          steel contractor Florida.
        </p>
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
