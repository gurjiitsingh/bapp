"use client";
import React, { Suspense, useEffect, useState } from "react";

import Address from "./components/Address";

//import { SessionProvider } from "next-auth/react";
import PaymentSelector from "./components/PaymentSelector";
import StoreOpenStatus from "@/components/StoreOpenStatus";
import OrderTypeSelector from "@/components/OrderTypeSelector";
import SchedulePicker from "@/components/SchedulePicker";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";
import OrderSummary from "./components/Cart/OrderSummary";
import AddressWrapper from "@/components/checkout/address/AddressWrapper";
import "@/css/style.css";
import OrderSummaryMOB from "./components/Cart/OrderSummaryMOB";
import { DaySchedule } from "@/lib/types/daySchedule";

const checkout = () => {
  // const { data: session } = useSession();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [orderType, setOrderType] = useState<"instant" | "schedule" | null>(
    null
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  const [daySchedule, setDaySchedule] = useState<{
    open: string;
    close: string;
  } | null>(null);

  useEffect(() => {
    if (orderType === "schedule") {
      setDaySchedule({
        open: "11:00",
        close: "22:00",
      });
    }
  }, [orderType]);

  

  // 🔹 Load weekly schedule once
  useEffect(() => {
    async function load() {
      const data = await getSchedule();
      setWeeklySchedule(data);
    }
    load();
  }, []);

  // 🔹 If store is closed → force schedule
 useEffect(() => {
  if (!isStoreOpen) {
    setOrderType("schedule"); // force schedule if store closed
  } else {
    setOrderType(null); // allow user to choose (default = instant)
  }
}, [isStoreOpen]);

  // inside your component
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);

  //  Fetch weekly schedule on mount
  useEffect(() => {
    async function fetchSchedule() {
      const data = await getSchedule(); // Firestore fetch
      setWeeklySchedule(data);
    }
    fetchSchedule();
  }, []);

  return (
    // <SessionProvider>
    <Suspense>
      {/* <div className="bg-gradient-to-bl from-[#f9f9f9]  to-[#f2f1eb]  flex flex-col mt-2"> */}
      <div translate="no" className="bg-white  flex flex-col mt-2">
        <div className="container mx-auto flex flex-col md:flex-row gap-6 p-2">
          {/* <div className="flex flex-col w-full lg:w-[65%]"> */}
          <div className="flex flex-col gap-3 w-full">
            {/* Store Status */}
            <StoreOpenStatus onStatusChange={setIsStoreOpen} />

            {/* Order Type */}
            <OrderTypeSelector
              isStoreOpen={isStoreOpen}
              onSelect={setOrderType}
            />

            {/* Next Step */}

            {orderType === "instant" && (
              <div className="mt-3 px-3 py-2 rounded-md border border-green-100 bg-green-50 text-xs text-green-700">
                Your order will be prepared in 30–45 minutes.
              </div>
            )}

            {orderType === "schedule" && (
              <SchedulePicker
                onChange={setScheduledAt}
                schedule={weeklySchedule} // fetch this from Firestore using getSchedule()
              />
            )}

        
            {/* <Address /> */}
            <AddressWrapper country="IN" />
                <PaymentSelector />
          </div>

          {/* </div> */}

          <OrderSummaryMOB  isStoreOpen={isStoreOpen} />
        </div>
      </div>
    </Suspense>
    // </SessionProvider>
  );
};

export default checkout;
