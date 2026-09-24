"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Landmark, LogOut, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./AppEstudiante.module.css";
import DirectoryView from "./DirectoryView";
import LocationView from "./LocationView";
import ResultsView from "./ResultsView";
import TestView from "./TestView";
import type { LikedItem } from "./types";

const FLOW_STORAGE_KEY = "orientai_student_flow";

export default function AppEstudiante() {
  const [activeTab, setActiveTab] = useState<"test" | "results" | "location" | "directory">("test");
  const [userProfile, setUserProfile] = useState<string[]>([]);
  const [userLikedItems, setUserLikedItems] = useState<LikedItem[]>([]);
  const [userLocation, setUserLocation] = useState<string>("Buenos Aires");
  const [hydrated, setHydrated] = useState(false);

  // Restaurar donde se habia quedado el estudiante (si hay algo guardado)
  // despues de la hidratacion, para no perder el progreso al refrescar.
  // localStorage no existe en el server, asi que esto solo puede pasar
  // aca (un lazy initializer rompería la hidratación de Next.js).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FLOW_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved.activeTab) setActiveTab(saved.activeTab);
        if (saved.userProfile) setUserProfile(saved.userProfile);
        if (saved.userLikedItems) setUserLikedItems(saved.userLikedItems);
        if (saved.userLocation) setUserLocation(saved.userLocation);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ activeTab, userProfile, userLikedItems, userLocation }));
    } catch {}
  }, [hydrated, activeTab, userProfile, userLikedItems, userLocation]);

  const finishTest = (topCategories: string[], likedItems: LikedItem[]) => {
    setUserProfile(topCategories);
    setUserLikedItems(likedItems);
    setActiveTab("results");
  };

  const handleLocationSubmit = async (location: string) => {
    setUserLocation(location);
    // Registro anónimo para el dashboard de las universidades
    const { error } = await supabase.from('leads').insert([
      { full_name: "Estudiante Anónimo", contact_info: "Sin registro", location: location, matched_category: userProfile.join(" + ") }
    ]);
    if (error) {
      console.error('No se pudo registrar el lead anónimo:', error.message);
    }
    setActiveTab("directory");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mobileFrame}>
        <div className={styles.notch}></div>

        <div className={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{width: '1.75rem', height: '1.75rem', borderRadius: '9999px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Image src="/icon-navy.png" alt="" width={20} height={18} />
            </span>
            <h1 className={styles.headerTitle}>OrientAI</h1>
          </div>
          <Link href="/" className={styles.headerLink}><LogOut size={14} /> Salir</Link>
        </div>

        <div className={styles.contentArea}>
          {activeTab === "test" && <TestView onComplete={finishTest} />}
          {activeTab === "results" && <ResultsView profile={userProfile} likedItems={userLikedItems} onContinue={() => setActiveTab("location")} />}
          {activeTab === "location" && <LocationView onSubmit={handleLocationSubmit} />}
          {activeTab === "directory" && <DirectoryView profile={userProfile} location={userLocation} />}
        </div>

        <div className={styles.bottomNav}>
          <button onClick={() => setActiveTab("test")} className={`${styles.navButton} ${activeTab === "test" ? styles.navButtonActive : ""}`}>
            <div className={styles.navIcon}><ClipboardList size={22} /></div>
            <span className={styles.navText}>Test</span>
          </button>
          <button onClick={() => setActiveTab("results")} className={`${styles.navButton} ${activeTab === "results" ? styles.navButtonActive : ""}`}>
            <div className={styles.navIcon}><UserRound size={22} /></div>
            <span className={styles.navText}>Mi Perfil</span>
          </button>
          <button onClick={() => setActiveTab("directory")} className={`${styles.navButton} ${activeTab === "directory" || activeTab === "location" ? styles.navButtonActive : ""}`}>
            <div className={styles.navIcon}><Landmark size={22} /></div>
            <span className={styles.navText}>Opciones</span>
          </button>
        </div>
      </div>
    </div>
  );
}
