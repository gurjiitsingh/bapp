"use client";

import { useEffect, useState } from "react";

type Props = {
  onChange: (dateTime: string) => void;
};

export default function SchedulePicker({ onChange }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Combine date + time
  useEffect(() => {
    if (date && time) {
      onChange(`${date} ${time}`);
    }
  }, [date, time]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-blue-50 p-4 rounded-xl space-y-4">
      <h3 className="font-semibold text-lg">Schedule Your Order</h3>

      {/* Date Picker */}
      <div>
        <label className="block text-sm mb-1">Select Date</label>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Time Picker */}
      <div>
        <label className="block text-sm mb-1">Select Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}
