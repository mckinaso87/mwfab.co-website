import { renderMarkdownToHtml } from "@/lib/render-markdown";
import { ProposalLicensesFooter } from "./ProposalLicensesFooter";

type Props = {
  bodyMd: string;
};

export function TermsSection({ bodyMd }: Props) {
  const html = renderMarkdownToHtml(bodyMd);

  return (
    <section className="page-break mt-0 print:mt-0">
      <h2 className="text-xl font-bold text-foreground print:text-black mb-6">
        Terms and Conditions
      </h2>
      <div
        className="terms-body prose prose-sm max-w-none text-foreground print:text-black print:text-[12pt] print:leading-snug [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <ProposalLicensesFooter />
    </section>
  );
}
