import { ServiceDetailPage, serviceMetadata } from "@/components/services/ServiceDetailPage";
import { SERVICES } from "@/lib/services";

const service = SERVICES["structural-steel"];

export const metadata = serviceMetadata(service);

export default function StructuralSteelPage() {
  return <ServiceDetailPage service={service} />;
}
