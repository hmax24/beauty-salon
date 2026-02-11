import { NextResponse } from "next/server";

import { locales, type AppLocale } from "@/i18n/routing";
import {
  getDefaultStaffId,
  getWorkingHoursForDate,
  getDurationMinutesBySlug,
} from "@/lib/db/schedule";
import { generateSlots } from "@/lib/slots/generate";
import { getBookedBlocksForDate } from "@/lib/db/appointments";
import { overlaps } from "@/lib/slots/overlap";

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMMSS(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const locale = (searchParams.get("locale") ?? "en") as AppLocale;
  const date = searchParams.get("date"); // YYYY-MM-DD
  const slug = searchParams.get("slug");

  if (!date || !slug) {
    return NextResponse.json({ error: "Missing date or slug" }, { status: 400 });
  }

  if (!locales.includes(locale as any)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  // 1) Берём мастера (пока один)
  const staffId = await getDefaultStaffId();

  // 2) Берём рабочие часы для выбранной даты
  const wh = await getWorkingHoursForDate(date, staffId);
  if (!wh) {
    return NextResponse.json({
      date,
      slug,
      slots: [],
      durationMinutes: null,
      slotMinutes: null,
      workingHours: null,
    });
  }

  // 3) Считаем длительность (услуга или оффер)
  const duration = await getDurationMinutesBySlug(locale, slug);
  if (!duration) {
    return NextResponse.json({ error: "Unknown slug" }, { status: 404 });
  }

  // 4) Генерим все возможные старты по расписанию и длительности
  const slots = generateSlots({
    startTime: wh.startTime,
    endTime: wh.endTime,
    slotMinutes: wh.slotMinutes,
    durationMinutes: duration,
  });

  // 5) Берём занятые блоки на дату
  const blocks = await getBookedBlocksForDate({ staffId, dateISO: date });

  // 6) Для каждого слота ставим available true/false
  const slotsWithAvailability = slots.map((slot) => {
    const startHHMM = slot.start; // "09:00"
    const start = startHHMM + ":00"; // "09:00:00"

    const startMin = toMinutes(startHHMM);
    const endMin = startMin + duration;
    const end = minutesToHHMMSS(endMin);

    const busy = blocks.some((b) => overlaps(start, end, b.start, b.end));

    return {
      ...slot,
      available: !busy,
    };
  });

  return NextResponse.json({
    date,
    slug,
    durationMinutes: duration,
    slotMinutes: wh.slotMinutes,
    workingHours: {
      start: wh.startTime.slice(0, 5),
      end: wh.endTime.slice(0, 5),
    },
    // blocks можно оставить для дебага. Когда всё будет ок — уберём.
    blocks,
    slots: slotsWithAvailability,
  });
}
