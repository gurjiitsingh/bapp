"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

type TimeSlot = {
  open: string;
  close: string;
};

type Props = {
  onStatusChange: (
    isOpen: boolean,
    schedule: { open: string; close: string }
  ) => void;
};

const RESTAURANT_TIME_ZONE = "Europe/Madrid";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isValidSlot(slot: TimeSlot): boolean {
  return (
    /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.open) &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.close) &&
    slot.open !== slot.close
  );
}

export default function StoreOpenStatus({
  onStatusChange,
}: Props) {
  const [message, setMessage] = useState(
    "Checking store status..."
  );

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const data = await getSchedule();

        if (!data || data.length === 0) {
          console.log("[STORE STATUS] No schedule found:", data);
          return;
        }

        const now = new Date();

        // Use restaurant-local date and time.
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: RESTAURANT_TIME_ZONE,
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).formatToParts(now);

        const getPart = (type: string) =>
          parts.find((part) => part.type === type)?.value ?? "";

        const today = getPart("weekday").toLowerCase();
        const currentTime = `${getPart("hour")}:${getPart("minute")}`;
        const currentMinutes = toMinutes(currentTime);
        const todayIndex = DAY_ORDER.indexOf(today);

        const scheduleByDay = new Map(
          data.map((day) => [
            day.day.trim().toLowerCase(),
            day,
          ])
        );

        const todaySchedule = scheduleByDay.get(today);

        if (!todaySchedule || todayIndex < 0) {
          console.error(
            "[STORE STATUS] No schedule for restaurant weekday:",
            today
          );
          return;
        }

        const getSlots = (day: (typeof data)[number]): TimeSlot[] =>
          day.isOpen && Array.isArray(day.slots)
            ? day.slots.filter(isValidSlot)
            : [];

        const todaySlots = getSlots(todaySchedule);

        // Check today's opening slots.
        const activeSlot = todaySlots.find((slot) => {
          const open = toMinutes(slot.open);
          const close = toMinutes(slot.close);

          // Normal same-day opening.
          if (open < close) {
            return currentMinutes >= open && currentMinutes < close;
          }

          // Overnight opening, e.g. 18:00–02:00.
          return currentMinutes >= open || currentMinutes < close;
        });

        // If today's own slot is not active, check whether yesterday's
        // overnight slot is still open after midnight.
        const yesterdayIndex =
          (todayIndex + DAY_ORDER.length - 1) % DAY_ORDER.length;

        const yesterday = scheduleByDay.get(
          DAY_ORDER[yesterdayIndex]
        );

        const overnightSlot = yesterday
          ? getSlots(yesterday).find(
              (slot) =>
                toMinutes(slot.open) > toMinutes(slot.close) &&
                currentMinutes < toMinutes(slot.close)
            )
          : undefined;

        const currentlyActiveSlot = activeSlot ?? overnightSlot;

        console.group("[STORE STATUS DEBUG]");
        console.log("Restaurant weekday:", today);
        console.log("Restaurant time:", currentTime);
        console.log("Today's schedule:", todaySchedule);
        console.log("Today's slots:", todaySlots);
        console.log("Active slot:", currentlyActiveSlot);
        console.groupEnd();

        if (cancelled) return;

        if (currentlyActiveSlot) {
          setMessage("🟢 Store is open now");

          onStatusChange(true, {
            open: currentlyActiveSlot.open,
            close: currentlyActiveSlot.close,
          });

          return;
        }

        // Find the next opening slot within the next seven days.
        let nextSlot: TimeSlot | undefined;

        for (let offset = 0; offset < 7; offset++) {
          const dayIndex =
            (todayIndex + offset) % DAY_ORDER.length;

          const day = scheduleByDay.get(DAY_ORDER[dayIndex]);

          if (!day) continue;

          const slots = getSlots(day).sort(
            (a, b) => toMinutes(a.open) - toMinutes(b.open)
          );

          nextSlot = slots.find((slot) => {
            if (offset === 0) {
              return toMinutes(slot.open) > currentMinutes;
            }

            return true;
          });

          if (nextSlot) break;
        }

        if (nextSlot) {
          setMessage(`🔴 Closed • Opens at ${nextSlot.open}`);

          onStatusChange(false, {
            open: nextSlot.open,
            close: nextSlot.close,
          });
        } else {
          setMessage("🔴 Closed");

          onStatusChange(false, {
            open: "",
            close: "",
          });
        }
      } catch (error) {
        console.error(
          "[STORE STATUS] Failed to check status:",
          error
        );
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, [onStatusChange]);

  // Keep the existing UI unchanged.
  return (
    <div className="p-3 rounded-lg bg-slate-100 text-sm font-medium">
      {message}
    </div>
  );
}