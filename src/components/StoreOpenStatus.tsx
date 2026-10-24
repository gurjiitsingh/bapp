
"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

type Props = {
  onStatusChange: (
    isOpen: boolean,
    schedule: { open: string; close: string }
  ) => void;
};

const RESTAURANT_TIME_ZONE = "Europe/Madrid";

export default function StoreOpenStatus({ onStatusChange }: Props) {
  const [message, setMessage] = useState("Checking store status...");

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await getSchedule();

        if (!data || data.length === 0) {
          console.log("[STORE STATUS] No schedule found:", data);
          return;
        }

        const now = new Date();

        // Browser/device time
        const browserToday = now
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();

        const browserTime = now.toTimeString().slice(0, 5);

        // Restaurant time: Spain
        const spainParts = new Intl.DateTimeFormat("en-US", {
          timeZone: RESTAURANT_TIME_ZONE,
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).formatToParts(now);

        const getPart = (type: string) =>
          spainParts.find((part) => part.type === type)?.value ?? "";

        const spainToday = getPart("weekday").toLowerCase();
        const spainTime = `${getPart("hour")}:${getPart("minute")}`;

        // Find schedules for both weekdays
        const browserSchedule = data.find(
          (d) => d.day.trim().toLowerCase() === browserToday
        );

        const spainSchedule = data.find(
          (d) => d.day.trim().toLowerCase() === spainToday
        );

        console.group("[STORE STATUS DEBUG]");
        console.log("Current UTC time:", now.toISOString());
        console.log("Browser weekday:", browserToday);
        console.log("Browser time:", browserTime);
        console.log("Spain weekday:", spainToday);
        console.log("Spain time:", spainTime);
        console.log("Full weekly schedule:", data);
        console.log("Browser-matched schedule:", browserSchedule);
        console.log("Spain-matched schedule:", spainSchedule);
        console.groupEnd();

        // Existing logic intentionally retained for diagnosis
        const todaySchedule = spainSchedule;

        if (!todaySchedule) {
          console.error("[STORE STATUS] No schedule for browser weekday:", browserToday);
          return;
        }

        const open = todaySchedule.amOpen;
        const close = todaySchedule.amClose;

        console.log("[STORE STATUS] Values used by current logic:", {
          weekdayUsed: browserToday,
          currentTimeUsed: browserTime,
          openingTime: open,
          closingTime: close,
        });

        if (
  todaySchedule.isOpen &&
  spainTime >= open &&
  spainTime < close
) {
          setMessage("🟢 Store is open now");
          onStatusChange(true, { open, close });
        } else {
          setMessage(`🔴 Closed • Opens at ${open}`);
          onStatusChange(false, { open, close });
        }
      } catch (error) {
        console.error("[STORE STATUS] Failed to check status:", error);
      }
    }

    checkStatus();
  }, [onStatusChange]);

  return (
    <div className="p-3 rounded-lg bg-slate-100 text-sm font-medium">
      {message}
    </div>
  );
}
