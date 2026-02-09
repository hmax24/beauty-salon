"use client";

import { useParams } from "next/navigation";
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";

export function useLocale(): AppLocale {
  const params = useParams();
  const raw = params?.locale;

  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value && (locales as readonly string[]).includes(value)) {
    return value as AppLocale;
  }

  return defaultLocale;
}
