import type { AppLocale } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getServiceBySlug,
  getOfferBySlug,
  getServicesByIds,
  calcOfferDurationMinutes,
} from "@/lib/db/services";

/**
 * Возвращает 1..7 (Mon..Sun)
 */
function getIsoDayOfWeek(date: Date) {
  // JS: 0=Sun..6=Sat → ISO: 1=Mon..7=Sun
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

export type WorkingHours = {
  staffId: string;
  dayOfWeek: number; // 1..7
  startTime: string; // "09:00:00"
  endTime: string; // "18:00:00"
  slotMinutes: number; // 30
};

export async function getDefaultStaffId(): Promise<string> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("staff")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function getWorkingHoursForDate(dateISO: string, staffId: string) {
  const date = new Date(dateISO + "T00:00:00");
  const dayOfWeek = getIsoDayOfWeek(date);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("working_hours")
    .select("staff_id, day_of_week, start_time, end_time, slot_minutes")
    .eq("staff_id", staffId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (error) return null;

  return {
    staffId: data.staff_id as string,
    dayOfWeek: data.day_of_week as number,
    startTime: data.start_time as string,
    endTime: data.end_time as string,
    slotMinutes: data.slot_minutes as number,
  } satisfies WorkingHours;
}

/**
 * Длительность по slug:
 * - если slug — услуга → durationMinutes
 * - если slug — оффер → рассчитываем по услугам оффера (с timeDiscountMinutes)
 */
export async function getDurationMinutesBySlug(
  locale: AppLocale,
  slug: string
): Promise<number | null> {
  const service = await getServiceBySlug(locale, slug);
  if (service) return service.durationMinutes;

  const offer = await getOfferBySlug(locale, slug);
  if (!offer) return null;

  const included = await getServicesByIds(locale, offer.serviceIds);
  return calcOfferDurationMinutes(offer, included);
}
