export const locales = ["ua", "ru", "en", "nl", "de"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";