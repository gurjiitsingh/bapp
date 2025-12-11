"use client";

import Header from "@/custom/cus-components/Header";
import Footer from "@/custom/cus-components/Footer";
import { SideCart } from "@/components/MiniCart/SideCart";
import { BargerMenu } from "@/components/Bargermenu/Menu";
import { Providers } from "@/app/Providers";
import dynamic from "next/dynamic";

// ✅ Conditionally import CartBottom based on .env (completely excluded if disabled)
const isCartEnabled = process.env.NEXT_PUBLIC_CART_BOTTOM_ENABLED === "true";
const CartBottom = isCartEnabled
  ? dynamic(() => import("@/components/CartBottom/CartBottom"), { ssr: false })
  : null;

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      {/* Global UI Components */}
      <BargerMenu />
      <SideCart />

      {/* Header */}
     
        <Header />
    

      {/* Main Page Content */}
      <main className="mt-[70px]">{children}</main>

      {/* Footer */}
      <Footer />

      {/* ✅ Cart button — only renders if enabled in .env */}
      {isCartEnabled && CartBottom && (
        <div className="fixed bottom-8 right-4 z-50 w-fit">
          <CartBottom />
        </div>
      )}
    </Providers>
  );
}
