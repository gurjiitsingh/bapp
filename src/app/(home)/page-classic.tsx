// app/page.tsx
"use client";
import AOS from "aos";
import "aos/dist/aos.css";

import HeroImage from "@/custom/cus-components/HeroImageClassic";
import { useEffect } from "react";
import FlyerBuffet from "@/custom/cus-components/FlyerBuffet";
import FlavorLine from "@/custom/cus-components/FlavorLine";
import SpecialRecommendations from "@/custom/cus-components/SpecialRecommendations";
import ContactInfo from "@/custom/cus-components/ContactInfo";
import QuoteBanner from "@/custom/cus-components/QuoteBanner";
import Catering from "@/custom/cus-components/Catering";

// import MenuPreview from "@/components/MenuPreview";
// import Contact from "@/components/Contact";
// import Footer from "@/components/Footer";

export default function Page() {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  return (
    <main className=" text-gray-900 font-sans">
      <FlavorLine />
      <HeroImage />
      <SpecialRecommendations />
      {/* <About /> */}
      {/* <MasalaFlyer /> */}
      <FlyerBuffet />

      <QuoteBanner />
      <Catering />
      <ContactInfo />
      {/* <MenuPreview /> */}
      {/* <Contact />
      <Footer /> */}
    </main>
  );
}
