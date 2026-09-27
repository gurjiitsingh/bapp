"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  getSchedule,
  saveDaySchedule,
} from "@/app/(universal)/action/schedule/saveDaySchedule";

type DaySchedule = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type ScheduleFormType = {
  schedule: DaySchedule[];
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

const defaultSchedule: DaySchedule[] = [
  {
    day: "monday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    day: "tuesday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    day: "wednesday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    day: "thursday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    day: "friday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    day: "saturday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "20:00",
  },
  {
    day: "sunday",
    isOpen: false,
    openTime: "",
    closeTime: "",
  },
];

export default function ScheduleForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<ScheduleFormType>({
    defaultValues: {
      schedule: defaultSchedule,
    },
  });

  const [sortedSchedule, setSortedSchedule] = useState<DaySchedule[]>([]);
  const [sameForAll, setSameForAll] = useState(false);

  const schedule = watch("schedule");

  // Load saved schedule
  useEffect(() => {
    async function loadData() {
      const data = await getSchedule();

      if (data?.length) {
        reset({
          schedule: data,
        });
      }
    }

    loadData();
  }, [reset]);

  // Sort days Monday -> Sunday
  useEffect(() => {
    if (!schedule?.length) return;

    const sorted = [...schedule].sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
    );

    setSortedSchedule(sorted);
  }, [schedule]);

  // Apply first day's timing to all days
  useEffect(() => {
    if (!sameForAll) return;

    const firstDay = schedule[0];

    if (!firstDay) return;

    schedule.forEach((day, realIndex) => {
      setValue(
        `schedule.${realIndex}.isOpen`,
        firstDay.isOpen
      );

      setValue(
        `schedule.${realIndex}.openTime`,
        firstDay.openTime
      );

      setValue(
        `schedule.${realIndex}.closeTime`,
        firstDay.closeTime
      );
    });
  }, [sameForAll, schedule, setValue]);

  async function onSubmit(data: ScheduleFormType) {
    console.log("FINAL SCHEDULE:", data);

    const formData = new FormData();

    data.schedule.forEach((day, realIndex) => {
      formData.append(
        `schedule[${realIndex}][day]`,
        day.day
      );

      formData.append(
        `schedule[${realIndex}][isOpen]`,
        String(day.isOpen)
      );

      formData.append(
        `schedule[${realIndex}][openTime]`,
        day.openTime || ""
      );

      formData.append(
        `schedule[${realIndex}][closeTime]`,
        day.closeTime || ""
      );
    });

    const res = await saveDaySchedule(formData);

    if (!res?.success) {
      alert("❌ Failed to save schedule");
    } else {
      alert("Schedule saved successfully");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-4xl mx-auto p-5"
    >
      <h1 className="text-2xl font-semibold mb-4">
        Food Ordering Timings
      </h1>

      {/* Same timing for all days */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="checkbox"
          checked={sameForAll}
          onChange={(e) =>
            setSameForAll(e.target.checked)
          }
          className="h-4 w-4"
        />

        <span className="text-sm font-medium">
          Apply same timing for all days
        </span>
      </div>

      {sortedSchedule.map((day) => {
        const realIndex = schedule.findIndex(
          (d) => d.day === day.day
        );

        return (
          <div
            key={day.day}
            className="bg-gray-100 rounded-xl p-4 mb-4"
          >
            {/* Hidden day */}
            <input
              type="hidden"
              {...register(
                `schedule.${realIndex}.day`
              )}
              value={day.day}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="capitalize font-semibold">
                {day.day}
              </h3>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register(
                    `schedule.${realIndex}.isOpen`
                  )}
                  className="h-4 w-4"
                />

                Open
              </label>
            </div>

            {/* Timing */}
            {day.isOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Opening Time
                  </label>

                  <input
                    type="time"
                    className="w-full rounded-lg border bg-white px-3 py-2"
                    {...register(
                      `schedule.${realIndex}.openTime`
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Closing Time
                  </label>

                  <input
                    type="time"
                    className="w-full rounded-lg border bg-white px-3 py-2"
                    {...register(
                      `schedule.${realIndex}.closeTime`
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button
        className="mt-6 w-full"
        type="submit"
      >
        Save Schedule
      </Button>
    </form>
  );
}
 
