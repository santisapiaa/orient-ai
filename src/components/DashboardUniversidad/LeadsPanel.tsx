"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeadsTable from "./LeadsTable";
import type { LeadRow } from "./types";

export default function LeadsPanel({ universityId }: { universityId: string }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLeads() {
      setLoading(true);
      const { data } = await supabase
        .from("leads")
        .select("id, location, matched_category, created_at")
        .eq("university_id", universityId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        setLeads(data ?? []);
        setLoading(false);
      }
    }

    loadLeads();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>Leads Estudiantiles</h2>
      <LeadsTable title="Últimos 50 contactos" loading={loading} leads={leads} />
    </div>
  );
}
