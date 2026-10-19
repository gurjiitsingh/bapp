// components/ContactUsWrapper.tsx

import ContactUs from "@/custom/cus-com/ContactUs";
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";

export default async function ContactUsWrapper() {
 
  const outlet = await getCachedOutlet();
  return <ContactUs outlet={outlet} />;
}