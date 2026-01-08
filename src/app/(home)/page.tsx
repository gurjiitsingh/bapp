// app/page.tsx
"use client";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import ContactInfo from "@/custom/cus-components/ContactInfo";
import SlidersByCatId from "@/custom/cus-components/SlidersByCatId";


import HeroSectionCustom from "@/custom/cus-components/HeroSectionCustom";

import CategorySliderSm2 from "@/components/level-1/CategorySliderSm2";
import Products from "@/components/level-1/Products";
import CategorySliderLight from "@/components/level-1/CategorySliderLight";
import BestOfMonth from "@/custom/cus-components/BestOfMonth";


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
      {/* <FlavorLine /> */}
      {/* <HeroSection /> */}
      <HeroSectionCustom />
 <BestOfMonth />
   <CategorySliderLight />
   
      <Products />
     
     

    
      <ContactInfo />
      {/* <MenuPreview /> */}
      {/* <Contact />
      <Footer /> */}
    </main>
  );
}
