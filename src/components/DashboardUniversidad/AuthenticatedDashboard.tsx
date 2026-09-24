"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText, LayoutDashboard, LogOut, Menu, Settings, Users, Video, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import styles from "./DashboardUniversidad.module.css";
import CareersPanel from "./CareersPanel";
import ClaimUniversityView from "./ClaimUniversityView";
import FullScreenMessage from "./FullScreenMessage";
import LeadsPanel from "./LeadsPanel";
import PanelGeneral from "./PanelGeneral";
import PerfilPanel from "./PerfilPanel";
import SidebarButton from "./SidebarButton";
import VideosPanel from "./VideosPanel";
import type { LeadRow, MyUniversity } from "./types";

export default function AuthenticatedDashboard({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const [myUniversity, setMyUniversity] = useState<MyUniversity | null>(null);
  const [loadingUniversity, setLoadingUniversity] = useState(true);
  const [activeSection, setActiveSection] = useState<"panel" | "videos" | "leads" | "perfil" | "carreras">("panel");
  const [leadsCount, setLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [claimReloadKey, setClaimReloadKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [impressionsCount, setImpressionsCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

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

  useEffect(() => {
    if (!myUniversity) return;

    async function loadMetrics() {
      if (!myUniversity) return;
      setLoadingMetrics(true);

      const [{ count: impressions }, { count: clicks }] = await Promise.all([
        supabase
          .from("university_events")
          .select("id", { count: "exact", head: true })
          .eq("university_id", myUniversity.id)
          .eq("event_type", "impression"),
        supabase
          .from("university_events")
          .select("id", { count: "exact", head: true })
          .eq("university_id", myUniversity.id)
          .eq("event_type", "click"),
      ]);

      setImpressionsCount(impressions ?? 0);
      setClicksCount(clicks ?? 0);
      setLoadingMetrics(false);
    }
    loadMetrics();
  }, [myUniversity]);

  if (loadingUniversity) {
    return (
      <FullScreenMessage>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Spinner size={20} color="#64748b" /> Cargando tu universidad...
        </span>
      </FullScreenMessage>
    );
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
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "2rem", height: "2rem", borderRadius: "9999px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Image src="/icon-navy.png" alt="" width={22} height={20} />
              </span>
              <h1 className={styles.sidebarTitle}>OrientAI <span style={{ fontSize: "0.875rem", color: "white", fontWeight: "normal" }}>B2B</span></h1>
            </div>
            <p className={styles.sidebarSubtitle}>{myUniversity.name}</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={styles.hamburgerButton}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <button
            className={styles.mobileMenuOverlay}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
            style={{ background: "none", border: "none", cursor: "default", padding: 0 }}
          />
        )}

        <div className={`${styles.navPanel} ${mobileMenuOpen ? styles.navOpen : ""}`}>
          <nav className={styles.sidebarNav}>
            <SidebarButton
              icon={LayoutDashboard}
              text="Panel General"
              active={activeSection === "panel"}
              onClick={() => { setActiveSection("panel"); setMobileMenuOpen(false); }}
            />
            <SidebarButton
              icon={Users}
              text="Leads Estudiantiles"
              active={activeSection === "leads"}
              disabled={!isPremium}
              isPremiumOnly={!isPremium}
              onClick={() => { if (isPremium) { setActiveSection("leads"); setMobileMenuOpen(false); } }}
            />
            <SidebarButton
              icon={Video}
              text="Gestionar Videos"
              active={activeSection === "videos"}
              disabled={!isPremium}
              isPremiumOnly={!isPremium}
              onClick={() => { if (isPremium) { setActiveSection("videos"); setMobileMenuOpen(false); } }}
            />
            <SidebarButton
              icon={FileText}
              text="Planes de Estudio"
              active={activeSection === "carreras"}
              onClick={() => { setActiveSection("carreras"); setMobileMenuOpen(false); }}
            />
            <SidebarButton
              icon={Settings}
              text="Configurar Perfil"
              active={activeSection === "perfil"}
              onClick={() => { setActiveSection("perfil"); setMobileMenuOpen(false); }}
            />
          </nav>

          <div className={styles.sidebarFooter} style={{ flexDirection: "column", gap: "0.5rem" }}>
            <button onClick={onSignOut} className={styles.footerButton}>
              <LogOut size={16} /> Cerrar sesión
            </button>
            <Link href="/" className={`${styles.footerButton} ${styles.footerButtonGhost}`}>
              <ArrowLeft size={16} /> Volver al inicio
            </Link>
          </div>
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
        ) : activeSection === "carreras" ? (
          <CareersPanel universityId={myUniversity.id} />
        ) : (
          <PanelGeneral
            universityId={myUniversity.id}
            universityName={myUniversity.name}
            isPremium={isPremium}
            leadsCount={leadsCount}
            loadingLeads={loadingLeads}
            recentLeads={recentLeads}
            impressionsCount={impressionsCount}
            clicksCount={clicksCount}
            loadingMetrics={loadingMetrics}
          />
        )}
      </main>
    </div>
  );
}
