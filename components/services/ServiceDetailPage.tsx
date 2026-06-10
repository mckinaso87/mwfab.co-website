import type { ServiceDefinition } from "@/lib/services";
import { publicPageMetadata } from "@/lib/metadata";
import { ServiceDetailPageClient } from "./ServiceDetailPageClient";

interface ServiceDetailPageProps {
  service: ServiceDefinition;
}

export function serviceMetadata(service: ServiceDefinition) {
  return publicPageMetadata({
    title: service.metadataTitle,
    description: service.metadataDescription,
    pathname: `/services/${service.slug}`,
  });
}

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  return <ServiceDetailPageClient service={service} />;
}
