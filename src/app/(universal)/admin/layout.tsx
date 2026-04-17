import { auth } from "@/auth";
import { redirect } from "next/navigation";

import Header from "@/app/(universal)/admin/components/Header";
import SideBarBase from "./SideBarBase";
import { LanguageProvider } from "@/store/LanguageContext";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/app/Providers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ❌ Not logged in
  if (!session) {
    redirect("/auth/login");
  }

  // ❌ Not admin
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <Providers>
      <main className="relative flex text-slate-600">
        <SideBarBase />

        <div className="w-full flex flex-col">
          <div className="lg:hidden">
            <Header />
          </div>

          <div className="w-full flex flex-col px-5 pt-17 bg-[#fafafa] h-screen">
            <LanguageProvider>{children}</LanguageProvider>
          </div>
        </div>
      </main>

      <Toaster
        position="top-center"
        containerStyle={{ top: "30%" }}
      />
    </Providers>
  );
}