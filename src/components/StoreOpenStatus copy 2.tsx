"use client";

import { useEffect, useState } from "react";
import { getStoreSchedule } from "@/app/actions/getStoreSchedule";

export default function StoreOpenStatus() {
  const [status, setStatus] = useState<{
    open: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function checkStatus() {
      const result = await getStoreSchedule();
      setStatus(result);
    }
    checkStatus();
  }, []);

  if (!status) return <p>Checking store status...</p>;

  return (
    <div
      className={`p-3 rounded-lg text-sm font-semibold ${
        status.open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
      }`}
    >
      {status.open ? "🟢 Store is Open" : `🔴 ${status.message}`}
    </div>
  );
}
