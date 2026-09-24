"use client";
import { useEffect, useState, type FormEvent } from "react";
import Spinner from "@/components/Spinner";
import FullScreenMessage from "./FullScreenMessage";
import { inputStyle } from "./constants";
import { useUniversityLinking } from "./useUniversityLinking";

export default function ClaimUniversityView({ onClaimed, onSignOut }: { onClaimed: () => void; onSignOut: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linking = useUniversityLinking();
  const {
    unclaimed,
    loadingUnclaimed,
    selectedToClaim,
    setSelectedToClaim,
    creatingNew,
    startCreatingNew,
    stopCreatingNew,
    newUniName,
    setNewUniName,
    newUniCity,
    setNewUniCity,
  } = linking;

  useEffect(() => {
    linking.loadUnclaimed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = linking.validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const { error: linkError } = await linking.linkUniversity();
    setSubmitting(false);

    if (linkError) {
      setError(linkError.message);
      return;
    }
    onClaimed();
  };

  return (
    <FullScreenMessage>
      <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "24rem", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", textAlign: "left" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
          {creatingNew ? "Creá tu universidad" : "Sumá tu universidad"}
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Tu cuenta todavía no está vinculada a ninguna universidad. {creatingNew ? "Completá los datos básicos para darla de alta." : "Elegí cuál administrás para ver su panel."}
        </p>

        {loadingUnclaimed && !creatingNew ? (
          <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.875rem" }}>
            <Spinner size={16} color="#64748b" /> Cargando universidades disponibles...
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {!creatingNew ? (
              <>
                {unclaimed.length > 0 && (
                  <select
                    id="claim-university"
                    required
                    value={selectedToClaim}
                    onChange={(e) => setSelectedToClaim(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Elegí tu universidad...</option>
                    {unclaimed.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => { startCreatingNew(); setError(null); }}
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0, textAlign: "left" }}
                >
                  {unclaimed.length === 0 ? "No quedan universidades sin reclamar — creá la tuya" : "¿Tu universidad no está en la lista? Creála"}
                </button>
              </>
            ) : (
              <>
                <input
                  id="new-university-name-claim"
                  required
                  placeholder="Nombre de tu universidad"
                  value={newUniName}
                  onChange={(e) => setNewUniName(e.target.value)}
                  style={inputStyle}
                />
                <input
                  id="new-university-city-claim"
                  required
                  placeholder="Ciudad"
                  value={newUniCity}
                  onChange={(e) => setNewUniCity(e.target.value)}
                  style={inputStyle}
                />
                {unclaimed.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { stopCreatingNew(); setError(null); }}
                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0, textAlign: "left" }}
                  >
                    ← Elegir de la lista en vez de crear una nueva
                  </button>
                )}
              </>
            )}

            {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "#1B2A4C", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Un momento..." : creatingNew ? "Crear universidad" : "Reclamar universidad"}
            </button>
          </form>
        )}

        <button onClick={onSignOut} style={{ marginTop: "1.5rem", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline", padding: 0 }}>
          Cerrar sesión
        </button>
      </div>
    </FullScreenMessage>
  );
}
