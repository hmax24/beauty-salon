import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { locales, type AppLocale } from "@/i18n/routing";
import { getDefaultStaffId } from "@/lib/db/schedule";
import {
  getServiceBySlug,
  getOfferBySlug,
  getServicesByIds,
  calcOfferDurationMinutes,
} from "@/lib/db/services";

function isValidDateISO(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidTimeHHMM(time: string) {
  return /^\d{2}:\d{2}$/.test(time);
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const SALON_TZ = "Europe/Amsterdam";

type Body = {
  locale: AppLocale;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  slug: string; // service or offer slug

  name: string;
  phone: string;
  comment?: string;
};

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { locale, date, start, slug, name, phone, comment } = body;

  if (!locales.includes(locale as any)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  if (!isValidDateISO(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (!isValidTimeHHMM(start)) {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Name is too short" }, { status: 400 });
  }
  if (!phone || phone.trim().length < 6) {
    return NextResponse.json({ error: "Phone is too short" }, { status: 400 });
  }

  // 1) Определяем длительность по slug
  let durationMinutes: number | null = null;
  let serviceId: string | null = null;
  let offerId: string | null = null;

  const service = await getServiceBySlug(locale, slug);
  if (service) {
    durationMinutes = service.durationMinutes;

    serviceId = service.id;
  } else {
    const offer = await getOfferBySlug(locale, slug);
    if (!offer) {
      return NextResponse.json({ error: "Unknown slug" }, { status: 404 });
    }

    offerId = offer.id;

    const included = await getServicesByIds(locale, offer.serviceIds);
    durationMinutes = calcOfferDurationMinutes(offer, included);
  }

  if (!durationMinutes || durationMinutes <= 0) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const startMin = toMinutes(start);
  const endMin = startMin + durationMinutes;
  const end = minutesToHHMM(endMin);

  const staffId = await getDefaultStaffId();

  const startLocal = `${date}T${start}:00`;
  const endLocal = `${date}T${end}:00`;

  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      staff_id: staffId,
      date,
      start_time: start,
      end_time: end,
      service_id: serviceId,
      offer_id: offerId,
      client_name: name.trim(),
      client_phone: phone.trim(),
      client_comment: comment?.trim() || null,
      status: "booked",
    })
    .select("id, date, start_time, end_time")
    .single();

  if (error) {
    const msg = error.message.toLowerCase();

    if (
      msg.includes("appointments_no_overlap_booked") ||
      msg.includes("conflict")
    ) {
      return NextResponse.json(
        { error: "Time is no longer available" },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    appointment: data,
  });
}
