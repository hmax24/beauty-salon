import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function СontactsPage({ params }: Props) {

  const { locale } = await params;

  if (!locales.includes(locale as AppLocale)) notFound();

  const t = await getTranslations({ locale, namespace: "contacts" });

  return (
    <h1 className="text-2xl font-semibold">
      {t("title")}
    </h1>
  );
}
