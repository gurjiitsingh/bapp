// components/FooterWrapper.tsx
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";
import Footer from "@/custom/cus-com/Footer";

export default async function FooterWrapper() {
  const outlet = await getCachedOutlet();

  return <Footer outlet={outlet} />;
}