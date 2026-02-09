"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/i18n/routing";
import { useLocale } from "@/i18n/use-locale";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();

  const pathWithoutLocale =
    pathname.replace(`/${currentLocale}`, "") || "/";

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        const href =
          pathWithoutLocale === "/"
            ? `/${locale}`
            : `/${locale}${pathWithoutLocale}`;

        return (
          <Link
            key={locale}
            href={href}
            className={
              isActive
                ? "font-semibold text-black"
                : "hover:text-black transition-colors"
            }
            aria-current={isActive ? "page" : undefined}
            title={`Switch to ${locale.toUpperCase()}`}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
