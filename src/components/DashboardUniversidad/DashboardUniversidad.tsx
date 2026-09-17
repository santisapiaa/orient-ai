"use client";
import { useState, useEffect, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Users,
  Video,
  Settings,
  CheckCircle2,
  Lock,
  MessageCircle,
  Star,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./DashboardUniversidad.module.css";

type MyUniversity = {
  id: string;
  name: string;
  is_premium: boolean;
  description: string | null;
};

type UnclaimedUniversity = {
  id: string;
  name: string;
};

type LeadRow = {
  id: string;
  location: string;
  matched_category: string;
  created_at: string | null;
};

type VideoRow = {
  id: string;
  video_url: string;
  author_name: string;
  author_role: "profesional" | "egresado" | "alumno_actual";
  caption: string | null;
};

const inputStyle: CSSProperties = {
  padding: "0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
  fontSize: "0.875rem",
  width: "100%",
  boxSizing: "border-box",
};

export default function DashboardUniversidad() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return <FullScreenMessage>Cargando...</FullScreenMessage>;
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <AuthenticatedDashboard
      userId={session.user.id}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", padding: "2rem", textAlign: "center" }}>
      {children}
    </div>
  );
}

// --- Login / reclamar universidad ---

function AuthView() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unclaimed, setUnclaimed] = useState<UnclaimedUniversity[]>([]);
  const [selectedToClaim, setSelectedToClaim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "signup") return;
    supabase
      .from("universities")
      .select("id, name")
      .is("owner_user_id", null)
      .order("name")
      .then(({ data }) => setUnclaimed(data ?? []));
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

    if (!selectedToClaim) {
      setError("Elegí qué universidad vas a administrar.");
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
      setInfo("Cuenta creada. Revisá tu email para confirmarla y después iniciá sesión para reclamar tu universidad.");
      setSubmitting(false);
      return;
    }

    const { error: claimError } = await supabase.rpc("claim_university", { target_id: selectedToClaim });
    setSubmitting(false);
    if (claimError) setError(claimError.message);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "1rem" }}>
      <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "24rem", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <Image src="/logo-horizontal-navy.png" alt="OrientAI" width={900} height={347} style={{ height: "1.75rem", width: "auto", marginBottom: "1rem" }} />
        <p style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: "bold", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
          PANEL B2B
        </p>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          {mode === "login" ? "Iniciá sesión con tu cuenta de universidad." : "Creá una cuenta y reclamá tu universidad."}
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

          {mode === "signup" && (
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
          )}

          {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
          {info && <p style={{ color: "#16a34a", fontSize: "0.8rem", margin: 0 }}>{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: "#1B2A4C", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Un momento..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta y reclamar"}
          </button>
        </form>

        <button
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          style={{ marginTop: "1rem", background: "none", border: "none", color: "#2AAE8A", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          {mode === "login" ? "¿Tu universidad todavía no tiene cuenta? Reclamala acá" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.8rem" }}>← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard autenticado ---

function AuthenticatedDashboard({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const [myUniversity, setMyUniversity] = useState<MyUniversity | null>(null);
  const [loadingUniversity, setLoadingUniversity] = useState(true);
  const [activeSection, setActiveSection] = useState<"panel" | "videos" | "leads" | "perfil">("panel");
  const [leadsCount, setLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [claimReloadKey, setClaimReloadKey] = useState(0);

  useEffect(() => {
    async function loadMyUniversity() {
      setLoadingUniversity(true);
      const { data } = await supabase
        .from("universities")
        .select("id, name, is_premium, description")
        .eq("owner_user_id", userId)
        .maybeSingle();
      setMyUniversity(data);
      setLoadingUniversity(false);
    }
    loadMyUniversity();
  }, [userId, claimReloadKey]);

  useEffect(() => {
    if (!myUniversity) return;

    async function loadLeads() {
      if (!myUniversity) return;
      setLoadingLeads(true);

      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("university_id", myUniversity.id);

      const { data: recent } = await supabase
        .from("leads")
        .select("id, location, matched_category, created_at")
        .eq("university_id", myUniversity.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setLeadsCount(count ?? 0);
      setRecentLeads(recent ?? []);
      setLoadingLeads(false);
    }
    loadLeads();
  }, [myUniversity]);

  if (loadingUniversity) {
    return <FullScreenMessage>Cargando tu universidad...</FullScreenMessage>;
  }

  if (!myUniversity) {
    return (
      <ClaimUniversityView
        onClaimed={() => setClaimReloadKey((k) => k + 1)}
        onSignOut={onSignOut}
      />
    );
  }

  const isPremium = myUniversity.is_premium;

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "2rem", height: "2rem", borderRadius: "9999px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Image src="/icon-navy.png" alt="" width={22} height={20} />
            </span>
            <h1 className={styles.sidebarTitle}>OrientAI <span style={{ fontSize: "0.875rem", color: "white", fontWeight: "normal" }}>B2B</span></h1>
          </div>
          <p className={styles.sidebarSubtitle}>{myUniversity.name}</p>
        </div>

        <nav className={styles.sidebarNav}>
          <SidebarButton
            icon={LayoutDashboard}
            text="Panel General"
            active={activeSection === "panel"}
            onClick={() => setActiveSection("panel")}
          />
          <SidebarButton
            icon={Users}
            text="Leads Estudiantiles"
            active={activeSection === "leads"}
            disabled={!isPremium}
            isPremiumOnly={!isPremium}
            onClick={() => isPremium && setActiveSection("leads")}
          />
          <SidebarButton
            icon={Video}
            text="Gestionar Videos"
            active={activeSection === "videos"}
            disabled={!isPremium}
            isPremiumOnly={!isPremium}
            onClick={() => isPremium && setActiveSection("videos")}
          />
          <SidebarButton
            icon={Settings}
            text="Configurar Perfil"
            active={activeSection === "perfil"}
            onClick={() => setActiveSection("perfil")}
          />
        </nav>

        <div className={styles.sidebarFooter} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button onClick={onSignOut} style={{ color: "#94a3b8", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: "0.875rem", padding: 0 }}>
            Cerrar sesión
          </button>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>← Volver al inicio</Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {activeSection === "videos" && isPremium ? (
          <VideosPanel universityId={myUniversity.id} />
        ) : activeSection === "leads" && isPremium ? (
          <LeadsPanel universityId={myUniversity.id} />
        ) : activeSection === "perfil" ? (
          <PerfilPanel
            universityId={myUniversity.id}
            description={myUniversity.description}
            onUpdated={(newDescription) => setMyUniversity({ ...myUniversity, description: newDescription })}
          />
        ) : (
          <PanelGeneral
            universityName={myUniversity.name}
            isPremium={isPremium}
            leadsCount={leadsCount}
            loadingLeads={loadingLeads}
            recentLeads={recentLeads}
          />
        )}
      </main>
    </div>
  );
}

// --- Reclamar universidad (cuenta ya autenticada, pero sin universidad asociada) ---

function ClaimUniversityView({ onClaimed, onSignOut }: { onClaimed: () => void; onSignOut: () => void }) {
  const [unclaimed, setUnclaimed] = useState<UnclaimedUniversity[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedToClaim, setSelectedToClaim] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("universities")
      .select("id, name")
      .is("owner_user_id", null)
      .order("name")
      .then(({ data }) => {
        setUnclaimed(data ?? []);
        setLoadingList(false);
      });
  }, []);

  const handleClaim = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedToClaim) {
      setError("Elegí qué universidad vas a administrar.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: claimError } = await supabase.rpc("claim_university", { target_id: selectedToClaim });
    setSubmitting(false);
    if (claimError) {
      setError(claimError.message);
      return;
    }
    onClaimed();
  };

  return (
    <FullScreenMessage>
      <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "24rem", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", textAlign: "left" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Reclamá tu universidad</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Tu cuenta todavía no está vinculada a ninguna universidad. Elegí cuál administrás para ver su panel.
        </p>

        {loadingList ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Cargando universidades disponibles...</p>
        ) : unclaimed.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No quedan universidades sin reclamar. Si la tuya ya fue reclamada por error, escribinos.</p>
        ) : (
          <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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

            {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "#1B2A4C", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Reclamando..." : "Reclamar universidad"}
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

// --- Secciones ---

function PanelGeneral({
  universityName,
  isPremium,
  leadsCount,
  loadingLeads,
  recentLeads,
}: {
  universityName: string;
  isPremium: boolean;
  leadsCount: number;
  loadingLeads: boolean;
  recentLeads: LeadRow[];
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

      <div className={styles.statsGrid}>
        <StatCard title="Apariciones en Resultados" value="12,450" trend="+15%" subtitle="Veces que tu perfil básico fue visto (dato de demo, no medido aún)" />
        <StatCard title="Clicks en Perfil" value="843" trend="+5%" subtitle="Estudiantes interesados en tus carreras (dato de demo, no medido aún)" />
        <StatCard
          title="Leads de WhatsApp"
          value={isPremium ? (loadingLeads ? "..." : String(leadsCount)) : "Bloqueado"}
          trend={isPremium && leadsCount > 0 ? "Real" : ""}
          subtitle="Contactos directos generados desde la app"
          isBlurred={!isPremium}
        />
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
        <div className={styles.dataTableContainer}>
          <div className={styles.tableHeader}>
            <h3 style={{ margin: 0, fontWeight: "bold", color: "#1e293b" }}>Últimos Leads</h3>
          </div>

          {loadingLeads ? (
            <div style={{ padding: "1.5rem", color: "#64748b" }}>Cargando leads...</div>
          ) : recentLeads.length === 0 ? (
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
                {recentLeads.map((lead) => (
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
      )}
    </>
  );
}

function VideosPanel({ universityId }: { universityId: string }) {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState<VideoRow["author_role"]>("alumno_actual");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setLoading(true);
      const { data } = await supabase
        .from("university_videos")
        .select("id, video_url, author_name, author_role, caption")
        .eq("university_id", universityId)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setVideos(data ?? []);
        setLoading(false);
      }
    }

    loadVideos();
    return () => {
      cancelled = true;
    };
  }, [universityId, reloadKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: insertError } = await supabase.from("university_videos").insert([
      { university_id: universityId, video_url: videoUrl, author_name: authorName, author_role: authorRole, caption: caption || null },
    ]);

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setVideoUrl("");
    setAuthorName("");
    setCaption("");
    setReloadKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("university_videos").delete().eq("id", id);
    setReloadKey((k) => k + 1);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Gestionar Videos</h2>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Pegá un link de YouTube, Instagram o Drive de un profesional, ex-alumno o alumno actual recomendando una carrera. Se muestran en la app a los estudiantes que matcheen con tu universidad.
      </p>

      <form onSubmit={handleSubmit} className={styles.dataTableContainer} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input id="video-url" required type="url" placeholder="Link del video (YouTube, Instagram, Drive...)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={inputStyle} />
        <input id="video-author" required placeholder="Nombre de quien habla (ej. Sofía Gómez)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} style={inputStyle} />
        <select id="video-role" value={authorRole} onChange={(e) => setAuthorRole(e.target.value as VideoRow["author_role"])} style={inputStyle}>
          <option value="alumno_actual">Alumno/a actual</option>
          <option value="egresado">Ex-alumno/a</option>
          <option value="profesional">Profesional</option>
        </select>
        <input id="video-caption" placeholder="Bajada opcional (ej. '2do año de Ingeniería')" value={caption} onChange={(e) => setCaption(e.target.value)} style={inputStyle} />

        {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{ backgroundColor: "#2AAE8A", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "+ Agregar video"}
        </button>
      </form>

      {loading ? (
        <p style={{ color: "#64748b" }}>Cargando videos...</p>
      ) : videos.length === 0 ? (
        <p style={{ color: "#64748b" }}>Todavía no cargaste ningún video.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {videos.map((v) => (
            <div key={v.id} className={styles.statCard} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b", fontSize: "0.875rem" }}>
                  {v.author_name} · <span style={{ fontWeight: "normal", color: "#64748b" }}>{roleLabel(v.author_role)}</span>
                </p>
                <a href={v.video_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2AAE8A", wordBreak: "break-all" }}>
                  {v.video_url}
                </a>
              </div>
              <button onClick={() => handleDelete(v.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function roleLabel(role: VideoRow["author_role"]) {
  if (role === "profesional") return "Profesional";
  if (role === "egresado") return "Ex-alumno/a";
  return "Alumno/a actual";
}

function LeadsPanel({ universityId }: { universityId: string }) {
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

      <div className={styles.dataTableContainer}>
        <div className={styles.tableHeader}>
          <h3 style={{ margin: 0, fontWeight: "bold", color: "#1e293b" }}>Últimos 50 contactos</h3>
        </div>

        {loading ? (
          <div style={{ padding: "1.5rem", color: "#64748b" }}>Cargando leads...</div>
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
    </div>
  );
}

function PerfilPanel({
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

// --- Helper Components ---

function SidebarButton({
  icon: Icon,
  text,
  active = false,
  disabled = false,
  isPremiumOnly = false,
  onClick,
}: {
  icon: LucideIcon;
  text: string;
  active?: boolean;
  disabled?: boolean;
  isPremiumOnly?: boolean;
  onClick: () => void;
}) {
  const itemClass = `${styles.navItem} ${active ? styles.navItemActive : ""} ${disabled ? styles.navItemDisabled : ""}`;

  return (
    <button
      onClick={onClick}
      className={itemClass}
      style={{ background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", width: "100%", textAlign: "left" }}
    >
      <Icon size={18} />
      <span style={{ fontWeight: "500", fontSize: "0.875rem" }}>{text}</span>
      {isPremiumOnly && <span className={styles.proBadge}>PRO</span>}
    </button>
  );
}

function StatCard({ title, value, trend, subtitle, isBlurred = false }: { title: string; value: string; trend: string; subtitle: string; isBlurred?: boolean }) {
  return (
    <div className={styles.statCard}>
      {isBlurred && (
        <div className={styles.blurredOverlay}>
          <Lock size={24} />
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" }}>Premium</span>
        </div>
      )}
      <h3 className={styles.statTitle}>{title}</h3>
      <div className={styles.statValueContainer}>
        <p className={styles.statValue}>{value}</p>
        {trend && <span className={styles.statTrend}>{trend}</span>}
      </div>
      <p className={styles.statSubtitle}>{subtitle}</p>
    </div>
  );
}
