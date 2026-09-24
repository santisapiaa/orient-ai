"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Target } from "lucide-react";
import styles from "./AppEstudiante.module.css";
import type { LikedItem } from "./types";

export default function ResultsView({ profile, likedItems, onContinue }: { profile: string[], likedItems: LikedItem[], onContinue: () => void }) {
  const profileText = profile.join(" y ");
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // Un ejemplo de lo que le gustó al estudiante por cada categoría top,
  // para que el resultado no sea solo un nombre de categoría pelado.
  const reasons = profile
    .map((cat) => likedItems.find((item) => item.category === cat)?.text)
    .filter((text): text is string => Boolean(text));

  const handleShare = async () => {
    const shareText = `Hice el test de OrientAI y mi perfil es ${profileText} 🎯 ¡Probalo vos!`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/estudiantes` : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Mi perfil vocacional en OrientAI", text: shareText, url: shareUrl });
      } catch {
        // el estudiante cerró el panel de compartir, no hacemos nada
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareStatus("¡Copiado! Pegalo donde quieras compartirlo.");
    } catch {
      setShareStatus("No pudimos copiar el link, probá de nuevo.");
    }
    setTimeout(() => setShareStatus(null), 2500);
  };

  return (
    <div className={`${styles.viewContainer} ${styles.resultsView}`}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{marginBottom: '2rem'}}>
          <p style={{fontSize: '0.875rem', fontWeight: 'bold', opacity: '0.8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem 0'}}>OrientAI Wrapped</p>
          <h2 style={{fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.2, margin: 0}}>Tu perfil multidisciplinario</h2>
        </div>
        <motion.div className={styles.resultBox} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'center'}}><Target size={60} strokeWidth={1.5} /></div>
          <p style={{fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0'}}>Eres un mix perfecto de:</p>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#fde047', margin: 0}}>{profileText}</h3>
          {reasons.length > 0 && (
            <p style={{fontSize: '0.8rem', opacity: 0.85, marginTop: '0.75rem', lineHeight: 1.4}}>
              Te gustó {reasons.join(" y ")}.
            </p>
          )}
        </motion.div>

        <button
          onClick={handleShare}
          style={{marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'}}
        >
          <Share2 size={16} /> Compartir resultado
        </button>
        {shareStatus && <p style={{fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.85}}>{shareStatus}</p>}
      </div>
      <div style={{paddingBottom: '1rem'}}>
        <button onClick={onContinue} className={styles.btnContinue} style={{backgroundColor: 'white', color: '#1B2A4C', width: '100%'}}>
          Ver carreras compatibles →
        </button>
      </div>
    </div>
  );
}
