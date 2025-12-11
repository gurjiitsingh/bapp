"use client";


//import CategorySlider from "@/components/level-1/CategorySlider";

import { useLanguage } from "@/store/LanguageContext";
import HeroSectionCustom from "@/custom/cus-components/HeroSectionCustom";
import ProductMenuList from "@/components/level-1/ProductsMenuList";


//import { TnewProductSchema } from '@/lib/types';
// import {  TnewProductSchema } from '@/lib/type/productType';

export default function Page() {
  // const products = await fetchProducts();

  const { lang } = useLanguage();

  if (!lang) {
    return (
      <div className="text-center p-4 text-gray-500">Loading language...</div>
    );
  }

  return (
    <>
    <main className=" text-gray-900 font-sans">
    
        
          <HeroSectionCustom />
          <ProductMenuList />
          {/* <ProductCategorySliderList />
          <Products /> */}
     
      </main>
    </>
  );
}
