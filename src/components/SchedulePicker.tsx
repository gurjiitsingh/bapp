"use client";

import { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import { DaySchedule, TimeSlot } from "@/lib/types/daySchedule";
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

  // Get current date and time in restaurant timezone.
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

  const isValidTime = (time: string) =>
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

  const isValidSlot = (slot: TimeSlot) =>
    isValidTime(slot.open) &&
    isValidTime(slot.close) &&
    slot.open !== slot.close;

  // Generate the next 7 calendar dates in restaurant-local time.
  const getNext7Days = () => {
    const today = getRestaurantToday();

    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.UTC(year, month, day + i, 12));

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

  // Find all opening periods for the selected day.
  const getOpenSlots = (): TimeSlot[] => {
    if (!selectedDate) return [];

    const [year, month, day] = selectedDate.split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day, 12));

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
      return [];
    }

    if (!Array.isArray(daySchedule.slots)) {
      return [];
    }

    return daySchedule.slots
      .filter(isValidSlot)
      .sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
  };

  // Generate selectable times across all opening periods.
  const getAvailableTimes = (): string[] => {
    const openSlots = getOpenSlots();

    if (openSlots.length === 0) return [];

    const now = getRestaurantToday();
    const restaurantToday = formatISO(now);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const earliestAllowed =
      selectedDate === restaurantToday
        ? Math.ceil(
            (nowMinutes + MIN_BUFFER_MINUTES) / SLOT_INTERVAL
          ) * SLOT_INTERVAL
        : 0;

    const availableTimes = new Set<string>();

    for (const slot of openSlots) {
      const openMinutes = toMinutes(slot.open);
      const closeMinutes = toMinutes(slot.close);

      // Preserve the current same-day interval behavior.
      // Overnight periods are handled separately below.
      if (closeMinutes < openMinutes) {
        for (
          let minutes = Math.max(openMinutes, earliestAllowed);
          minutes < 24 * 60;
          minutes += SLOT_INTERVAL
        ) {
          availableTimes.add(toTime(minutes));
        }

        // After midnight belongs to the following calendar day.
        // Do not incorrectly offer those times on the selected day.
        continue;
      }

      const startMinutes = Math.max(openMinutes, earliestAllowed);

      for (
        let minutes = startMinutes;
        minutes < closeMinutes;
        minutes += SLOT_INTERVAL
      ) {
        availableTimes.add(toTime(minutes));
      }
    }

    return Array.from(availableTimes).sort(
      (a, b) => toMinutes(a) - toMinutes(b)
    );
  };

  // Save selected restaurant-local wall-clock time.
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      onChange("");
      setScheduledAt("");
      return;
    }

    const value = `${selectedDate}T${selectedTime}:00`;

    onChange(value);
    setScheduledAt(value);
  }, [selectedDate, selectedTime, onChange, setScheduledAt]);

  const days = getNext7Days();
  const slots = selectedDate ? getAvailableTimes() : [];

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