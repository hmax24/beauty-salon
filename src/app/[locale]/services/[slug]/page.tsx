import Link from "next/link";
import { notFound } from "next/navigation";

import {
  services,
  offers,
  getServicesBySlugs,
  calcOfferDurationMinutes,
  calcOfferBasePrice,
  calcOfferFinalPrice,
} from "@/content/services";
import { locales, type AppLocale } from "@/i18n/routing";
import { withLocale } from "@/i18n/links";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ServiceOrOfferPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!locales.includes(locale as AppLocale)) {
    notFound();
  }
  const l = locale as AppLocale;

  // 1) сначала ищем УСЛУГУ
  const service = services.find((s) => s.slug === slug);
  if (service) {
    return (
      <div className="max-w-3xl">
        <Link
          href={withLocale(l, "/services")}
          className="text-sm text-gray-600 hover:text-black transition-colors"
        >
          ← Back to services
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">{service.title[l]}</h1>
        <p className="mt-3 text-gray-700">{service.description[l]}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600">Duration</div>
            <div className="mt-1 text-lg font-medium">
              {service.durationMinutes} min
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600">Price</div>
            <div className="mt-1 text-lg font-medium">€{service.basePrice}</div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href={bookingHref(l, slug)}
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white text-sm hover:opacity-90 transition"
          >
            Book now
          </Link>

          <Link
            href={withLocale(l, "/services")}
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 transition"
          >
            See all services
          </Link>
        </div>
      </div>
    );
  }

  // 2) если услуги нет — ищем ОФФЕР
  const offer = offers.find((o) => o.slug === slug);
  if (!offer) {
    notFound();
  }

  const includedServices = getServicesBySlugs(offer.serviceSlugs).filter(
    Boolean,
  );
  const duration = calcOfferDurationMinutes(offer);
  const base = calcOfferBasePrice(offer);
  const final = calcOfferFinalPrice(offer);

  function bookingHref(locale: AppLocale, slug: string) {
    return withLocale(locale, `/booking?slug=${encodeURIComponent(slug)}`);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={withLocale(l, "/services")}
        className="text-sm text-gray-600 hover:text-black transition-colors"
      >
        ← Back to services
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">{offer.title[l]}</h1>
      <p className="mt-3 text-gray-700">{offer.description[l]}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Duration</div>
          <div className="mt-1 text-lg font-medium">{duration} min</div>

          {offer.timeDiscountMinutes ? (
            <div className="mt-1 text-xs text-gray-500">
              Includes time saving: -{offer.timeDiscountMinutes} min
            </div>
          ) : null}
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Price</div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm text-gray-500 line-through">€{base}</span>
            <span className="text-lg font-semibold">€{final}</span>
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Discount: -{offer.discountPercent}%
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">What’s included</h2>

        <div className="mt-3 grid gap-3">
          {includedServices.map((s) => (
            <Link
              key={s!.slug}
              href={withLocale(l, `/services/${s!.slug}`)}
              className="border rounded-lg p-4 hover:shadow transition block"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{s!.title[l]}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {s!.description[l]}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-700 whitespace-nowrap">
                  <div>{s!.durationMinutes} min</div>
                  <div className="font-medium">€{s!.basePrice}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href={bookingHref(l, slug)}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white text-sm hover:opacity-90 transition"
        >
          Book now
        </Link>

        <Link
          href={withLocale(l, "/services")}
          className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 transition"
        >
          See all services
        </Link>
      </div>
    </div>
  );
}
