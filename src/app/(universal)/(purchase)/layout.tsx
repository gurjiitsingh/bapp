import type { Metadata } from "next";
import "@/app/globals.css";
import SiteLayout from "@/components/SiteLayout";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Pizzeria Milano Segle, Carrer del Segle XX, 9, Horta-Guinardó, 08041 Barcelona, Spain",
  description: "Carrer del Segle XX, 9, Horta-Guinardó, 08041 Barcelona, Spain",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
   
        <div translate="no">
          <SiteLayout>{children}</SiteLayout>

          {/*  Toast Notification System */}
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
    
  );
}
