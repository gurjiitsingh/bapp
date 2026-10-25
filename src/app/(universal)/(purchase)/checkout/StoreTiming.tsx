"use client";

import   { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import PaymentSelector from "./components/PaymentSelector";
import OrderTypeSelector from "@/components/OrderTypeSelector";
import { DaySchedule } from "@/lib/types/daySchedule";
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

const Scheduler = ({ weeklySchedule }: Props) => {
  const [mounted, setMounted] = useState(false);
  // const [isStoreOpen, setIsStoreOpen] = useState(false);
 
  const [orderType, setOrderType] = useState<"instant" | "schedule" | null>(
    null
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
const { isStoreOpen, setIsStoreOpen } = UseSiteContext();
  useEffect(() => {
    setMounted(true);
  }, []);

useEffect(() => {
  if (!mounted || isStoreOpen === null) return;

  setOrderType(isStoreOpen ? "instant" : "schedule");
}, [isStoreOpen, mounted]);

  // ✅ CRITICAL: prevent hydration mismatch
  if (!mounted) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div translate="no" className="bg-white flex flex-col mt-10">
        <div className="container mx-auto flex flex-col md:flex-row gap-6 p-2">

          <div className="flex flex-col gap-3 w-full">

            {ENABLE_ORDER_SCHEDULE && (
              <>
             <StoreOpenStatus
  onStatusChange={(open) => setIsStoreOpen(open)}
/>

{isStoreOpen !== null && (
  <OrderTypeSelector
    isStoreOpen={isStoreOpen}
    onSelect={setOrderType}
  />
)}

                {orderType === "instant" && (
                  <div>
                    Your order will be prepared in 30–45 minutes.
                  </div>
                )}

                {orderType === "schedule" && (
                  <SchedulePicker
                    onChange={setScheduledAt}
                    schedule={weeklySchedule}
                  />
                )}
              </>
            )}



          </div>


        </div>
      </div>
    </Suspense>
  );
};

export default Scheduler;