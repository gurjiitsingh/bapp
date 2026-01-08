"use client";

import { useCartContext } from "@/store/CartContext";
import { useEffect, useState } from "react";

type Props = {
  onChange: (dateTime: string) => void;
  openTime?: string;
  closeTime?: string;
};

export default function SchedulePicker({
  onChange,
  openTime = "11:00",
  closeTime = "23:00",
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
const { setScheduledAt } = useCartContext();
  const today = new Date();

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  const formatWeekday = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "long" });

  const formatISO = (d: Date) => d.toISOString().split("T")[0];

  //  Only Today → Next 6 days
  const getDays = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);

      let label = formatWeekday(d);
      if (i === 0) label = "Today";
      if (i === 1) label = "Tomorrow";

      return {
        label,
        date: formatDate(d),
        value: formatISO(d),
      };
    });
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

  const getSlots = () => {
    const open = toMinutes(openTime);
    const close = toMinutes(closeTime);
    const now = new Date();

    let start = open;

    // If today, prevent past time selection
    if (selectedDate === formatISO(today)) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      start = Math.max(open, Math.ceil(nowMinutes / 15) * 15);
    }

    const slots: string[] = [];
    for (let i = start; i < close; i += 15) {
      slots.push(toTime(i));
    }

    return slots;
  };

  

//   useEffect(() => {
//   if (selectedDate && selectedTime) {
//     const value = `${selectedDate} ${selectedTime}`;
//     onChange(value);
//     setScheduledAt(value); //  SAVE TO GLOBAL CART
//   }
// }, [selectedDate, selectedTime]);

useEffect(() => {
  if (selectedDate && selectedTime) {
    // selectedDate = "2025-12-28"
    // selectedTime = "11:15"

    const localDateTime = `${selectedDate}T${selectedTime}:00`;

    // Convert local time → ISO
    const iso = new Date(localDateTime).toISOString();

    onChange(iso);
    setScheduledAt(iso); //  STORE ISO STRING
  }
}, [selectedDate, selectedTime]);

  const days = getDays();
  const slots = selectedDate ? getSlots() : [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Select day & time
      </h3>

      {/* DAY SELECTOR */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDate(d.value)}
            className={`px-3 py-2 rounded-lg text-sm text-center border min-w-[90px]
              ${
                selectedDate === d.value
                  ? "bg-green-100 border-green-400 text-green-800"
                  : "bg-white border-gray-200 text-gray-600"
              }
            `}
          >
            <div className="font-medium">{d.label}</div>
            <div className="text-xs text-gray-500">{d.date}</div>
          </button>
        ))}
      </div>

      {/* TIME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Time</label>
        <select
          className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          value={selectedTime}
          disabled={!selectedDate}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {!selectedDate && <option>Select day first</option>}
          {slots.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* <button
        disabled={!selectedDate || !selectedTime}
        className="w-full bg-green-100 hover:bg-green-200 text-gray-700 font-medium py-2 rounded-lg"
      >
        Confirm Schedule
      </button> */}
    </div>
  );
}
