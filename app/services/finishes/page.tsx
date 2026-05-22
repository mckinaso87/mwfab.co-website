import { ServiceDetailPage, serviceMetadata } from "@/components/services/ServiceDetailPage";
import { SERVICES } from "@/lib/services";

const service = SERVICES.finishes;

export const metadata = serviceMetadata(service);

export default function FinishesPage() {
  return <ServiceDetailPage service={service} />;
}
