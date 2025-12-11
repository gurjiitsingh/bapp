import "@/custom/globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
//import { getSeoMetadata } from "@/utils/getSeoMetadata";
import CartBottom from "@/components/CartBottom/CartBottom";

import UTMInitializer from "../UTMInitializer";
import { Providers } from "../Providers";
import SafeSideCart from "./SafeSideCart";

import { BargerMenu } from "@/components/Bargermenu/Menu";
import Modal from "@/components/level-1/Modal";
import Header from "@/custom/cus-components/Header";
import Footer from "@/custom/cus-components/Footer";
import { SEO } from "@/config/languages";


// ✅ Dynamic SEO fallback logic here
//export const metadata: Metadata = getSeoMetadata();

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  other: { google: "notranslate" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" translate="no">
      <body>
        <div translate="no">
          <UTMInitializer />
          <Providers>
            <BargerMenu />
            <Modal />

            <div
              className="layout-bg relative w-full h-screen overflow-x-hidden bg-cover  m-0 p-0"
              style={{ backgroundImage: "url('/hero-bg.jpg')" }}
            >
              <div
                className="absolute top-0 inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/hero-bg.jpg')" }}
              ></div>

              <div className="z-50">
                <SafeSideCart />
              </div>

              <div className="container mx-auto top-0 px-2 md:px-0 inset-0 z-50">
                <Header />
              </div>

              {children}

              <Footer />

              <div className="fixed bottom-8 right-4 z-50 w-fit">
                {/* <CartBottom /> */}
              </div>
            </div>
          </Providers>

          <Toaster
            position="top-center"
            containerStyle={{ top: "30%" }}
            toastOptions={{
              style: {
                borderRadius: "10px",
                padding: "12px 16px",
              },
              className: "toast-default",
              success: { className: "toast-success" },
              error: { className: "toast-error" },
              loading: { className: "toast-loading" },
            }}
            reverseOrder={false}
          />
        </div>
      </body>
    </html>
  );
}
