import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ProjectGalleryPreview } from "@/components/sections/ProjectGalleryPreview";
import { CtaSection } from "@/components/sections/CtaSection";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata({
  title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
  description:
    "Licensed structural and ornamental steel construction. East Coast Florida and South Florida. 17+ years experience. Request a bid for your project.",
  pathname: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesOverview />
      <ServiceArea />
      <WhyChooseUs />
      <ProjectGalleryPreview />
      <CtaSection />
    </>
  );
}
