import { z } from "zod";

export const timeSlotSchema = z.object({
  open: z.string(),
  close: z.string(),
});

export const dayScheduleSchema = z
  .object({
    day: z.string(),
    isOpen: z.boolean(),
    slots: z.array(timeSlotSchema),
    updatedAt: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Closed days do not require opening hours.
    if (!data.isOpen) return;

    // Every configured slot must have valid times.
    data.slots.forEach((slot, index) => {
      const validTime = (value: string) =>
        /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

      if (!validTime(slot.open)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slots", index, "open"],
          message: "Invalid opening time",
        });
      }

      if (!validTime(slot.close)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slots", index, "close"],
          message: "Invalid closing time",
        });
      }

      if (slot.open === slot.close) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slots", index, "close"],
          message: "Opening and closing times cannot be identical",
        });
      }
    });
  });

export type TimeSlot = z.infer<typeof timeSlotSchema>;

export type DayScheduleType = z.infer<typeof dayScheduleSchema>;

export type DaySchedule = {
  day: string;
  isOpen: boolean;
  slots: TimeSlot[];
  updatedAt: string | null;
};