import type { AppLocale } from "@/i18n/routing";

export function withLocale(locale: AppLocale, href: string) {
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}
