"use client";

import { useEffect, useState } from "react";

import Products from "@/components/level-1/ProductsPOS";
import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
import POSCartPanel from "@/components/pos/POSCartPanel";
import FloatingCartButton from "@/components/pos/FloatingCartButton";
import POSOrderInfo from "@/components/pos/POSOrderInfo";

export default function POSPage() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.body.style.background = "#F8FAFC";
  }, []);

  return (
    <div className="h-screen bg-slate-50 flex flex-col">

      {/* ================= TOP BAR ================= */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 shadow-sm">

        <div className="flex items-center gap-4">

          <h1 className="text-xl font-bold text-slate-800">
            Restaurant POS
          </h1>

          <POSOrderInfo />

        </div>

        <div className="flex items-center gap-3">

          <input
            placeholder="Search products..."
            className="
              w-80
              h-10
              rounded-lg
              border
              border-slate-300
              px-3
              outline-none
              focus:ring-2
              focus:ring-orange-400
            "
          />

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="flex flex-1 overflow-hidden">

        {/* LEFT MENU */}

        <aside className="
            w-[250px]
            bg-slate-800
            text-white
            border-r
            border-slate-700
            overflow-y-auto
        ">
          <PosSidebarCategories />
        </aside>

        {/* PRODUCTS */}

        <section className="flex-1 overflow-y-auto p-4">

          <Products />

        </section>

        {/* CART */}

        <aside className="
            hidden
            xl:flex
            w-[360px]
            bg-white
            border-l
            border-slate-200
        ">

          <POSCartPanel
            isOpen={true}
            onClose={() => {}}
          />

        </aside>

        {/* Mobile Cart */}

        <div className="xl:hidden">
          <POSCartPanel
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
          />
        </div>

      </main>

      {/* Floating Button */}

      <div className="xl:hidden">

        <FloatingCartButton
          onClick={() => setCartOpen(true)}
        />

      </div>

    </div>
  );
}