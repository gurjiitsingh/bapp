// components/ContactUsWrapper.tsx

import ContactUs from "@/custom/cus-components/ContactUs";
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";

export default async function ContactUsWrapper() {
 
  const outlet = await getCachedOutlet();
  return <ContactUs outlet={outlet} />;
}