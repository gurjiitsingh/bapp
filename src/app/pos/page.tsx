"use client";

import { useEffect, useState } from "react";

import Products from "@/components/level-1/ProductsPOS";
import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
import POSCartPanel from "@/components/pos/POSCartPanel";
import FloatingCartButton from "@/components/pos/FloatingCartButton";

export default function POSPage() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.body.style.background = "#f6f6f6";
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">

      {/* MAIN POS LAYOUT */}
      <main className="w-full flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR (Categories) */}
        <aside className="w-[110px] md:w-[250px] bg-white border-r p-1 overflow-y-auto">
          <PosSidebarCategories />
        </aside>

        {/* PRODUCTS SECTION */}
        <section className="flex-1 overflow-y-auto p-1">
          <Products />
        </section>

        {/* DESKTOP CART (≥1025px) */}
        <aside className="hidden lg:block w-[250px] bg-white border-l border-gray-200 p-1 overflow-y-auto">
          <POSCartPanel
            isOpen={true}
            onClose={() => {}}
          />
        </aside>

        {/* MOBILE CART DRAWER (<1025px) */}
        <div className="lg:hidden">
          <POSCartPanel
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
          />
        </div>

      </main>

      {/* FLOATING CART BUTTON (<1025px only) */}
      <div className="lg:hidden">
        <FloatingCartButton onClick={() => setCartOpen(true)} />
      </div>
    </div>
  );
}
