"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

export type DaySchedule = {
  day: string;
  isOpen: boolean;
  fullDay: boolean;
  amOpen: string;
  amClose: string;
  pmOpen: string;
  pmClose: string;
  updatedAt: string | null;
};

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function OpeningHours() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSchedule();
      const sorted = data.sort(
        (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      );
      setSchedule(sorted);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading hours...</p>;
  }

  return (
    <div className="max-w-md mx-auto rounded-xl p-1">
      {/* <h2 className="text-xl font-semibold mb-4">Opening Hours</h2> */}

      <ul className="space-y-3">
        {schedule.map((day) => (
          <li key={day.day} className="flex justify-between items-center">
            <span className="capitalize font-medium">{day.day}</span>

            {!day.isOpen ? (
              <span className="text-red-500">Closed</span>
            ) : day.fullDay ? (
              <span className="text-green-600">
                {day.amOpen} – {day.amClose}
              </span>
            ) : (
              <span className="text-sm text-gray-700 text-right">
                {day.amOpen} – {day.amClose}
                <br />
                {day.pmOpen} – {day.pmClose}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
