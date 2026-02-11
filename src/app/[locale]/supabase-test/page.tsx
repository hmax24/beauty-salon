"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLocale } from "@/i18n/use-locale";

type HealthRow = {
  id: number;
  ok: boolean;
};

export default function SupabaseTestPage() {
  const locale = useLocale();
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase
        .from("healthcheck")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        setStatus(`Error: ${error.message}`);
        return;
      }

      const row = data as HealthRow;
      setStatus(`OK. locale=${locale}. healthcheck.ok=${row.ok ? "true" : "false"}`);
    }

    run();
  }, [locale]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Supabase test</h1>
      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  );
}
