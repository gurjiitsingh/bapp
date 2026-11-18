"use client";

import { UseSiteContext } from "@/SiteContext/SiteContext";

export default function CheckoutAddressSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const { deliveryType } = UseSiteContext();

  if (deliveryType !== "delivery") return null;

  return <div className="w-full">{children}</div>;
}