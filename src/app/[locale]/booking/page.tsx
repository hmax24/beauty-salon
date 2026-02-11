"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useLocale } from "@/i18n/use-locale";
import { withLocale } from "@/i18n/links";

type SlotResponse = {
  date: string;
  slug: string;
  durationMinutes: number;
  slotMinutes: number;
  workingHours: { start: string; end: string };
  slots: { start: string; end: string; available: boolean }[];
};

type CatalogItem = { kind: "service" | "offer"; slug: string; title: string };

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function BookingPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const slugFromQuery = searchParams.get("slug");

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [slug, setSlug] = useState<string>("");

  const [date, setDate] = useState(todayISO());

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<
    { start: string; end: string; available: boolean }[]
  >([]);
  const [duration, setDuration] = useState<number | null>(null);

  const [selectedStart, setSelectedStart] = useState<string>("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  const [submitStatus, setSubmitStatus] = useState<
    | { state: "idle" }
    | { state: "loading" }
    | { state: "success"; message: string }
    | { state: "error"; message: string }
  >({ state: "idle" });

  // 1) Load catalog (services + offers) from API
  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setCatalogLoading(true);

      try {
        const res = await fetch(
          `/api/catalog?locale=${encodeURIComponent(locale)}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to load catalog");
        }

        const merged: CatalogItem[] = [
          ...(data.services ?? []),
          ...(data.offers ?? []),
        ];

        if (!cancelled) {
          setCatalog(merged);

          const initialSlug =
            (slugFromQuery &&
              merged.some((x) => x.slug === slugFromQuery) &&
              slugFromQuery) ||
            merged[0]?.slug ||
            "";

          setSlug(initialSlug);
        }
      } catch (e: any) {
        if (!cancelled) {
          setCatalog([]);
          setSubmitStatus({
            state: "error",
            message: e.message ?? "Error",
          });
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [locale, slugFromQuery]);

  // 2) Load slots for current selection
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setSlots([]);
      setDuration(null);

      try {
        const url = `/api/slots?locale=${encodeURIComponent(
          locale
        )}&date=${encodeURIComponent(date)}&slug=${encodeURIComponent(slug)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to load slots");
        }

        const parsed = data as SlotResponse;

        if (!cancelled) {
          setSlots(parsed.slots ?? []);
          setDuration(parsed.durationMinutes ?? null);

          // If selected time became unavailable, reset it
          if (selectedStart) {
            const stillOk = (parsed.slots ?? []).some(
              (s) => s.start === selectedStart && s.available
            );
            if (!stillOk) setSelectedStart("");
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setSlots([]);
          setDuration(null);
          setSubmitStatus({
            state: "error",
            message: e.message ?? "Error",
          });
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, date, slug]);

  async function submit() {
    setSubmitStatus({ state: "loading" });

    try {
      if (!slug) throw new Error("Choose a service/offer");
      if (!selectedStart) throw new Error("Select a time");
      if (name.trim().length < 2) throw new Error("Name is too short");
      if (phone.trim().length < 6) throw new Error("Phone is too short");

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          date,
          start: selectedStart,
          slug,
          name,
          phone,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Booking failed");
      }

      setSubmitStatus({
        state: "success",
        message: "Booked successfully!",
      });

      // after success: refresh slots so booked slot becomes disabled
      setSelectedStart("");
      setLoadingSlots(true);

      const url = `/api/slots?locale=${encodeURIComponent(
        locale
      )}&date=${encodeURIComponent(date)}&slug=${encodeURIComponent(slug)}`;

      const res2 = await fetch(url);
      const data2 = await res2.json();

      if (res2.ok) {
        const parsed2 = data2 as SlotResponse;
        setSlots(parsed2.slots ?? []);
        setDuration(parsed2.durationMinutes ?? null);
      }

      setLoadingSlots(false);
    } catch (e: any) {
      setSubmitStatus({
        state: "error",
        message: e.message ?? "Error",
      });
    }
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="max-w-3xl">
      <Link
        href={withLocale(locale as any, "/services")}
        className="text-sm text-gray-600 hover:text-black transition-colors"
      >
        ← Back to services
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Booking</h1>
      <p className="mt-2 text-gray-600">
        Choose service, date and time. Booked times are shown but disabled.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Service / Offer</div>

          <select
            className="mt-2 w-full border rounded-md px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={catalogLoading || catalog.length === 0}
          >
            {catalog.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.title}
              </option>
            ))}
          </select>

          <div className="mt-4 text-sm text-gray-600">Date</div>
          <input
            type="date"
            className="mt-2 w-full border rounded-md px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="mt-4 text-sm text-gray-600">Duration</div>
          <div className="mt-1 font-medium">
            {duration ? `${duration} min` : "—"}
          </div>

          <div className="mt-4 text-sm text-gray-600">Available today</div>
          <div className="mt-1 font-medium">
            {loadingSlots ? "…" : availableCount}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Times</div>

          {loadingSlots ? (
            <div className="mt-3 text-sm text-gray-500">Loading...</div>
          ) : slots.length === 0 ? (
            <div className="mt-3 text-sm text-gray-500">
              No times for this date.
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((s) => {
                const active = selectedStart === s.start;
                const disabled = !s.available;

                return (
                  <button
                    key={s.start}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) setSelectedStart(s.start);
                    }}
                    className={
                      "rounded-md border px-3 py-1.5 text-sm transition " +
                      (active ? "bg-black text-white " : "") +
                      (disabled
                        ? "opacity-40 cursor-not-allowed line-through"
                        : "hover:bg-gray-50")
                    }
                    title={disabled ? "Booked" : "Available"}
                  >
                    {s.start}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">Selected</div>
          <div className="mt-1 font-medium">
            {selectedStart ? `${date} ${selectedStart}` : "—"}
          </div>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-4">
        <h2 className="text-lg font-semibold">Your details</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="mt-2 w-full border rounded-md px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              className="mt-2 w-full border rounded-md px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+31..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Comment (optional)</label>
            <textarea
              className="mt-2 w-full border rounded-md px-3 py-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any notes..."
              rows={3}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={submitStatus.state === "loading"}
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {submitStatus.state === "loading" ? "Booking..." : "Book now"}
          </button>

          {submitStatus.state === "error" ? (
            <div className="text-sm text-red-600">{submitStatus.message}</div>
          ) : null}

          {submitStatus.state === "success" ? (
            <div className="text-sm text-green-700">{submitStatus.message}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
