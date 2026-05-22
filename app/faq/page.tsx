import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { FAQ_ITEMS } from "@/lib/faq";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata({
  title: "FAQ | Licensed Steel Contractor Florida | McKinados Welding & Fabrication",
  description:
    "Frequently asked questions about licensed counties, structural vs ornamental steel, Florida building code, finishes, timelines, and how to request a bid.",
  pathname: "/faq",
});

export default function FaqPage() {
  return (
    <div className="bg-charcoal">
      <FaqJsonLd items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-foreground-muted">
          Straight answers about licensing, services, Florida requirements, and how to work with us.
        </p>
        <dl className="mt-10 max-w-3xl space-y-10">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <dt className="text-lg font-semibold text-foreground">{item.question}</dt>
              <dd className="mt-3 text-foreground-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
