import type { Locale } from "@/lib/i18n/config";

/** Short date for profile order cards (e.g. 17 Aug 2026). */
export function formatShortDate(
  value: string | Date,
  locale: Locale | string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
