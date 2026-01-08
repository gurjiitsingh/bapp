"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

type Props = {
  onStatusChange: (
    isOpen: boolean,
    schedule: { open: string; close: string }
  ) => void;
};

export default function StoreOpenStatus({ onStatusChange }: Props) {
  const [message, setMessage] = useState("Checking store status...");

  useEffect(() => {
    async function checkStatus() {
      const data = await getSchedule();
      if (!data || data.length === 0) return;

      const now = new Date();
      const today = now
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      const todaySchedule = data.find(d => d.day === today);
      if (!todaySchedule) return;

      const open = todaySchedule.amOpen;
      const close = todaySchedule.amClose;

      const nowTime = now.toTimeString().slice(0, 5);

      if (nowTime >= open && nowTime <= close) {
        setMessage("🟢 Store is open now");
        onStatusChange(true, { open, close });
      } else {
        setMessage(`🔴 Closed • Opens at ${open}`);
        onStatusChange(false, { open, close });
      }
    }

    checkStatus();
  }, []);

  return (
    <div className="p-3 rounded-lg bg-slate-100 text-sm font-medium">
      {message}
    </div>
  );
}
