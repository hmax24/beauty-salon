import { NextResponse } from "next/server";
import { locales, type AppLocale } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get("locale") ?? "en") as AppLocale;

  if (!locales.includes(locale as any)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  // services
  const { data: services, error: sErr } = await supabase
    .from("services")
    .select("id, slug, title")
    .eq("is_active", true)
    .order("slug", { ascending: true });

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // offers
  const { data: offers, error: oErr } = await supabase
    .from("offers")
    .select("id, slug, title")
    .eq("is_active", true)
    .order("slug", { ascending: true });

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  // title: jsonb {ru:"",en:""...} → выбираем нужный язык
  const mapTitle = (t: any) => {
    if (!t) return "";
    if (typeof t === "string") return t;
    return t[locale] ?? t["en"] ?? t["ru"] ?? Object.values(t)[0] ?? "";
  };

  return NextResponse.json({
    services: (services ?? []).map((x: any) => ({
      kind: "service" as const,
      slug: x.slug,
      title: mapTitle(x.title),
    })),
    offers: (offers ?? []).map((x: any) => ({
      kind: "offer" as const,
      slug: x.slug,
      title: mapTitle(x.title),
    })),
  });
}
