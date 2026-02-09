import type { AppLocale } from "@/i18n/routing";

export type Service = {
  slug: string;

  durationMinutes: number;
  basePrice: number;

  title: Record<AppLocale, string>;
  description: Record<AppLocale, string>;

  category: "nails" | "body";
  isPopular?: boolean;
};

export const services: Service[] = [
  {
    slug: "manicure",
    durationMinutes: 60,
    basePrice: 35,
    category: "nails",
    isPopular: true,
    title: {
      ua: "Манікюр",
      ru: "Маникюр",
      en: "Manicure",
      de: "Maniküre",
      nl: "Manicure",
    },
    description: {
      ua: "Акуратний манікюр з індивідуальним підбором форми та покриття.",
      ru: "Аккуратный маникюр с индивидуальным подбором формы и покрытия.",
      en: "Professional manicure with personalized shape and finish.",
      de: "Professionelle Maniküre mit individueller Form und Beschichtung.",
      nl: "Professionele manicure met een persoonlijke vorm en afwerking.",
    },
  },
  {
    slug: "pedicure",
    durationMinutes: 60,
    basePrice: 40,
    category: "nails",
    title: {
      ua: "Педикюр",
      ru: "Педикюр",
      en: "Pedicure",
      de: "Pediküre",
      nl: "Pedicure",
    },
    description: {
      ua: "Догляд за стопами та нігтями для комфорту і здоровʼя.",
      ru: "Уход за стопами и ногтями для комфорта и здоровья.",
      en: "Foot and nail care for comfort and health.",
      de: "Pflege für Füße und Nägel für Komfort und Gesundheit.",
      nl: "Verzorging van voeten en nagels voor comfort en gezondheid.",
    },
  },
  {
    slug: "sugaring",
    durationMinutes: 45,
    basePrice: 30,
    category: "body",
    title: {
      ua: "Шугаринг",
      ru: "Шугаринг",
      en: "Sugaring",
      de: "Sugaring",
      nl: "Sugaring",
    },
    description: {
      ua: "Делікатне видалення волосся цукровою пастою.",
      ru: "Деликатное удаление волос сахарной пастой.",
      en: "Gentle hair removal using sugar paste.",
      de: "Sanfte Haarentfernung mit Zuckerpaste.",
      nl: "Zachte ontharing met suikerpasta.",
    },
  },
];

export type Offer = {
  slug: string;

  serviceSlugs: string[];
  discountPercent: number;

  timeDiscountMinutes?: number;

  title: Record<AppLocale, string>;
  description: Record<AppLocale, string>;
};

export const offers: Offer[] = [
  {
    slug: "manicure-pedicure",
    serviceSlugs: ["manicure", "pedicure"],
    discountPercent: 10,
    timeDiscountMinutes: 15, // ⬅️ ВАЖНО

    title: {
      ua: "Манікюр + Педикюр",
      ru: "Маникюр + Педикюр",
      en: "Manicure + Pedicure",
      de: "Maniküre + Pediküre",
      nl: "Manicure + Pedicure",
    },
    description: {
      ua: "Комплекс зі знижкою -10% та швидшим виконанням",
      ru: "Комплекс со скидкой -10% и более быстрым выполнением",
      en: "Bundle with -10% discount and faster execution",
      de: "Bundle mit -10% Rabatt und kürzerer Dauer",
      nl: "Bundel met -10% korting en kortere duur",
    },
  },
];



export function getServicesBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter(Boolean);
}

export function calcOfferDurationMinutes(offer: Offer) {
  const items = getServicesBySlugs(offer.serviceSlugs);

  const total = items.reduce(
    (sum, s) => sum + s!.durationMinutes,
    0
  );

  // если есть скидка по времени — применяем
  if (offer.timeDiscountMinutes) {
    return Math.max(total - offer.timeDiscountMinutes, 0);
  }

  return total;
}

export function calcOfferBasePrice(offer: Offer) {
  const items = getServicesBySlugs(offer.serviceSlugs);
  return items.reduce((sum, s) => sum + s!.basePrice, 0);
}

export function calcOfferFinalPrice(offer: Offer) {
  const base = calcOfferBasePrice(offer);
  const discount = (base * offer.discountPercent) / 100;
  // округлим до 2 знаков (евро)
  return Math.round((base - discount) * 100) / 100;
}