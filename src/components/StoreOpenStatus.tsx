"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

type Props = {
  onStatusChange: (open: boolean) => void;
};

export default function StoreOpenStatus({ onStatusChange }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState("Checking store status...");

  useEffect(() => {
    async function checkStatus() {
      const data = await getSchedule();
      if (!data || data.length === 0) return;

      const now = new Date();
      const today = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

      const todaySchedule = data.find(d => d.day === today);

      if (!todaySchedule || !todaySchedule.isOpen) {
        setIsOpen(false);
        setMessage("🔴 Store is currently closed");
        onStatusChange(false);
        return;
      }

      const nowTime = now.toTimeString().slice(0, 5); // HH:mm
      const open = todaySchedule.amOpen;
      const close = todaySchedule.amClose;

      if (nowTime >= open && nowTime <= close) {
        setIsOpen(true);
        setMessage("🟢 Store is open now");
        onStatusChange(true);
      } else {
        setIsOpen(false);
        setMessage(`🔴 Closed • Opens at ${open}`);
        onStatusChange(false);
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
