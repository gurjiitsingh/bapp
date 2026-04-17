import PrivacyPolicy_en from "@/custom/cus-components/PrivacyPolicy-en";
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";

export default async function PrivacyPolicyEnWrapper() {
  const outlet = await getCachedOutlet();

  return <PrivacyPolicy_en outlet={outlet} />;
}