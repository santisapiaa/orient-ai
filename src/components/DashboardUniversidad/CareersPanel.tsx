"use client";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import styles from "./DashboardUniversidad.module.css";
import { CAREER_CATEGORIES, inputStyle } from "./constants";
import type { CareerRow } from "./types";

export default function CareersPanel({ universityId }: { universityId: string }) {
  const [careers, setCareers] = useState<CareerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const [newCareerName, setNewCareerName] = useState("");
  const [newCareerCategory, setNewCareerCategory] = useState(CAREER_CATEGORIES[0]);
  const [newCareerDuration, setNewCareerDuration] = useState("");
  const [newCareerBadge, setNewCareerBadge] = useState("Grado");
  const [addingCareer, setAddingCareer] = useState(false);
  const [addCareerError, setAddCareerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCareers() {
      setLoading(true);
      const { data } = await supabase
        .from("careers")
        .select("id, name, category, study_plan_url")
        .eq("university_id", universityId)
        .order("name");
      if (!cancelled) {
        setCareers(data ?? []);
        setDrafts(Object.fromEntries((data ?? []).map((c) => [c.id, c.study_plan_url ?? ""])));
        setLoading(false);
      }
    }

    loadCareers();
    return () => {
      cancelled = true;
    };
  }, [universityId, reloadKey]);

  const handleAddCareer = async (e: FormEvent) => {
    e.preventDefault();
    setAddCareerError(null);

    if (!newCareerName.trim() || !newCareerDuration.trim()) {
      setAddCareerError("Completá el nombre y la duración de la carrera.");
      return;
    }

    setAddingCareer(true);
    const { error } = await supabase.rpc("create_career", {
      target_university_id: universityId,
      new_name: newCareerName.trim(),
      new_category: newCareerCategory,
      new_duration: newCareerDuration.trim(),
      new_badge: newCareerBadge,
    });
    setAddingCareer(false);

    if (error) {
      setAddCareerError(error.message);
      return;
    }

    setNewCareerName("");
    setNewCareerDuration("");
    setReloadKey((k) => k + 1);
  };

  const handleSave = async (careerId: string) => {
    setErrorId(null);
    setSavingId(careerId);

    const { error } = await supabase.rpc("update_career_study_plan", {
      target_career_id: careerId,
      new_url: drafts[careerId] || null,
    });

    setSavingId(null);
    if (error) {
      setErrorId(careerId);
      console.error("No se pudo guardar el plan de estudios:", error.message);
      return;
    }

    setCareers((prev) => prev.map((c) => (c.id === careerId ? { ...c, study_plan_url: drafts[careerId] || null } : c)));
    setSavedId(careerId);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Planes de Estudio</h2>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Pegá el link al PDF del plan de estudios de cada carrera (puede ser de tu propia web o de Google Drive). Los estudiantes lo van a poder descargar desde &quot;Plan de Estudios&quot; en la app.
      </p>

      <form onSubmit={handleAddCareer} className={styles.dataTableContainer} style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b", fontSize: "0.875rem" }}>+ Agregar carrera</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            placeholder="Nombre de la carrera"
            value={newCareerName}
            onChange={(e) => setNewCareerName(e.target.value)}
            style={{ ...inputStyle, flex: 2, minWidth: "12rem" }}
          />
          <select
            value={newCareerCategory}
            onChange={(e) => setNewCareerCategory(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: "10rem" }}
          >
            {CAREER_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            placeholder="Duración (ej: 4 años)"
            value={newCareerDuration}
            onChange={(e) => setNewCareerDuration(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: "8rem" }}
          />
          <select
            value={newCareerBadge}
            onChange={(e) => setNewCareerBadge(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: "8rem" }}
          >
            <option value="Grado">Grado</option>
            <option value="Pregrado">Pregrado</option>
            <option value="Posgrado">Posgrado</option>
          </select>
        </div>
        {addCareerError && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{addCareerError}</p>}
        <button
          type="submit"
          disabled={addingCareer}
          style={{ backgroundColor: "#1B2A4C", color: "white", padding: "0.6rem 1.25rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: addingCareer ? 0.7 : 1, alignSelf: "flex-start" }}
        >
          {addingCareer ? "Agregando..." : "Agregar carrera"}
        </button>
      </form>

      {loading ? (
        <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
          <Spinner size={16} color="#64748b" /> Cargando carreras...
        </p>
      ) : careers.length === 0 ? (
        <p style={{ color: "#64748b" }}>Todavía no hay carreras cargadas para tu universidad.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {careers.map((career) => (
            <div key={career.id} className={styles.dataTableContainer} style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b", fontSize: "0.875rem" }}>
                {career.name} <span style={{ fontWeight: "normal", color: "#64748b" }}>· {career.category}</span>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input
                  type="url"
                  placeholder="Link al PDF del plan de estudios"
                  value={drafts[career.id] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [career.id]: e.target.value }))}
                  style={{ ...inputStyle, flex: 1, minWidth: "16rem" }}
                />
                <button
                  onClick={() => handleSave(career.id)}
                  disabled={savingId === career.id}
                  style={{ backgroundColor: "#2AAE8A", color: "white", padding: "0 1.25rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: savingId === career.id ? 0.7 : 1 }}
                >
                  {savingId === career.id ? "Guardando..." : "Guardar"}
                </button>
              </div>
              {errorId === career.id && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>No se pudo guardar. Probá de nuevo.</p>}
              {savedId === career.id && <p style={{ color: "#16a34a", fontSize: "0.8rem", margin: 0 }}>Guardado.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
