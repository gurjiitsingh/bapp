"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

export type TimeSlot = {
  open: string;
  close: string;
};

export type DaySchedule = {
  day: string;
  isOpen: boolean;
  slots: TimeSlot[];
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

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function serializeUpdatedAt(value: any): string | null {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

/**
 * Save the weekly restaurant timetable.
 *
 * FormData fields:
 * schedule[0][day]
 * schedule[0][isOpen]
 * schedule[0][slots]  // JSON array
 */
export async function saveDaySchedule(formData: FormData) {
  try {
    const schedule: Record<string, any>[] = [];

    // --------------------------------------------------
    // 1. Parse FormData
    // --------------------------------------------------

    for (const [key, value] of formData.entries()) {
      const match = key.match(
        /^schedule\[(\d+)\]\[(\w+)\]$/
      );

      if (!match) continue;

      const index = Number(match[1]);
      const field = match[2];

      if (!schedule[index]) {
        schedule[index] = {};
      }

      if (field === "isOpen") {
        if (value !== "true" && value !== "false") {
          throw new Error(`Invalid isOpen value at index ${index}`);
        }

        schedule[index].isOpen = value === "true";
      } else if (field === "slots") {
        if (typeof value !== "string") {
          throw new Error(`Invalid slots value at index ${index}`);
        }

        let parsedSlots: unknown;

        try {
          parsedSlots = JSON.parse(value);
        } catch {
          throw new Error(`Invalid slots JSON at index ${index}`);
        }

        if (!Array.isArray(parsedSlots)) {
          throw new Error(`Slots must be an array at index ${index}`);
        }

        schedule[index].slots = parsedSlots;
      } else {
        schedule[index][field] = value;
      }
    }

    // --------------------------------------------------
    // 2. Validate and normalize each day
    // --------------------------------------------------

    const normalizedSchedule: DaySchedule[] = [];

    for (const day of schedule) {
      if (!day) continue;

      if (!DAY_ORDER.includes(day.day)) {
        throw new Error(`Invalid schedule day: ${day.day}`);
      }

      if (typeof day.isOpen !== "boolean") {
        throw new Error(`Invalid isOpen value for ${day.day}`);
      }

      if (!Array.isArray(day.slots)) {
        throw new Error(`Missing slots array for ${day.day}`);
      }

      const slots: TimeSlot[] = day.isOpen
        ? day.slots.map((slot: any) => {
            if (
              !slot ||
              typeof slot.open !== "string" ||
              typeof slot.close !== "string" ||
              !isValidTime(slot.open) ||
              !isValidTime(slot.close)
            ) {
              throw new Error(
                `Invalid opening or closing time for ${day.day}`
              );
            }

            return {
              open: slot.open,
              close: slot.close,
            };
          })
        : [];

      // Reject duplicate days in the submitted schedule.
      if (
        normalizedSchedule.some(
          (existing) => existing.day === day.day
        )
      ) {
        throw new Error(`Duplicate schedule day: ${day.day}`);
      }

      normalizedSchedule.push({
        day: day.day,
        isOpen: day.isOpen,
        slots,
        updatedAt: null,
      });
    }

    // --------------------------------------------------
    // 3. Save each weekday document to Firestore
    // --------------------------------------------------

    for (const day of normalizedSchedule) {
      await adminDb
        .collection("day_schedule")
        .doc(day.day)
        .set(
          {
            day: day.day,
            isOpen: day.isOpen,
            slots: day.slots,
            updatedAt: new Date(),
          },
          { merge: true }
        );
    }

    revalidatePath("/admin/settings/schedule");

    return { success: true };
  } catch (error) {
    console.error("Failed to save schedule:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save schedule",
    };
  }
}

/**
 * Load the weekly timetable.
 *
 * Supports both:
 * - New documents containing slots[]
 * - Old documents containing amOpen/amClose and pmOpen/pmClose
 */
export async function getSchedule(): Promise<DaySchedule[]> {
  const snapshot = await adminDb
    .collection("day_schedule")
    .get();

  const savedDays = new Map<string, DaySchedule>();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const day = doc.id;

    if (!DAY_ORDER.includes(day)) continue;

    let slots: TimeSlot[] = [];

    if (Array.isArray(data.slots)) {
      // New format: use the array.
      slots = data.slots.map((slot: any) => ({
        open: typeof slot?.open === "string" ? slot.open : "",
        close: typeof slot?.close === "string" ? slot.close : "",
      }));
    } else {
      // Legacy format: migrate old fields in memory.
      const legacySlots = [
        {
          open: data.amOpen,
          close: data.amClose,
        },
        {
          open: data.pmOpen,
          close: data.pmClose,
        },
      ];

      slots = legacySlots.filter(
        (slot) =>
          typeof slot.open === "string" &&
          typeof slot.close === "string" &&
          slot.open !== "" &&
          slot.close !== ""
      );
    }

    savedDays.set(day, {
      day,
      isOpen: data.isOpen ?? false,
      slots,
      updatedAt: serializeUpdatedAt(data.updatedAt),
    });
  }

  // Return Monday to Sunday, including days without saved documents.
  return DAY_ORDER.map(
    (day) =>
      savedDays.get(day) ?? {
        day,
        isOpen: day !== "sunday",
        slots:
          day === "sunday"
            ? []
            : [{ open: "09:00", close: "20:00" }],
        updatedAt: null,
      }
  );
}