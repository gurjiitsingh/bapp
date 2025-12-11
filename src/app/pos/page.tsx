"use client";

import { useEffect } from "react";

import Products from "@/components/level-1/ProductsPOS";
import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
import PosCart from "@/components/pos/POSCart";
import CategorySliderLight from "@/components/level-1/CategorySliderLight";
import POSTopBar from "@/components/pos/POSTopBar";

export default function POSPage() {

  useEffect(() => {
    document.body.style.background = "#f6f6f6";
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">

   

      {/* MAIN POS LAYOUT */}
      <main className="w-full flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="w-[250px] bg-white border-r border-gray-200 p-1 overflow-y-auto">
          <PosSidebarCategories />
        </aside>

        {/* PRODUCTS SECTION */}
        <section className="flex-1 overflow-y-auto p-1">
          <Products />
        </section>

        {/* RIGHT SIDEBAR CART */}
        <aside className="w-[250px] bg-white border-l border-gray-200 p-1 overflow-y-auto">
          <PosCart />
        </aside>

      </main>
    </div>
  );
}
