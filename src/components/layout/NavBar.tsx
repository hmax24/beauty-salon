"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { NAV_LINKS } from "@/config/nav";
import { useLocale } from "@/i18n/use-locale";
import { withLocale } from "@/i18n/links";

export function NavBar() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <nav className="text-sm text-gray-600 flex gap-4 items-center">
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={withLocale(locale, item.href)}
          className="hover:text-black transition-colors"
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
