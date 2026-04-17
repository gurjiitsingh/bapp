import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";
import CheckoutClient from "./CheckoutClient";
import { DaySchedule } from "@/lib/types/daySchedule";

export default async function Page() {
  let weeklySchedule: DaySchedule[] = [];

  try {
    const data = await getSchedule();
    weeklySchedule = data ?? []; // ✅ safe fallback
  } catch (e) {
    console.error("Failed to fetch schedule", e);
  }

  return <CheckoutClient weeklySchedule={weeklySchedule} />;
}