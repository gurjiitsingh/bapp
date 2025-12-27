"use client";
import React, { Suspense, useState } from "react";

import Address from "./components/Address";
import CartLeft from "./components/Cart/CartLeft";
//import { SessionProvider } from "next-auth/react";
import PaymentSelector from "./components/PaymentSelector";
import StoreOpenStatus from "@/components/StoreOpenStatus";
import OrderTypeSelector from "@/components/OrderTypeSelector";
import SchedulePicker from "@/components/SchedulePicker";
const checkout = () => {
  // const { data: session } = useSession();
const [isStoreOpen, setIsStoreOpen] = useState(false);
 const [orderType, setOrderType] = useState<"instant" | "schedule" | null>(null);
const [scheduledAt, setScheduledAt] = useState<string | null>(null);

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
  <SchedulePicker onChange={setScheduledAt} />
)}


              <PaymentSelector />
              <Address />
            </div>

            {/* </div> */}

            <CartLeft />
          </div>
        </div>
      </Suspense>
   // </SessionProvider>
  );
};

export default checkout;
