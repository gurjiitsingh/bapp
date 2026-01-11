"use client";

import { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import { DaySchedule } from "@/lib/types/daySchedule";



type Props = {
  onChange: (dateTime: string) => void;
  schedule: DaySchedule[]; // pass weekly schedule
};

export default function SchedulePicker({ onChange, schedule }: Props) {
  const { setScheduledAt } = useCartContext();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const MIN_BUFFER_MINUTES = 30;
  const today = new Date();

  const formatISO = (d: Date) => d.toISOString().split("T")[0];

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

    
    if (!selectedDate) return { open: "11:00", close: "22:00" }; // fallback

    const dayName = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
    }).toLowerCase();

    const day = schedule.find((d) => d.day === dayName);
    if (!day || !day.isOpen) return { open: "", close: "" }; // store closed

    return { open: day.amOpen, close: day.amClose };
  };

  //  Generate 30-min slots
const getSlots = () => {
  const SLOT_INTERVAL = 15; // minutes
  const { open, close } = getOpenClose();
  if (!open || !close) return [];

  const openMinutes = toMinutes(open);
  const closeMinutes = toMinutes(close);

  let startMinutes = openMinutes;

  const selected = new Date(selectedDate);
  const isToday = selected.toDateString() === today.toDateString();

  // 🟢 TODAY → now + 30 mins
  if (isToday) {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    startMinutes = Math.max(openMinutes, nowMinutes + MIN_BUFFER_MINUTES);
  }

  // 🟢 FUTURE DAY → open + 30 mins
  if (!isToday) {
    startMinutes = openMinutes + MIN_BUFFER_MINUTES;
  }

  // ⏱ round UP to next 15-min slot
  startMinutes = Math.ceil(startMinutes / SLOT_INTERVAL) * SLOT_INTERVAL;

  const slots: string[] = [];
  for (let m = startMinutes; m < closeMinutes; m += SLOT_INTERVAL) {
    slots.push(toTime(m));
  }

  return slots;
};


  
  // const getSlots = () => {
  //   const { open, close } = getOpenClose();
  //   if (!open || !close) return [];

  //   let start = toMinutes(open);
  //   const end = toMinutes(close);

  //   if (selectedDate === formatISO(today)) {
  //     const nowMinutes = today.getHours() * 60 + today.getMinutes();
  //     start = Math.max(start, Math.ceil((nowMinutes + MIN_BUFFER_MINUTES) / 30) * 30);
  //   }

  //   const slots: string[] = [];
  //   for (let i = start; i < end; i += 30) {
  //     slots.push(toTime(i));
  //   }
  //   return slots;
  // };



  //  Save selected date & time
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const iso = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      onChange(iso);
      setScheduledAt(iso);
    }
  }, [selectedDate, selectedTime]);

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
            onClick={() => setSelectedDate(d.value)}
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
        {slots.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
