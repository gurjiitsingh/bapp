import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";
import CheckoutClient from "./CheckoutClient";
import { DaySchedule } from "@/lib/types/daySchedule";
import AddressWrapper from "@/custom/address/AddressWrapper";
import Scheduler from "./StoreTiming";

export default async function Page() {
  let weeklySchedule: DaySchedule[] = [];

  try {
    const data = await getSchedule();
    weeklySchedule = data ?? []; // ✅ safe fallback
  } catch (e) {
    console.error("Failed to fetch schedule", e);
  }

  return (
<div className="max-w-7xl m-auto grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Left column */}
  <div className="flex flex-col gap-3 min-w-0">
    <Scheduler weeklySchedule={weeklySchedule} />
    <AddressWrapper />
  </div>

  {/* Right column */}
  <div className="min-w-0">
    <CheckoutClient weeklySchedule={weeklySchedule} />
  </div>
</div>
  );
}