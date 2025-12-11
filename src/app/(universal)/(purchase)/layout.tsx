import type { Metadata } from "next";
import "@/custom/globals.css";
import SiteLayout from "@/components/SiteLayout";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Masala Taste of India, Braunschweig-Broitzem",
  description: "Masala Taste of India, Indian food",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" translate="no">
      <body>
        <div translate="no">
          <SiteLayout>{children}</SiteLayout>

          {/* ✅ Toast Notification System */}
          <Toaster
            position="top-center"
            containerStyle={{ top: "30%" }}
            toastOptions={{
              style: {
                borderRadius: "10px",
                padding: "12px 16px",
                background: "#1e293b",
                color: "#f8fafc",
              },
              success: { style: { background: "#10b981", color: "#fff" } },
              error: { style: { background: "#ef4444", color: "#fff" } },
              loading: { style: { background: "#f59e0b", color: "#fff" } },
            }}
            reverseOrder={false}
          />
        </div>
      </body>
    </html>
  );
}
