import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";
import { getSchedule } from "@/app/(universal)/action/schedule/saveDaySchedule";

import ContactInfo from "@/custom/cus-com/ContactInfo";

export default async function ContactInfoWrapper() {
  // Use cached outlet
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
      : [...schedule]
          .sort(
            (a, b) =>
              dayOrder.indexOf(a.day.toLowerCase()) -
              dayOrder.indexOf(b.day.toLowerCase())
          )
          .map((day) => {
            const formattedDay =
              day.day.charAt(0).toUpperCase() +
              day.day.slice(1).toLowerCase();

            if (!day.isOpen) {
              return `${formattedDay}: Closed`;
            }

            const slots = (day.slots || [])
              .filter(
                (slot) =>
                  slot.open &&
                  slot.close &&
                  slot.open !== slot.close
              )
              .sort((a, b) => a.open.localeCompare(b.open));

            if (slots.length === 0) {
              return `${formattedDay}: Closed`;
            }

            // Display all opening periods for the day.
            const times = slots
              .map((slot) => `${slot.open} - ${slot.close}`)
              .join(", ");

            return `${formattedDay}: ${times}`;
          });

  return (
    <ContactInfo outlet={outlet} schedule={formattedSchedule} />
  );
}
 