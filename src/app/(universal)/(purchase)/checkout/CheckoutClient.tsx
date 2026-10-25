"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import PaymentSelector from "./components/PaymentSelector";
import OrderTypeSelector from "@/components/OrderTypeSelector";
import OrderSummeryProcess from "./components/Cart/OrderSummeryProcess";

import { DaySchedule } from "@/lib/types/daySchedule";
import AddressWrapper from "@/custom/address/AddressWrapper";
import { UseSiteContext } from "@/SiteContext/SiteContext";

const ENABLE_ORDER_SCHEDULE =
  process.env.NEXT_PUBLIC_ENABLE_ORDER_SCHEDULE === "true";
// 🔥 Disable SSR
const StoreOpenStatus = dynamic(
  () => import("@/components/StoreOpenStatus"),
  { ssr: false }
);

const SchedulePicker = dynamic(
  () => import("@/components/SchedulePicker"),
  { ssr: false }
);

type Props = {
  weeklySchedule: DaySchedule[];
};

const CheckoutClient = ({ weeklySchedule }: Props) => { 
  const [mounted, setMounted] = useState(false);
  
  const [orderType, setOrderType] = useState<"instant" | "schedule" | null>(
    null
  );
 
const { isStoreOpen, setIsStoreOpen } = UseSiteContext();
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isStoreOpen) {
      setOrderType("schedule");
    } else {
      setOrderType(null);
    }
  }, [isStoreOpen, mounted]);

  // ✅ CRITICAL: prevent hydration mismatch
  if (!mounted) return null;
console.log("INSIDE CHECK OUT-----------------------", isStoreOpen)
return (
  <Suspense fallback={<div>Loading...</div>}>
    <div translate="no" className="bg-white flex flex-col mt-10">
      <div className="container mx-auto flex flex-col gap-6 p-2">
        <div className="flex flex-col gap-3 w-full">
          <PaymentSelector />
        </div>

        <div className="w-full">
          <OrderSummeryProcess isStoreOpen={isStoreOpen ?? undefined} />
        </div>
      </div>
    </div>
  </Suspense>
);
};

export default CheckoutClient;