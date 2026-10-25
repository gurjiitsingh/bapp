
import admin from "firebase-admin";
import { fromZonedTime } from "date-fns-tz";

const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "EUR";

const DEFAULT_LOCALE =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "es-ES";

const DEFAULT_TIMEZONE =
  process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Europe/Madrid";

export {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
};

export function toAdminTimestamp(
  value?: string | null
): admin.firestore.Timestamp | null {
  if (!value) return null;

  const date = fromZonedTime(value, DEFAULT_TIMEZONE);

  if (isNaN(date.getTime())) return null;

  return admin.firestore.Timestamp.fromDate(date);
}
