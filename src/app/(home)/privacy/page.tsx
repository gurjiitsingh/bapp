import PrivacyPolicy from "@/custom/cus-components/PrivacyPolicy";
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";

export default async function PrivacyPolicyWrapper() {
  const outlet = await getCachedOutlet();

  return <PrivacyPolicy outlet={outlet} />;
}