
"use client";

import { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import { DaySchedule } from "@/lib/types/daySchedule";
import { toZonedTime } from "date-fns-tz";

const RESTAURANT_TIME_ZONE =
  process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Europe/Madrid";

const MIN_BUFFER_MINUTES = 30;
const SLOT_INTERVAL = 15;

type Props = {
  onChange: (dateTime: string) => void;
  schedule: DaySchedule[];
};

export default function SchedulePicker({
  onChange,
  schedule,
}: Props) {
  const { setScheduledAt } = useCartContext();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Get date parts in the restaurant's timezone.
  const getRestaurantToday = () =>
    toZonedTime(new Date(), RESTAURANT_TIME_ZONE);

  const formatISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const toTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60
    ).padStart(2, "0")}`;

  // Generate the next 7 calendar dates in restaurant-local time.
  const getNext7Days = () => {
    const today = getRestaurantToday();

    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(
        Date.UTC(year, month, day + i, 12)
      );

      const value = [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0"),
      ].join("-");

      const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }).format(date);

      return {
        label:
          i === 0
            ? "Today"
            : i === 1
              ? "Tomorrow"
              : weekday,
        value,
      };
    });
  };

  // Match the selected calendar date to the restaurant's weekly schedule.
  const getOpenClose = () => {
    if (!selectedDate) {
      return { open: "", close: "" };
    }

    const [year, month, day] = selectedDate
      .split("-")
      .map(Number);

    const date = new Date(
      Date.UTC(year, month - 1, day, 12)
    );

    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "UTC",
    })
      .format(date)
      .toLowerCase();

    const daySchedule = schedule.find(
      (item) => item.day.trim().toLowerCase() === dayName
    );

    if (!daySchedule || !daySchedule.isOpen) {
      return { open: "", close: "" };
    }

    return {
      open: daySchedule.amOpen,
      close: daySchedule.amClose,
    };
  };

  // Generate slots using restaurant-local current time.
  const getSlots = () => {
    const { open, close } = getOpenClose();

    if (!open || !close) return [];

    const openMinutes = toMinutes(open);
    const closeMinutes = toMinutes(close);

    if (
      !Number.isFinite(openMinutes) ||
      !Number.isFinite(closeMinutes) ||
      closeMinutes <= openMinutes
    ) {
      return [];
    }

    let startMinutes = openMinutes;

    const now = getRestaurantToday();
    const restaurantToday = formatISO(now);

    if (selectedDate === restaurantToday) {
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
      let minutes = startMinutes;
      minutes < closeMinutes;
      minutes += SLOT_INTERVAL
    ) {
      slots.push(toTime(minutes));
    }

    return slots;
  };

  // Save the selected restaurant-local wall-clock time.
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      onChange("");
      setScheduledAt("");
      return;
    }

    const scheduledAt = `${selectedDate}T${selectedTime}:00`;

    onChange(scheduledAt);
    setScheduledAt(scheduledAt);
  }, [
    selectedDate,
    selectedTime,
    onChange,
    setScheduledAt,
  ]);

  const days = getNext7Days();
  const slots = selectedDate ? getSlots() : [];

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Select day &amp; time
      </h3>

      {/* DAY SELECTOR */}
      <div className="flex gap-2 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => {
              setSelectedDate(day.value);
              setSelectedTime("");
            }}
            className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm ${
              selectedDate === day.value
                ? "border-green-400 bg-green-100 text-green-800"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* TIME SELECTOR */}
      <select
        className="w-full rounded-md border px-3 py-2 text-sm"
        value={selectedTime}
        disabled={!selectedDate || slots.length === 0}
        onChange={(event) => setSelectedTime(event.target.value)}
      >
        <option value="">
          {!selectedDate
            ? "Select day first"
            : slots.length === 0
              ? "No available slots"
              : "Select time"}
        </option>

        {slots.map((time) => (
          <option key={time} value={time}>
            {time}
        </option>
        ))}
      </select>

      <p className="text-xs text-gray-500">
        Times shown in restaurant local time.
      </p>
    </div>
  );
}
