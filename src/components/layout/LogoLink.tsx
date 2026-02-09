"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/use-locale";
import { withLocale } from "@/i18n/links";

export function LogoLink() {
  const locale = useLocale();

  return (
    <Link href={withLocale(locale, "/")} className="font-semibold">
      Selena
    </Link>
  );
}
