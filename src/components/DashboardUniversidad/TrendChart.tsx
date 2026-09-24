"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import styles from "./DashboardUniversidad.module.css";
import { TREND_COLORS } from "./constants";
import type { DayPoint } from "./types";

export default function TrendChart({ universityId, isPremium }: { universityId: string; isPremium: boolean }) {
  const [days, setDays] = useState<DayPoint[] | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTrend() {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);

      const [{ data: events }, { data: leadsData }] = await Promise.all([
        supabase
          .from("university_events")
          .select("event_type, created_at")
          .eq("university_id", universityId)
          .gte("created_at", since.toISOString()),
        isPremium
          ? supabase
              .from("leads")
              .select("created_at")
              .eq("university_id", universityId)
              .gte("created_at", since.toISOString())
          : Promise.resolve({ data: [] as { created_at: string }[] }),
      ]);

      const buckets: DayPoint[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        buckets.push({ date: d.toISOString().slice(0, 10), impressions: 0, clicks: 0, leads: 0 });
      }
      const indexByDate = new Map(buckets.map((b, i) => [b.date, i]));

      for (const e of events ?? []) {
        const idx = indexByDate.get(e.created_at.slice(0, 10));
        if (idx === undefined) continue;
        if (e.event_type === "impression") buckets[idx].impressions += 1;
        else if (e.event_type === "click") buckets[idx].clicks += 1;
      }
      for (const l of leadsData ?? []) {
        const idx = indexByDate.get(l.created_at.slice(0, 10));
        if (idx !== undefined) buckets[idx].leads += 1;
      }

      if (!cancelled) setDays(buckets);
    }

    loadTrend();
    return () => {
      cancelled = true;
    };
  }, [universityId, isPremium]);

  if (!days) {
    return (
      <div className={styles.dataTableContainer} style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
        <Spinner size={16} color="#64748b" /> Cargando tendencia...
      </div>
    );
  }

  const width = 700;
  const height = 220;
  const padLeft = 44;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const series: { key: "impressions" | "clicks" | "leads"; label: string; color: string }[] = [
    { key: "impressions", label: "Apariciones", color: TREND_COLORS.impressions },
    { key: "clicks", label: "Clicks", color: TREND_COLORS.clicks },
    ...(isPremium ? [{ key: "leads" as const, label: "Leads", color: TREND_COLORS.leads }] : []),
  ];

  const maxRaw = Math.max(1, ...days.flatMap((d) => series.map((s) => d[s.key])));
  const niceMax = (() => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxRaw)));
    const normalized = maxRaw / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * magnitude;
  })();

  const xFor = (i: number) => padLeft + (i / (days.length - 1)) * plotWidth;
  const yFor = (value: number) => padTop + plotHeight - (value / niceMax) * plotHeight;

  const pathFor = (key: "impressions" | "clicks" | "leads") =>
    days.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(d[key]).toFixed(1)}`).join(" ");

  const yTicks = [0, niceMax / 2, niceMax];

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;
    const ratio = (relativeX - padLeft) / plotWidth;
    const idx = Math.round(ratio * (days.length - 1));
    setHoverIndex(Math.max(0, Math.min(days.length - 1, idx)));
  };

  const hovered = hoverIndex !== null ? days[hoverIndex] : null;
  const tooltipFlip = hoverIndex !== null && hoverIndex > (days.length - 1) / 2;

  return (
    <div className={styles.dataTableContainer} style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h3 style={{ margin: 0, fontWeight: "bold", color: "#1e293b", fontSize: "1rem" }}>Tendencia (últimos 30 días)</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {series.map((s) => (
            <span key={s.key} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#64748b" }}>
              <span style={{ display: "inline-block", width: "14px", height: "2px", backgroundColor: s.color, borderRadius: "2px" }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block", touchAction: "none" }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={padLeft} x2={width - padRight} y1={yFor(tick)} y2={yFor(tick)} stroke="#e1e0d9" strokeWidth={1} />
              <text x={padLeft - 8} y={yFor(tick)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#898781">
                {Math.round(tick).toLocaleString("es-AR")}
              </text>
            </g>
          ))}

          {days.map((d, i) =>
            i % 5 === 0 ? (
              <text key={d.date} x={xFor(i)} y={height - 8} textAnchor="middle" fontSize={10} fill="#898781">
                {new Date(d.date + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
              </text>
            ) : null
          )}

          {series.map((s) => (
            <path key={s.key} d={pathFor(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {series.map((s) => (
            <circle key={s.key} cx={xFor(days.length - 1)} cy={yFor(days[days.length - 1][s.key])} r={4} fill={s.color} stroke="#ffffff" strokeWidth={2} />
          ))}

          {hoverIndex !== null && (
            <line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={padTop} y2={height - padBottom} stroke="#c3c2b7" strokeWidth={1} />
          )}
          {hoverIndex !== null &&
            series.map((s) => (
              <circle key={s.key} cx={xFor(hoverIndex)} cy={yFor(days[hoverIndex][s.key])} r={4} fill={s.color} stroke="#ffffff" strokeWidth={2} />
            ))}
        </svg>

        {hovered && hoverIndex !== null && (
          <div
            style={{
              position: "absolute",
              left: `${(xFor(hoverIndex) / width) * 100}%`,
              top: 0,
              transform: tooltipFlip ? "translateX(-100%)" : "translateX(0)",
              backgroundColor: "#1e293b",
              color: "white",
              borderRadius: "0.5rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.75rem",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
              {new Date(hovered.date + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
            </div>
            {series.map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ display: "inline-block", width: "10px", height: "2px", backgroundColor: s.color }} />
                <span style={{ opacity: 0.8 }}>{s.label}:</span>
                <strong>{hovered[s.key]}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
