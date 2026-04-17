import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

import ContactInfo from "@/custom/cus-components/ContactInfo";

export default async function ContactInfoWrapper() {
  // ✅ use cached outlet (IMPORTANT)
  const outlet = await getCachedOutlet();

  const schedule = await getSchedule();

  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const formattedSchedule =
    !schedule || schedule.length === 0
      ? ["No schedule available"]
      : schedule
          .sort(
            (a, b) =>
              dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
          )
          .map((day) => {
  const formattedDay =
    day.day.charAt(0).toUpperCase() + day.day.slice(1);

  if (!day.isOpen) return `${formattedDay}: Closed`;

  const isFullDay =
    day.fullDay &&
    day.amOpen === "00:00" &&
    day.pmOpen === "00:00";

  if (isFullDay) return `${formattedDay}: Open 24h`;

  const am =
    day.amOpen !== "00:00" && day.amClose !== "00:00"
      ? `${day.amOpen} - ${day.amClose}`
      : null;

  const pm =
    day.pmOpen !== "00:00" && day.pmClose !== "00:00"
      ? `${day.pmOpen} - ${day.pmClose}`
      : null;

  const time = [am, pm].filter(Boolean).join(", ");

  return `${formattedDay}: ${time || "Closed"}`;
});

  return (
    <ContactInfo outlet={outlet} schedule={formattedSchedule} />
  );
}