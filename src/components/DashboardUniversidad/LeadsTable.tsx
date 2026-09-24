import { MessageCircle } from "lucide-react";
import Spinner from "@/components/Spinner";
import styles from "./DashboardUniversidad.module.css";
import type { LeadRow } from "./types";

export default function LeadsTable({ title, loading, leads }: { title: string; loading: boolean; leads: LeadRow[] }) {
  return (
    <div className={styles.dataTableContainer}>
      <div className={styles.tableHeader}>
        <h3 style={{ margin: 0, fontWeight: "bold", color: "#1e293b" }}>{title}</h3>
      </div>

      {loading ? (
        <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
          <Spinner size={16} color="#64748b" /> Cargando leads...
        </div>
      ) : leads.length === 0 ? (
        <div style={{ padding: "1.5rem", color: "#64748b" }}>
          Todavía no llegaron leads reales para esta universidad. Van a aparecer acá apenas un estudiante toque &quot;Contactar Admisiones&quot; en la app.
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Interés</th>
              <th>Ubicación</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <span style={{ backgroundColor: "#CFF7EA", color: "#124D41", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {lead.matched_category}
                  </span>
                </td>
                <td style={{ fontWeight: "bold", color: "#1e293b" }}>{lead.location}</td>
                <td style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  {lead.created_at ? new Date(lead.created_at).toLocaleDateString("es-AR") : "-"}
                </td>
                <td>
                  <button style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#16a34a", border: "none", background: "none", fontWeight: "bold", cursor: "pointer" }}><MessageCircle size={14} /> Contactar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
