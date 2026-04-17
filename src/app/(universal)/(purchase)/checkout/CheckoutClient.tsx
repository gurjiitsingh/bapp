"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import PaymentSelector from "./components/PaymentSelector";
import OrderTypeSelector from "@/components/OrderTypeSelector";
import AddressWrapper from "@/components/checkout/address/AddressWrapper";
import OrderSummaryMOB from "./components/Cart/OrderSummaryMOB";

import { DaySchedule } from "@/lib/types/daySchedule";

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
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [orderType, setOrderType] = useState<"instant" | "schedule" | null>(
    null
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div translate="no" className="bg-white flex flex-col mt-2">
        <div className="container mx-auto flex flex-col md:flex-row gap-6 p-2">
          
          <div className="flex flex-col gap-3 w-full">
            
            <StoreOpenStatus onStatusChange={setIsStoreOpen} />

            <OrderTypeSelector
              isStoreOpen={isStoreOpen}
              onSelect={setOrderType}
            />

            {orderType === "instant" && (
              <div className="mt-3 px-3 py-2 rounded-md border border-green-100 bg-green-50 text-xs text-green-700">
                Your order will be prepared in 30–45 minutes.
              </div>
            )}

            {orderType === "schedule" && (
              <SchedulePicker
                onChange={setScheduledAt}
                schedule={weeklySchedule} // ✅ from server
              />
            )}

            <AddressWrapper country="IN" />
            <PaymentSelector />
          </div>

          <OrderSummaryMOB isStoreOpen={isStoreOpen} />
        </div>
      </div>
    </Suspense>
  );
};

export default CheckoutClient;