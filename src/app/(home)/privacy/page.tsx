import PrivacyPolicy from "@/custom/cus-page/PrivacyPolicy";
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";

export default async function PrivacyPolicyWrapper() {
  const outlet = await getCachedOutlet();

  return <PrivacyPolicy outlet={outlet} />;
}