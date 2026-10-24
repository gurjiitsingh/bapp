"use client";

import { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import { DaySchedule } from "@/lib/types/daySchedule";
import { fromZonedTime } from "date-fns-tz";
import { toZonedTime } from "date-fns-tz";
const RESTAURANT_TIME_ZONE = "Europe/Madrid";




type Props = {
  onChange: (dateTime: string) => void;
  schedule: DaySchedule[]; // pass weekly schedule
};

export default function SchedulePicker({ onChange, schedule }: Props) {


  const { setScheduledAt } = useCartContext();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

   
  const today = toZonedTime(
  new Date(),
  RESTAURANT_TIME_ZONE
);

const formatISO = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const toTime = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
      2,
      "0"
    )}`;
 
  //  Generate next 7 days
  const getNext7Days = () =>
    Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      return {
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "long" }),
        value: formatISO(d),
      };
    });

  //  Get open/close for selected date
 
const getOpenClose = () => {
  if (!selectedDate) {
    console.log("[SCHEDULE PICKER] No date selected");
    return { open: "", close: "" };
  }

  const dayName = new Date(`${selectedDate}T00:00:00`)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase();

  const day = schedule.find(
    (d) => d.day.trim().toLowerCase() === dayName
  );

  console.group("[SCHEDULE PICKER] Schedule lookup");
  console.log("Selected date:", selectedDate);
  console.log("Weekday calculated by browser:", dayName);
  console.log("Full weekly schedule:", schedule);
  console.log("Matched schedule:", day);
  console.log("Day is open:", day?.isOpen);
  console.log("Configured opening time:", day?.amOpen);
  console.log("Configured closing time:", day?.amClose);
  console.groupEnd();

  if (!day || !day.isOpen) {
    return { open: "", close: "" };
  }

  return { open: day.amOpen, close: day.amClose };
};




const MIN_BUFFER_MINUTES = 30;

const getSlots = () => {
  const SLOT_INTERVAL = 15;

  const { open, close } = getOpenClose();

  if (!open || !close) return [];

  const openMinutes = toMinutes(open);
  const closeMinutes = toMinutes(close);

  let startMinutes = openMinutes;

  const now = new Date();
  const todayDate = formatISO(now);

  if (selectedDate === todayDate) {
    const nowMinutes =
      now.getHours() * 60 + now.getMinutes();

    const earliestAllowed =
      nowMinutes + MIN_BUFFER_MINUTES;

    startMinutes = Math.max(
      openMinutes,
      Math.ceil(earliestAllowed / SLOT_INTERVAL) *
        SLOT_INTERVAL
    );
  }

  const slots: string[] = [];

  for (
    let m = startMinutes;
    m < closeMinutes;
    m += SLOT_INTERVAL
  ) {
    slots.push(toTime(m));
  }

  return slots;
};

 
  //  Save selected date & time
// Save selected date & time using Spain's timezone
useEffect(() => {
  if (!selectedDate || !selectedTime) {
    return;
  }

  const scheduledDate = fromZonedTime(
    `${selectedDate}T${selectedTime}:00`,
    RESTAURANT_TIME_ZONE
  );

  const iso = scheduledDate.toISOString();

  onChange(iso);
  setScheduledAt(iso);
}, [
  selectedDate,
  selectedTime,
  onChange,
  setScheduledAt,
]);



  const days = getNext7Days();
  const slots = selectedDate ? getSlots() : [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Select day & time</h3>

      {/* DAY SELECTOR */}
      <div className="flex gap-2 overflow-x-auto">
        {days.map((d) => (
          <button
            key={d.value}
           onClick={() => {
  setSelectedDate(d.value);
  setSelectedTime("");
  setScheduledAt("");
}}
            className={`px-3 py-2 rounded-lg border text-sm ${
              selectedDate === d.value
                ? "bg-green-100 border-green-400 text-green-800"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* TIME SELECTOR */}
      <select
        className="border rounded-md px-3 py-2 text-sm w-full"
        value={selectedTime}
        disabled={!selectedDate || slots.length === 0}
        onChange={(e) => setSelectedTime(e.target.value)}
      >
        {!selectedDate && <option>Select day first</option>}
        {slots.length === 0 && selectedDate && <option>Store closed</option>}
          <option key="iuiuiwerwerew" value="">
            Select Time
          </option>
        {slots.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
