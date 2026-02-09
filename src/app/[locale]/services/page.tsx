import { services } from "@/content/services";
import { locales, type AppLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Link from "next/link";
import { withLocale } from "@/i18n/links";
import {
  offers,
  calcOfferDurationMinutes,
  calcOfferBasePrice,
  calcOfferFinalPrice,
} from "@/content/services";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as AppLocale)) notFound();
  const l = locale as AppLocale;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{services[0].title[l]}</h1>

      {offers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold">Special offers</h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {offers.map((offer) => {
              const base = calcOfferBasePrice(offer);
              const final = calcOfferFinalPrice(offer);
              const duration = calcOfferDurationMinutes(offer);

              return (
                <Link
                  key={offer.slug}
                  href={withLocale(l, `/services/${offer.slug}`)}
                  className="border rounded-lg p-4 hover:shadow transition block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">{offer.title[l]}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {offer.description[l]}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        €{base}
                      </div>
                      <div className="text-lg font-semibold">€{final}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-sm text-gray-700">
                    <span>{duration} min</span>
                    <span>-{offer.discountPercent}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={withLocale(l, `/services/${service.slug}`)}
            className="block border rounded-lg p-4 hover:shadow transition"
          >
            <h2 className="text-lg font-medium">{service.title[l]}</h2>

            <p className="text-sm text-gray-600 mt-1">
              {service.description[l]}
            </p>

            <div className="mt-3 flex justify-between text-sm">
              <span>{service.durationMinutes} min</span>
              <span className="font-medium">€{service.basePrice}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
