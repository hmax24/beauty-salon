import type { AppLocale } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ServiceRow = {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  duration_minutes: number;
  base_price: number;
};

export type OfferRow = {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  discount_percent: number;
  time_discount_minutes: number | null;
};

export type OfferServiceRow = {
  offer_id: string;
  service_id: string;
  sort_order: number | null;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  basePrice: number;
};

export type Offer = {
  id: string;
  slug: string;
  title: string;
  description: string;
  discountPercent: number;
  timeDiscountMinutes?: number;
  serviceIds: string[];
};

function pickLocale(
  map: Record<string, string> | null | undefined,
  locale: AppLocale
) {
  if (!map) return "";
  return map[locale] ?? map.en ?? map.ru ?? Object.values(map)[0] ?? "";
}

/**
 * Получить список услуг (локализованный)
 */
export async function getServices(locale: AppLocale): Promise<Service[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, description, duration_minutes, base_price")
    .eq("is_active", true)
    .order("slug", { ascending: true });

  if (error) throw new Error(error.message);

  return (data as ServiceRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: pickLocale(row.title, locale),
    description: pickLocale(row.description, locale),
    durationMinutes: row.duration_minutes,
    basePrice: Number(row.base_price),
  }));
}

/**
 * Получить одну услугу по slug (локализованный)
 */
export async function getServiceBySlug(
  locale: AppLocale,
  slug: string
): Promise<Service | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, description, duration_minutes, base_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
  
    return null;
  }

  const row = data as ServiceRow;

  return {
    id: row.id,
    slug: row.slug,
    title: pickLocale(row.title, locale),
    description: pickLocale(row.description, locale),
    durationMinutes: row.duration_minutes,
    basePrice: Number(row.base_price),
  };
}


export async function getOffers(locale: AppLocale): Promise<Offer[]> {
  const supabase = createSupabaseServerClient();

  const [{ data: offersData, error: offersError }, { data: linkData, error: linkError }] =
    await Promise.all([
      supabase
        .from("offers")
        .select("id, slug, title, description, discount_percent, time_discount_minutes")
        .eq("is_active", true)
        .order("slug", { ascending: true }),
      supabase
        .from("offer_services")
        .select("offer_id, service_id, sort_order"),
    ]);

  if (offersError) throw new Error(offersError.message);
  if (linkError) throw new Error(linkError.message);

  const links = (linkData as OfferServiceRow[]) ?? [];
  const byOfferId = new Map<string, string[]>();

  for (const link of links) {
    const arr = byOfferId.get(link.offer_id) ?? [];
    arr.push(link.service_id);
    byOfferId.set(link.offer_id, arr);
  }

  return ((offersData as OfferRow[]) ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: pickLocale(row.title, locale),
    description: pickLocale(row.description, locale),
    discountPercent: row.discount_percent,
    timeDiscountMinutes: row.time_discount_minutes ?? undefined,
    serviceIds: byOfferId.get(row.id) ?? [],
  }));
}

export function calcOfferBasePrice(offer: Offer, services: Service[]) {
  const idSet = new Set(offer.serviceIds);
  const items = services.filter((s) => idSet.has(s.id));
  return items.reduce((sum, s) => sum + s.basePrice, 0);
}

export function calcOfferFinalPrice(offer: Offer, services: Service[]) {
  const base = calcOfferBasePrice(offer, services);
  const discount = (base * offer.discountPercent) / 100;
  return Math.round((base - discount) * 100) / 100;
}

export function calcOfferDurationMinutes(offer: Offer, services: Service[]) {
  const idSet = new Set(offer.serviceIds);
  const items = services.filter((s) => idSet.has(s.id));

  const total = items.reduce((sum, s) => sum + s.durationMinutes, 0);
  if (offer.timeDiscountMinutes) return Math.max(total - offer.timeDiscountMinutes, 0);
  return total;
}

export async function getOfferBySlug(locale: AppLocale, slug: string): Promise<Offer | null> {
  const supabase = createSupabaseServerClient();

  const { data: offerRow, error: offerError } = await supabase
    .from("offers")
    .select("id, slug, title, description, discount_percent, time_discount_minutes")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (offerError) return null;

  const row = offerRow as OfferRow;

  const { data: links, error: linkError } = await supabase
    .from("offer_services")
    .select("offer_id, service_id, sort_order")
    .eq("offer_id", row.id);

  if (linkError) throw new Error(linkError.message);

  return {
    id: row.id,
    slug: row.slug,
    title: pickLocale(row.title, locale),
    description: pickLocale(row.description, locale),
    discountPercent: row.discount_percent,
    timeDiscountMinutes: row.time_discount_minutes ?? undefined,
    serviceIds: (links as OfferServiceRow[]).map((x) => x.service_id),
  };
}

export async function getServicesByIds(locale: AppLocale, ids: string[]): Promise<Service[]> {
  if (ids.length === 0) return [];

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, description, duration_minutes, base_price")
    .in("id", ids)
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  // Важно: сохраняем порядок ids (для “What’s included”)
  const mapped = (data as ServiceRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: pickLocale(row.title, locale),
    description: pickLocale(row.description, locale),
    durationMinutes: row.duration_minutes,
    basePrice: Number(row.base_price),
  }));

  const byId = new Map(mapped.map((s) => [s.id, s]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Service[];
}
