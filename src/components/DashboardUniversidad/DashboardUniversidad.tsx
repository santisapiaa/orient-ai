"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./DashboardUniversidad.module.css";

type UniversityOption = {
  id: string;
  name: string;
  is_premium: boolean;
};

type LeadRow = {
  id: string;
  location: string;
  matched_category: string;
  created_at: string | null;
};

// Sin login todavía: persistimos qué universidad estás viendo en localStorage
// para simular una sesión, en vez de mostrar siempre la primera de la lista.
const SELECTED_UNIVERSITY_KEY = "orientai_selected_university";

export default function DashboardUniversidad() {
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isPremium, setIsPremium] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [updatingPremium, setUpdatingPremium] = useState(false);

  useEffect(() => {
    async function loadUniversities() {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name, is_premium")
        .order("name");

      if (error || !data || data.length === 0) {
        setLoadingUniversities(false);
        return;
      }

      setUniversities(data);

      let storedId: string | null = null;
      try {
        storedId = window.localStorage.getItem(SELECTED_UNIVERSITY_KEY);
      } catch {}

      const initial = data.find((u) => u.id === storedId) ?? data[0];
      setSelectedId(initial.id);
      setIsPremium(initial.is_premium);
      setLoadingUniversities(false);
    }
    loadUniversities();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    async function loadLeads() {
      setLoadingLeads(true);

      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("university_id", selectedId);

      const { data: recent } = await supabase
        .from("leads")
        .select("id, location, matched_category, created_at")
        .eq("university_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(5);

      setLeadsCount(count ?? 0);
      setRecentLeads(recent ?? []);
      setLoadingLeads(false);
    }
    loadLeads();
  }, [selectedId]);

  const handleSelectUniversity = (id: string) => {
    setSelectedId(id);
    const uni = universities.find((u) => u.id === id);
    setIsPremium(uni?.is_premium ?? false);
    try {
      window.localStorage.setItem(SELECTED_UNIVERSITY_KEY, id);
    } catch {}
  };

  const activatePremium = async () => {
    if (!selectedId) return;
    setUpdatingPremium(true);

    // Se llama a una función de Postgres (RPC) en vez de hacer un update()
    // directo a la tabla: así "anon" solo puede activar is_premium para un id
    // puntual y no queda con permiso de editar cualquier otra columna.
    const { error } = await supabase.rpc("activate_university_premium", {
      target_id: selectedId,
    });

    if (!error) {
      setIsPremium(true);
      setUniversities((prev) =>
        prev.map((u) => (u.id === selectedId ? { ...u, is_premium: true } : u))
      );
    } else {
      console.error("No se pudo activar Premium:", error.message);
    }
    setUpdatingPremium(false);
  };

  const selectedUniversity = universities.find((u) => u.id === selectedId);

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>OrientAI <span style={{fontSize: '0.875rem', color: 'white', fontWeight: 'normal'}}>B2B</span></h1>
          <p className={styles.sidebarSubtitle}>Panel de Universidad</p>
        </div>

        {universities.length > 1 && (
          <div style={{padding: '0 1.5rem', marginBottom: '0.5rem'}}>
            <label style={{fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem'}}>
              Viendo como (demo, sin login):
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectUniversity(e.target.value)}
              style={{width: '100%', padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', fontSize: '0.8rem'}}
            >
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        <nav className={styles.sidebarNav}>
          <NavItem active icon="📊" text="Panel General" />
          <NavItem icon="👥" text="Leads Estudiantiles" isPremiumOnly={!isPremium} />
          <NavItem icon="🎥" text="Gestionar Videos" isPremiumOnly={!isPremium} />
          <NavItem icon="⚙️" text="Configurar Perfil" />
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" style={{color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem'}}>
            ← Volver al inicio
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {loadingUniversities ? (
          <div style={{color: '#64748b'}}>Cargando universidades...</div>
        ) : !selectedUniversity ? (
          <div style={{color: '#64748b'}}>
            No hay universidades cargadas todavía en Supabase.
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <div>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1e293b'}}>Hola, {selectedUniversity.name}</h2>
                <p style={{color: '#64748b', fontSize: '0.875rem', margin: 0}}>Resumen de tu rendimiento de los últimos 30 días.</p>
              </div>

              {!isPremium ? (
                <button
                  onClick={activatePremium}
                  disabled={updatingPremium}
                  className={styles.btnPremium}
                  style={{opacity: updatingPremium ? 0.7 : 1}}
                >
                  <span>⭐</span> {updatingPremium ? "Activando..." : "Actualizar a Premium"}
                </button>
              ) : (
                <div className={styles.premiumActive}>
                  <span>✅</span> Cuenta Premium Activa
                </div>
              )}
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <StatCard
                title="Apariciones en Resultados"
                value="12,450"
                trend="+15%"
                subtitle="Veces que tu perfil básico fue visto (dato de demo, no medido aún)"
              />
              <StatCard
                title="Clicks en Perfil"
                value="843"
                trend="+5%"
                subtitle="Estudiantes interesados en tus carreras (dato de demo, no medido aún)"
              />
              <StatCard
                title="Leads de WhatsApp"
                value={isPremium ? (loadingLeads ? "..." : String(leadsCount)) : "Bloqueado"}
                trend={isPremium && leadsCount > 0 ? "Real" : ""}
                subtitle="Contactos directos generados desde la app"
                isBlurred={!isPremium}
              />
            </div>

            {/* Main Content Area based on Plan */}
            {!isPremium ? (
              <div className={styles.paywallContainer}>
                <span style={{fontSize: '2.25rem', marginBottom: '1rem', display: 'block'}}>🔒</span>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.5rem 0'}}>Desbloqueá tus leads</h3>
                <p style={{color: '#475569', marginBottom: '2rem'}}>
                  Actualmente estás perdiendo estudiantes que buscan tu carrera. Pásate a Premium para mostrar videos, poner tu botón de WhatsApp y acceder a los datos de contacto.
                </p>

                <button
                  onClick={activatePremium}
                  disabled={updatingPremium}
                  style={{backgroundColor: '#0f172a', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: updatingPremium ? 0.7 : 1}}
                >
                  Ver Demostración Premium
                </button>
                <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem'}}>(Botón para simular en la presentación)</p>
              </div>
            ) : (
              <div className={styles.dataTableContainer}>
                <div className={styles.tableHeader}>
                  <h3 style={{margin: 0, fontWeight: 'bold', color: '#1e293b'}}>Últimos Leads</h3>
                </div>

                {loadingLeads ? (
                  <div style={{padding: '1.5rem', color: '#64748b'}}>Cargando leads...</div>
                ) : recentLeads.length === 0 ? (
                  <div style={{padding: '1.5rem', color: '#64748b'}}>
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
                            <span style={{backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold'}}>
                              {lead.matched_category}
                            </span>
                          </td>
                          <td style={{fontWeight: 'bold', color: '#1e293b'}}>{lead.location}</td>
                          <td style={{color: '#64748b', fontSize: '0.8rem'}}>
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-AR') : '-'}
                          </td>
                          <td>
                            <button style={{color: '#16a34a', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer'}}>💬 Contactar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// --- Helper Components ---

function NavItem({ icon, text, active = false, isPremiumOnly = false }: { icon: string, text: string, active?: boolean, isPremiumOnly?: boolean }) {
  const itemClass = `${styles.navItem} ${active ? styles.navItemActive : ''} ${isPremiumOnly ? styles.navItemDisabled : ''}`;

  return (
    <a href="#" className={itemClass}>
      <span>{icon}</span>
      <span style={{fontWeight: '500', fontSize: '0.875rem'}}>{text}</span>
      {isPremiumOnly && <span className={styles.proBadge}>PRO</span>}
    </a>
  );
}

function StatCard({ title, value, trend, subtitle, isBlurred = false }: { title: string, value: string, trend: string, subtitle: string, isBlurred?: boolean }) {
  return (
    <div className={styles.statCard}>
      {isBlurred && (
        <div className={styles.blurredOverlay}>
          <span style={{fontSize: '1.5rem'}}>🔒</span>
          <span style={{fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Premium</span>
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
