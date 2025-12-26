"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { saveDaySchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

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
  const { register, handleSubmit, watch, setValue } = useForm<ScheduleFormType>({
    defaultValues: { schedule: defaultSchedule },
  });

  const schedule = watch("schedule");

  // Auto-clear PM times when full day is selected
  useEffect(() => {
    schedule.forEach((day, index) => {
      if (day.fullDay) {
        setValue(`schedule.${index}.pmOpen`, "");
        setValue(`schedule.${index}.pmClose`, "");
      }
    });
  }, [schedule, setValue]);

async function onSubmit(data: ScheduleFormType){
    console.log("FINAL SCHEDULE:", data);

    const formData = new FormData();

    data.schedule.forEach((day, index) => {
      
      formData.append(`schedule[${index}][day]`, day.day ?? "");
      formData.append(`schedule[${index}][isOpen]`, String(day.isOpen));
      formData.append(`schedule[${index}][fullDay]`, String(day.fullDay));
      formData.append(`schedule[${index}][amOpen]`, day.amOpen || "");
      formData.append(`schedule[${index}][amClose]`, day.amClose || "");
      formData.append(`schedule[${index}][pmOpen]`, day.pmOpen || "");
      formData.append(`schedule[${index}][pmClose]`, day.pmClose || "");
    });

    const result = await saveDaySchedule(formData);

    if (!result?.success) {
      console.error("❌ Error:", result?.errors);
      alert("Failed to save schedule");
    } else {
      alert("✅ Schedule saved successfully");
    }


  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-4xl mx-auto p-5"
    >
      <h1 className="text-2xl font-semibold mb-4">Store Working Hours</h1>

      <div className="space-y-4">
        {schedule.map((day, index) => (
          <div
            key={day.day}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="capitalize font-semibold text-lg">{day.day}</h3>

              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" {...register(`schedule.${index}.isOpen`)} />
                  Open
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" {...register(`schedule.${index}.fullDay`)} />
                  Full Day
                </label>
              </div>
            </div>

            {day.isOpen && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {day.fullDay ? (
                  <>
                    <div>
                      <label className="label-style">Open</label>
                      <input
                        type="time"
                        {...register(`schedule.${index}.amOpen`)}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label className="label-style">Close</label>
                      <input
                        type="time"
                        {...register(`schedule.${index}.amClose`)}
                        className="input-style"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label-style">AM Open</label>
                      <input
                        type="time"
                        {...register(`schedule.${index}.amOpen`)}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label className="label-style">AM Close</label>
                      <input
                        type="time"
                        {...register(`schedule.${index}.amClose`)}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label className="label-style">PM Open</label>
                      <input
                        type="time"
                        {...register(`schedule.${index}.pmOpen`)}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label className="label-style">PM Close</label>
                      <input
                        type="time"
                        {...register(`schedule.${index}.pmClose`)}
                        className="input-style"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button className="mt-6 w-full" type="submit">
        Save Schedule
      </Button>
    </form>
  );
}
