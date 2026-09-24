import { CheckCircle2, Lock, Star } from "lucide-react";
import styles from "./DashboardUniversidad.module.css";
import LeadsTable from "./LeadsTable";
import StatCard from "./StatCard";
import TrendChart from "./TrendChart";
import type { LeadRow } from "./types";

export default function PanelGeneral({
  universityId,
  universityName,
  isPremium,
  leadsCount,
  loadingLeads,
  recentLeads,
  impressionsCount,
  clicksCount,
  loadingMetrics,
}: {
  universityId: string;
  universityName: string;
  isPremium: boolean;
  leadsCount: number;
  loadingLeads: boolean;
  recentLeads: LeadRow[];
  impressionsCount: number;
  clicksCount: number;
  loadingMetrics: boolean;
}) {
  return (
    <>
      <header className={styles.header}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.5rem 0", color: "#1e293b" }}>Hola, {universityName}</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Resumen de tu rendimiento de los últimos 30 días.</p>
        </div>

        {!isPremium ? (
          <div style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Star size={16} /> Cuenta estándar
          </div>
        ) : (
          <div className={styles.premiumActive}>
            <CheckCircle2 size={16} /> Cuenta Premium Activa
          </div>
        )}
      </header>

      <div className={styles.overviewGrid}>
        <TrendChart universityId={universityId} isPremium={isPremium} />

        <div className={styles.statsColumn}>
          <StatCard
            title="Apariciones en Resultados"
            value={loadingMetrics ? "..." : impressionsCount.toLocaleString("es-AR")}
            trend=""
            subtitle="Veces que tu perfil apareció en resultados de estudiantes"
          />
          <StatCard
            title="Clicks en Perfil"
            value={loadingMetrics ? "..." : clicksCount.toLocaleString("es-AR")}
            trend=""
            subtitle="Estudiantes que abrieron un Micro-Caso de tus carreras"
          />
          <StatCard
            title="Leads de WhatsApp"
            value={isPremium ? (loadingLeads ? "..." : String(leadsCount)) : "Bloqueado"}
            trend={isPremium && leadsCount > 0 ? "Real" : ""}
            subtitle="Contactos directos generados desde la app"
            isBlurred={!isPremium}
          />
        </div>
      </div>

      {!isPremium ? (
        <div className={styles.paywallContainer}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", color: "#94a3b8" }}><Lock size={36} strokeWidth={1.5} /></div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 0.5rem 0" }}>Desbloqueá tus leads</h3>
          <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
            Actualmente estás perdiendo estudiantes que buscan tu carrera. Con Premium tu universidad aparece primero en los resultados, podés mostrar videos de tus alumnos y acceder a los datos de contacto.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
            Premium se activa cuando tu universidad se afilia con nosotros. Contactá a nuestro equipo para coordinarlo.
          </p>
        </div>
      ) : (
        <LeadsTable title="Últimos Leads" loading={loadingLeads} leads={recentLeads} />
      )}
    </>
  );
}
