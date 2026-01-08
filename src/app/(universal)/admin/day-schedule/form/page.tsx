"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { getSchedule, saveDaySchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

type DaySchedule = {
  day: string;
  isOpen: boolean;
  fullDay: boolean;
  amOpen: string;
  amClose: string;
  pmOpen: string;
  pmClose: string;
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
  { day: "monday", isOpen: true, fullDay: true, amOpen: "09:00", amClose: "20:00", pmOpen: "", pmClose: "" },
  { day: "tuesday", isOpen: true, fullDay: true, amOpen: "09:00", amClose: "20:00", pmOpen: "", pmClose: "" },
  { day: "wednesday", isOpen: true, fullDay: true, amOpen: "09:00", amClose: "20:00", pmOpen: "", pmClose: "" },
  { day: "thursday", isOpen: true, fullDay: true, amOpen: "09:00", amClose: "20:00", pmOpen: "", pmClose: "" },
  { day: "friday", isOpen: true, fullDay: true, amOpen: "09:00", amClose: "20:00", pmOpen: "", pmClose: "" },
  { day: "saturday", isOpen: true, fullDay: true, amOpen: "09:00", amClose: "20:00", pmOpen: "", pmClose: "" },
  { day: "sunday", isOpen: false, fullDay: false, amOpen: "", amClose: "", pmOpen: "", pmClose: "" },
];



export default function ScheduleForm() {
  const { register, handleSubmit, watch, setValue, reset } = useForm<ScheduleFormType>({
    defaultValues: { schedule: defaultSchedule },
  });
const [sortedSchedule, setSortedSchedule] = useState<DaySchedule[]>([]);
const [sameForAll, setSameForAll] = useState(false);
  const schedule = watch("schedule");

  // auto-clear pm when full day
  useEffect(() => {
    schedule.forEach((day, realIndex) => {
      if (day.fullDay) {
        setValue(`schedule.${realIndex}.pmOpen`, "");
        setValue(`schedule.${realIndex}.pmClose`, "");
      }
    });
  }, [schedule, setValue]);

  useEffect(() => {
  async function loadData() {
    const data = await getSchedule();

    if (data?.length) {
      reset({ schedule: data });
    }
  }

  loadData();
}, [reset]);

useEffect(() => {
  if (!schedule?.length) return;



  const sorted = [...schedule].sort(
  (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
);

  setSortedSchedule(sorted);
}, [schedule])


useEffect(() => {
  if (!sameForAll) return;

  const firstDay = schedule[0];
  if (!firstDay) return;

  const updated = schedule.map((day) => ({
    ...day,
    isOpen: firstDay.isOpen,
    fullDay: firstDay.fullDay,
    amOpen: firstDay.amOpen,
    amClose: firstDay.amClose,
    pmOpen: firstDay.pmOpen,
    pmClose: firstDay.pmClose,
  }));

  updated.forEach((day, realIndex) => {
    setValue(`schedule.${realIndex}.isOpen`, day.isOpen);
    setValue(`schedule.${realIndex}.fullDay`, day.fullDay);
    setValue(`schedule.${realIndex}.amOpen`, day.amOpen);
    setValue(`schedule.${realIndex}.amClose`, day.amClose);
    setValue(`schedule.${realIndex}.pmOpen`, day.pmOpen);
    setValue(`schedule.${realIndex}.pmClose`, day.pmClose);
  });
}, [sameForAll, schedule, setValue]);


  async function onSubmit(data: ScheduleFormType) {
    console.log("FINAL SCHEDULE:", data);

    const formData = new FormData();

    data.schedule.forEach((day, realIndex) => {
    formData.append(`schedule[${realIndex}][day]`, day.day);
    formData.append(`schedule[${realIndex}][isOpen]`, String(day.isOpen));
    formData.append(`schedule[${realIndex}][fullDay]`, String(day.fullDay));
    formData.append(`schedule[${realIndex}][amOpen]`, day.amOpen || "");
    formData.append(`schedule[${realIndex}][amClose]`, day.amClose || "");
    formData.append(`schedule[${realIndex}][pmOpen]`, day.pmOpen || "");
    formData.append(`schedule[${realIndex}][pmClose]`, day.pmClose || "");
  });

    const res = await saveDaySchedule(formData);

    if (!res?.success) {
      alert("❌ Failed to save schedule");
    } else {
      alert(" Schedule saved successfully");
    }
  }



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl mx-auto p-5">
     <h1 className="text-2xl font-semibold mb-4">Food Ordering Timings</h1>

     <div className="flex items-center gap-2 mb-4">
  <input
    type="checkbox"
    checked={sameForAll}
    onChange={(e) => setSameForAll(e.target.checked)}
  />
  <span className="text-sm font-medium">
    Apply same timing for all days
  </span>
</div>

      {sortedSchedule.map((day) => {
         const realIndex = schedule.findIndex(d => d.day === day.day);

  return (<div key={day.day} className="bg-gray-100 rounded-xl p-4 mb-4">
          {/* hidden field – VERY IMPORTANT */}
          <input
            type="hidden"
            {...register(`schedule.${realIndex}.day`)}
            value={day.day}
          />

          <div className="flex justify-between mb-3">
            <h3 className="capitalize font-semibold">{day.day}</h3>

            <div className="flex gap-4">
              <label>
                <input type="checkbox" {...register(`schedule.${realIndex}.isOpen`)} /> Open
              </label>

              <label>
                <input type="checkbox" {...register(`schedule.${realIndex}.fullDay`)} /> Full Day
              </label>
            </div>
          </div>

          {day.isOpen && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="time"  className="pr-15" {...register(`schedule.${realIndex}.amOpen`)} />
              <input type="time"  className="pr-15" {...register(`schedule.${realIndex}.amClose`)} />
              {!day.fullDay && (
                <>
                  <input type="time"  className="pr-15" {...register(`schedule.${realIndex}.pmOpen`)} />
                  <input type="time"  className="pr-15" {...register(`schedule.${realIndex}.pmClose`)} />
                </>
              )}
            </div>
          )}
        </div>
      )})}

      <Button className="mt-6 w-full" type="submit">
        Save Schedule
      </Button>
    </form>
  );
}
