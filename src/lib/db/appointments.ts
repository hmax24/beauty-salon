import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppointmentBlock = {
  start: string; // "09:30:00"
  end: string;   // "11:15:00"
};

export async function getBookedBlocksForDate(params: {
  staffId: string;
  dateISO: string; // YYYY-MM-DD
}): Promise<AppointmentBlock[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("start_time, end_time")
    .eq("staff_id", params.staffId)
    .eq("date", params.dateISO)
    .eq("status", "booked");

  if (error) throw new Error(error.message);

  return ((data ?? []) as any[]).map((row) => ({
    start: row.start_time as string,
    end: row.end_time as string,
  }));
}
