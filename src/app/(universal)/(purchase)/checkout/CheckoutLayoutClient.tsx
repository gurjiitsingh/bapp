"use client";

import { useCallback, useState } from "react";
import { DaySchedule } from "@/lib/types/daySchedule";
import Scheduler from "./StoreTiming";
import CheckoutClient from "./CheckoutClient";
import AddressWrapper from "@/custom/address/AddressWrapper";

type Props = {
  weeklySchedule: DaySchedule[];
};

export default function CheckoutLayoutClient({
  weeklySchedule,
}: Props) {
  const [isStoreOpen, setIsStoreOpen] = useState<boolean | null>(null);

  const handleStoreStatusChange = useCallback((open: boolean) => {
    setIsStoreOpen(open);
  }, []);

  return (
    <div className="max-w-7xl m-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3 min-w-0">
        {/* <Scheduler
          weeklySchedule={weeklySchedule}
          isStoreOpen={isStoreOpen}
          onStoreStatusChange={handleStoreStatusChange}
        /> */}
        {/* <AddressWrapper /> */}
      </div>

      <div className="min-w-0">
        {/* <CheckoutClient isStoreOpen={isStoreOpen} /> */}
      </div>
    </div>
  );
}