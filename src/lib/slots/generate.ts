function toMinutes(time: string) {
  // "09:00:00" или "09:00"
  const [h, m] = time.split(":").map((x) => Number(x));
  return h * 60 + m;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function minutesToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export type Slot = {
  start: string; // "09:00"
  end: string;   // "09:30"
};

export function generateSlots(params: {
  startTime: string;     // "09:00:00"
  endTime: string;       // "18:00:00"
  slotMinutes: number;   // 30
  durationMinutes: number; // например 105
}) {
  const startMin = toMinutes(params.startTime);
  const endMin = toMinutes(params.endTime);

  const step = params.slotMinutes;
  const dur = params.durationMinutes;

  // последний старт: чтобы end не выходил за рабочее время
  const lastStart = endMin - dur;

  const slots: Slot[] = [];

  for (let t = startMin; t <= lastStart; t += step) {
    slots.push({
      start: minutesToTime(t),
      end: minutesToTime(t + step),
    });
  }

  return slots;
}
