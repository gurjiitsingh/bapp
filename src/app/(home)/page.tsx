// app/page.tsx

import { Suspense } from "react";
//import AOSInit from "@/components/AOSInit";

 
import BestOfMonth from "@/custom/slider/BestOfMonth";
import ContactInfoWrapper from "@/custom/cus-com/ContactInfoWrapper";
import ProductsWrapper from "@/components/ProductsWrapper";
import CategorySlider from "@/custom/slider/CategorySlider";
import HeroSectionCustom from "@/custom/cus-com/HeroSectionCustom";

export default function Page() {
  return (
    <main className="text-gray-900 font-sans">

      {/* ✅ Client-only animation init */}
      {/* <AOSInit /> */}

      {/* Sections */}
      <HeroSectionCustom />
      <BestOfMonth />
      <CategorySlider />
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsWrapper />
      </Suspense>

      {/* ✅ Server async component with streaming */}
      <Suspense fallback={<div className="h-40" />}>
        <ContactInfoWrapper />
      </Suspense>

    </main>
  );
}