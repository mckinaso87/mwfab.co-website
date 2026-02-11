import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Request a Bid | McKinados Welding & Fabrication",
  description:
    "Request a bid for your structural or ornamental steel project. East Coast Florida. Licensed steel contractor.",
  openGraph: {
    title: "Contact | Request a Bid | McKinados Welding & Fabrication",
    description: "Request a bid for your structural or ornamental steel project. East Coast Florida.",
    url: "https://mwfab.co/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | McKinados Welding & Fabrication",
    description: "Request a bid for your steel project. East Coast Florida.",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-charcoal">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Request a Bid
        </h1>
        <p className="mt-4 text-lg text-foreground-muted">
          Tell us about your project. We will get back to you to discuss scope and timing.
        </p>
        <div className="mt-10 max-w-xl">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
