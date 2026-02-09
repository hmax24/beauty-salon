import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";

export default getRequestConfig(async ({ locale }) => {
  const normalized = (locale ?? defaultLocale) as AppLocale;

  if (!locales.includes(normalized)) {
    return {
      locale: defaultLocale,
      messages: (await import(`@/messages/${defaultLocale}.json`)).default,
    };
  }

  return {
    locale: normalized,
    messages: (await import(`@/messages/${normalized}.json`)).default,
  };
});