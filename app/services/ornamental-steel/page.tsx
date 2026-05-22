import { ServiceDetailPage, serviceMetadata } from "@/components/services/ServiceDetailPage";
import { SERVICES } from "@/lib/services";

const service = SERVICES["ornamental-steel"];

export const metadata = serviceMetadata(service);

export default function OrnamentalSteelPage() {
  return <ServiceDetailPage service={service} />;
}
