"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  getSchedule,
  saveDaySchedule,
} from "@/app/(universal)/action/schedule/saveDaySchedule";
import toast from "react-hot-toast";

type TimeSlot = {
  open: string;
  close: string;
};

type DaySchedule = {
  day: string;
  isOpen: boolean;
  slots: TimeSlot[];
};

type ScheduleFormType = {
  schedule: DaySchedule[];
};

const MAX_SLOTS = 3;

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const createDefaultSlots = (): TimeSlot[] => [
  { open: "09:00", close: "20:00" },
  { open: "", close: "" },
  { open: "", close: "" },
];

const defaultSchedule: DaySchedule[] = DAY_ORDER.map((day) => ({
  day,
  isOpen: day !== "sunday",
  slots:
    day === "sunday"
      ? [
          { open: "", close: "" },
          { open: "", close: "" },
          { open: "", close: "" },
        ]
      : createDefaultSlots(),
}));

// Convert existing Firestore records to the new array structure.
// This allows old records to continue loading.
function normalizeScheduleDay(day: any): DaySchedule {
  let slots: TimeSlot[];

  if (Array.isArray(day.slots)) {
    slots = day.slots.map((slot: any) => ({
      open: slot?.open || "",
      close: slot?.close || "",
    }));
  } else {
    slots = [
      {
        open: day.amOpen || "",
        close: day.amClose || "",
      },
      {
        open: day.pmOpen || "",
        close: day.pmClose || "",
      },
    ];
  }

  // Always keep three slots in the form.
  slots = slots.slice(0, MAX_SLOTS);

  while (slots.length < MAX_SLOTS) {
    slots.push({ open: "", close: "" });
  }

  return {
    day: day.day,
    isOpen: Boolean(day.isOpen),
    slots,
  };
}

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
  const [isSaving, setIsSaving] = useState(false);

  // Remember which tab is selected for each day.
  const [activeSlots, setActiveSlots] = useState<Record<string, number>>(
    {}
  );

  const schedule = watch("schedule");

  // Load saved timetable.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const data = await getSchedule();

        if (cancelled || !data?.length) return;

        const normalized = data.map(normalizeScheduleDay);

        // Include missing weekdays if any.
        const merged = DAY_ORDER.map((day) => {
          return (
            normalized.find((item) => item.day === day) ??
            defaultSchedule.find((item) => item.day === day)!
          );
        });

        reset({ schedule: merged });
      } catch (error) {
        console.error("Failed to load schedule:", error);
        toast.error("Failed to load restaurant timings.");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [reset]);

  // Sort Monday to Sunday.
  useEffect(() => {
    if (!schedule?.length) return;

    setSortedSchedule(
      [...schedule].sort(
        (a, b) =>
          DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      )
    );
  }, [schedule]);

  // Apply the first day's complete schedule to all other days.
  useEffect(() => {
    if (!sameForAll || !schedule?.length) return;

    const firstDay = schedule[0];
    if (!firstDay) return;

    schedule.forEach((day, index) => {
      if (index === 0) return;

      const current = JSON.stringify({
        isOpen: day.isOpen,
        slots: day.slots,
      });

      const source = JSON.stringify({
        isOpen: firstDay.isOpen,
        slots: firstDay.slots,
      });

      if (current !== source) {
        setValue(`schedule.${index}.isOpen`, firstDay.isOpen, {
          shouldDirty: true,
        });

        setValue(
          `schedule.${index}.slots`,
          firstDay.slots.map((slot) => ({ ...slot })),
          { shouldDirty: true }
        );
      }
    });
  }, [sameForAll, schedule, setValue]);

  async function onSubmit(data: ScheduleFormType) {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const formData = new FormData();

      data.schedule.forEach((day, dayIndex) => {
        formData.append(
          `schedule[${dayIndex}][day]`,
          day.day
        );

        formData.append(
          `schedule[${dayIndex}][isOpen]`,
          String(day.isOpen)
        );

        // Save only configured slots.
        const configuredSlots = day.isOpen
          ? day.slots.filter(
              (slot) => slot.open.trim() && slot.close.trim()
            )
          : [];

        formData.append(
          `schedule[${dayIndex}][slots]`,
          JSON.stringify(configuredSlots)
        );
      });

      const result = await saveDaySchedule(formData);

      if (!result?.success) {
        toast.error(result?.error || "Failed to save schedule.");
        return;
      }

      toast.success("Schedule saved successfully.");
    } catch (error) {
      console.error("Schedule save error:", error);
      toast.error("Something went wrong while saving the schedule.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-4xl p-5"
    >
      <h1 className="mb-4 text-2xl font-semibold">
        Restaurant Timetable
      </h1>

      <label className="mb-5 flex items-center gap-2">
        <input
          type="checkbox"
          checked={sameForAll}
          onChange={(event) => setSameForAll(event.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium">
          Apply same timing for all days
        </span>
      </label>

      {sortedSchedule.map((day) => {
        const realIndex = schedule.findIndex(
          (item) => item.day === day.day
        );

        if (realIndex < 0) return null;

        const activeSlot = activeSlots[day.day] ?? 0;

        return (
          <div
            key={day.day}
            className="mb-4 rounded-xl bg-gray-100 p-4"
          >
            <input
              type="hidden"
              {...register(`schedule.${realIndex}.day`)}
            />

            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold capitalize">
                {day.day}
              </h3>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register(`schedule.${realIndex}.isOpen`)}
                />
                Open
              </label>
            </div>

            {day.isOpen && (
              <>
                {/* Slot tabs */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {Array.from(
                    { length: MAX_SLOTS },
                    (_, slotIndex) => {
                      const slot = day.slots?.[slotIndex];
                      const configured = Boolean(
                        slot?.open && slot?.close
                      );

                      return (
                        <button
                          key={slotIndex}
                          type="button"
                          onClick={() =>
                            setActiveSlots((previous) => ({
                              ...previous,
                              [day.day]: slotIndex,
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                            activeSlot === slotIndex
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Slot {slotIndex + 1}
                          {configured ? " ✓" : ""}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Selected slot fields */}
                <div className="rounded-lg bg-white p-4">
                  <h4 className="mb-4 font-medium">
                    Slot {activeSlot + 1} timings
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Opening Time
                      </label>

                      <input
                        type="time"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        {...register(
                          `schedule.${realIndex}.slots.${activeSlot}.open`
                        )}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Closing Time
                      </label>

                      <input
                        type="time"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        {...register(
                          `schedule.${realIndex}.slots.${activeSlot}.close`
                        )}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Leave both times empty if this slot is not used.
                  </p>
                </div>
              </>
            )}

            {!day.isOpen && (
              <p className="text-sm text-gray-500">
                Restaurant closed on this day.
              </p>
            )}
          </div>
        );
      })}

      <Button
        className="mt-6 w-full bg-red-600 font-bold text-white"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Saving Schedule..." : "Save Schedule"}
      </Button>
    </form>
  );
}