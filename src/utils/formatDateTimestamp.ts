import { Timestamp } from "firebase/firestore";

export function formatDateTimeStamp(
  date: string | number | Timestamp | undefined,
  locale?: string
): string {
  if (!date) return "";

  // Always force a valid locale
  let safeLocale = "en-GB";

  if (typeof locale === "string" && locale.trim() !== "") {
    try {
      // Validate locale
      new Intl.DateTimeFormat(locale);
      safeLocale = locale;
    } catch {
      safeLocale = "en-GB";
    }
  }

  const timeZoneMap: Record<string, string> = {
    "de-DE": "Europe/Berlin",
    "en-IN": "Asia/Kolkata",
    "en-US": "America/New_York",
    "en-GB": "Europe/London",
    "en-CA": "America/Toronto",
    "en-AU": "Australia/Sydney",
    "ja-JP": "Asia/Tokyo",
  };

  const timeZone =
    timeZoneMap[safeLocale] ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString(safeLocale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
}