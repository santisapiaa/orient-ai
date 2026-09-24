"use client";
import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { inputStyle } from "./constants";
import { useUniversityLinking } from "./useUniversityLinking";

export default function AuthView() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const linking = useUniversityLinking();
  const {
    unclaimed,
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
    if (mode !== "signup") return;
    linking.loadUnclaimed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setError(null);
    setInfo(null);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) setError(signInError.message);
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const validationError = linking.validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    if (!data.session) {
      setInfo("Cuenta creada. Revisá tu email para confirmarla y después iniciá sesión para terminar de vincular tu universidad.");
      setSubmitting(false);
      return;
    }

    const { error: linkError } = await linking.linkUniversity();

    setSubmitting(false);
    if (linkError) setError(linkError.message);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "1rem" }}>
      <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "24rem", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <Image src="/logo-horizontal-navy.png" alt="OrientAI" width={900} height={347} style={{ height: "1.75rem", width: "auto", marginBottom: "1rem" }} />
        <p style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: "bold", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
          PANEL B2B
        </p>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          {mode === "login" ? "Iniciá sesión con tu cuenta de universidad." : "Creá una cuenta y sumá tu universidad."}
        </p>

        <form onSubmit={mode === "login" ? handleLogin : handleSignup} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            id="dashboard-email"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            id="dashboard-password"
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {mode === "signup" && !creatingNew && (
            <>
              <select
                id="dashboard-university"
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
              <button
                type="button"
                onClick={() => { startCreatingNew(); setError(null); }}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0, textAlign: "left" }}
              >
                ¿Tu universidad no está en la lista? Creála
              </button>
            </>
          )}

          {mode === "signup" && creatingNew && (
            <>
              <input
                id="new-university-name"
                required
                placeholder="Nombre de tu universidad"
                value={newUniName}
                onChange={(e) => setNewUniName(e.target.value)}
                style={inputStyle}
              />
              <input
                id="new-university-city"
                required
                placeholder="Ciudad"
                value={newUniCity}
                onChange={(e) => setNewUniCity(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => { stopCreatingNew(); setError(null); }}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0, textAlign: "left" }}
              >
                ← Elegir de la lista en vez de crear una nueva
              </button>
            </>
          )}

          {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
          {info && <p style={{ color: "#16a34a", fontSize: "0.8rem", margin: 0 }}>{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: "#1B2A4C", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Un momento..." : mode === "login" ? "Iniciar sesión" : creatingNew ? "Crear cuenta y universidad" : "Crear cuenta y reclamar"}
          </button>
        </form>

        <button
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          style={{ marginTop: "1rem", background: "none", border: "none", color: "#2AAE8A", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          {mode === "login" ? "¿Tu universidad todavía no tiene cuenta? Sumala acá" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.8rem" }}>← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
