import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import CartBottomWrapper from "@/components/CartBottom/CartBottomWrapper"; // Import the new client component
import "@/css/style.css";
import UTMInitializer from "../UTMInitializer";
import { Providers } from "../Providers";


import { BargerMenu } from "@/components/Bargermenu/Menu";
import Modal from "@/components/level-1/Modal";
import Header from "@/custom/cus-components/Header";
import Footer from "@/custom/cus-components/Footer";
import { SEO } from "@/config/languages";


import {  Lato  } from "next/font/google";
import POSTopBar from "@/components/pos/POSTopBar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});


export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  other: { google: "notranslate" },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },

  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: "https://indozestfusioncafe.com",
    siteName: SEO.title,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" translate="no">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Days+One&family=Dosis&family=Quicksand&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dosis:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lato.className} bg-white text-[#2b2b2b]`}>
        <div className="text-[#2B2E4A]">
          <div translate="no">
            <UTMInitializer />
            <Providers>
              <BargerMenu />
              <Modal />

              <div className="flex flex-col gap-0 my-0">
                <div className="z-50">
              
                </div>

               {/*  TOP BAR */}
      <POSTopBar />

                {children}

             

              
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
        </div>
      </body>
    </html>
  );
}
