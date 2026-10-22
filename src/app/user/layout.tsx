
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function UserLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  // Require an authenticated session.
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Only customer accounts can access /user.
  if (session.user.role !== "user") {
    redirect("/");
  }

  return <>{children}</>;
}
