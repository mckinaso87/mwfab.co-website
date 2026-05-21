import { renderMarkdownToHtml } from "@/lib/render-markdown";
import { LETTERHEAD } from "./Letterhead";

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
      <footer className="mt-10 border-t border-steel/50 pt-6 text-sm print:border-gray-300 print:text-black">
        <p className="font-semibold">{LETTERHEAD.companyName}</p>
        <p className="text-foreground-muted print:text-gray-700">{LETTERHEAD.addressLine1}</p>
        <p className="text-foreground-muted print:text-gray-700">{LETTERHEAD.addressLine2}</p>
        <p className="mt-1 text-foreground-muted print:text-gray-700">
          Office: {LETTERHEAD.office} · Mobile: {LETTERHEAD.mobile}
        </p>
      </footer>
    </section>
  );
}
