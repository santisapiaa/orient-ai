"use client";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./DashboardUniversidad.module.css";
import { inputStyle } from "./constants";

export default function PerfilPanel({
  universityId,
  description,
  onUpdated,
}: {
  universityId: string;
  description: string | null;
  onUpdated: (newDescription: string) => void;
}) {
  const [value, setValue] = useState(description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    const { error: updateError } = await supabase.rpc("update_university_profile", {
      target_id: universityId,
      new_description: value,
    });

    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    onUpdated(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Configurar Perfil</h2>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Esta descripción es lo que ven los estudiantes en la app, debajo del nombre de tu universidad.
      </p>

      <form onSubmit={handleSubmit} className={styles.dataTableContainer} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "36rem" }}>
        <label htmlFor="university-description" style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#1e293b" }}>
          Descripción
        </label>
        <textarea
          id="university-description"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          placeholder="Ej: Facultad con plan de estudios tradicional y sólido enfocado en investigación."
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />

        {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
        {saved && <p style={{ color: "#16a34a", fontSize: "0.8rem", margin: 0 }}>Guardado.</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: "#2AAE8A", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1, alignSelf: "flex-start", paddingInline: "1.5rem" }}
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
