import { ContactAside } from "@/components/sections/ContactAside";
import { ContactFormColumn } from "@/components/sections/ContactFormColumn";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata({
  title: "Contact | Request a Bid | McKinados Welding & Fabrication",
  description:
    "Request a bid for structural or ornamental steel. Florida state licensed contractor. Licensed statewide with active operations on the East Coast and in South Florida.",
  pathname: "/contact",
});

export default function ContactPage() {
  return (
    <div className="bg-charcoal">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ContactAside />
          </div>
          <div className="lg:col-span-7">
            <ContactFormColumn />
          </div>
        </div>
      </div>
    </div>
  );
}
