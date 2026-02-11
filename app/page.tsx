import { Hero } from "@/components/sections/Hero";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ProjectGalleryPreview } from "@/components/sections/ProjectGalleryPreview";
import { CtaSection } from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <ServiceArea />
      <WhyChooseUs />
      <ProjectGalleryPreview />
      <CtaSection />
    </>
  );
}
