"use client";

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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeString = (minutes: number) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const getRoundedNow = () => {
    const now = new Date();
    const rounded = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(rounded, 0, 0);
    return toTimeString(now.getHours() * 60 + now.getMinutes());
  };

  const generateSlots = () => {
    const slots: string[] = [];
    const open = toMinutes(openTime);
    const close = toMinutes(closeTime);

    let start =
      selectedDate === todayStr
        ? Math.max(open, toMinutes(getRoundedNow()))
        : open;

    for (let i = start; i < close; i += 15) {
      slots.push(toTimeString(i));
    }

    return slots;
  };

  const slots = selectedDate ? generateSlots() : [];

  useEffect(() => {
    if (selectedDate && slots.length > 0) {
      setSelectedTime(slots[0]);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      onChange(`${selectedDate} ${selectedTime}`);
    }
  }, [selectedDate, selectedTime]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">
        Select day & time
      </h3>
<div className="flex gap-1">
      {/* DAY */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500">Day</label>
        <select
          className="border border-gray-200 text-sm rounded-lg px-1 py-1 focus:ring-2 focus:ring-green-100"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option className="text-sm text-gray-500" value="">Select</option>
          <option className="text-sm text-gray-500" value={todayStr}>Today</option>
          <option className="text-sm text-gray-500" value={tomorrowStr}>Tomorrow</option>
        </select>
      </div>

      {/* TIME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Time</label>
        <select
          className="border border-gray-200 text-sm rounded-lg px-1 py-1 focus:ring-2 focus:ring-green-100"
          value={selectedTime}
          disabled={!selectedDate}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {!selectedDate && <option className="text-sm text-gray-500">Select day first</option>}
          {slots.map((t) => (
            <option className="text-sm text-gray-500" key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
</div>
      {/* CONFIRM */}
      <button
        disabled={!selectedDate || !selectedTime}
        className="mt-2 w-full bg-green-100 hover:bg-green-200 text-gray-600 font-semibold py-1 rounded-lg disabled:bg-gray-200 transition"
      >
        Confirm Time
      </button>
    </div>
  );
}
