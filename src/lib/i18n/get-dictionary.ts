import type { Locale } from "@/lib/i18n/config";

import en from "@/locales/en/common.json";
import hy from "@/locales/hy/common.json";
import ru from "@/locales/ru/common.json";

const dictionaries = {
  hy,
  en,
  ru,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
