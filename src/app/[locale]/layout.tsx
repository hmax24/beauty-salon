import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { locales, type AppLocale } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as AppLocale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-6xl w-full p-4">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
