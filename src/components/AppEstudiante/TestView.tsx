"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import styles from "./AppEstudiante.module.css";
import { QUESTIONS } from "./questions";
import type { LikedItem } from "./types";

const TEST_PROGRESS_KEY = "orientai_test_progress";

export default function TestView({ onComplete }: { onComplete: (categories: string[], likedItems: LikedItem[]) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leaveX, setLeaveX] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    "Negocios": 0, "Tecnología": 0, "Salud": 0, "Ciencias Sociales": 0, "Arte y Diseño": 0
  });
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restaurar el progreso guardado (si lo hay) despues de la hidratacion,
  // para no perder la posicion en el test si el estudiante refresca la
  // pagina a mitad de camino.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TEST_PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof saved.currentIndex === "number") setCurrentIndex(saved.currentIndex);
        if (saved.scores) setScores(saved.scores);
        if (saved.likedItems) setLikedItems(saved.likedItems);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TEST_PROGRESS_KEY, JSON.stringify({ currentIndex, scores, likedItems }));
    } catch {}
  }, [hydrated, currentIndex, scores, likedItems]);

  const currentQuestion = QUESTIONS[currentIndex];

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const liked = info.offset.x > 100;
    const passed = info.offset.x < -100;
    if (!liked && !passed) return;

    setLeaveX(liked ? 1000 : -1000);

    // Se calcula el puntaje actualizado de forma local en vez de leer el
    // estado `scores`, ya que este todavía no se actualizó cuando se
    // procesa la última carta (setState es asíncrono).
    const updatedScores = liked
      ? { ...scores, [currentQuestion.category]: scores[currentQuestion.category] + 1 }
      : scores;
    const updatedLikedItems = liked
      ? [...likedItems, { text: currentQuestion.text, category: currentQuestion.category }]
      : likedItems;

    if (liked) {
      setScores(updatedScores);
      setLikedItems(updatedLikedItems);
    }

    nextCard(updatedScores, updatedLikedItems);
  };

  const nextCard = (finalScores: Record<string, number>, finalLikedItems: LikedItem[]) => {
    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setLeaveX(0);
      } else {
        // Calcular los 2 perfiles con mayor puntaje
        const sortedCategories = Object.entries(finalScores)
          .map(([cat, score]) => ({ cat, score }))
          .sort((a, b) => b.score - a.score);

        // Agarramos las 2 categorías principales que tengan al menos 1 punto
        let topCats = sortedCategories.filter(c => c.score > 0).slice(0, 2).map(c => c.cat);

        // Fallback por si le dio "Paso" a absolutamente todo
        if (topCats.length === 0) topCats = ["Ciencias Sociales", "Negocios"];

        try {
          window.localStorage.removeItem(TEST_PROGRESS_KEY);
        } catch {}

        onComplete(topCats, finalLikedItems);
      }
    }, 200);
  };

  return (
    <div className={`${styles.viewContainer} ${styles.testView}`}>
      <div style={{textAlign: 'center', zIndex: 10}}>
        <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#2AAE8A', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Match Vocacional</span>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1B2A4C', margin: '0.5rem 0 0 0'}}>¿Qué te interesa más?</h2>
        <p style={{fontSize: '0.75rem', color: 'rgba(18, 77, 65, 0.7)', marginTop: '0.25rem'}}>Desliza la tarjeta ({currentIndex + 1}/{QUESTIONS.length})</p>
      </div>

      <div style={{position: 'relative', width: '100%', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem'}}>
        <AnimatePresence>
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              className={styles.card}
              style={{ position: 'absolute' }}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
              exit={{ x: leaveX, opacity: 0, transition: { duration: 0.2 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05, rotate: leaveX ? leaveX / 50 : 0 }}
            >
              <div style={{marginBottom: '1.5rem', pointerEvents: 'none', color: '#1B2A4C', display: 'flex', justifyContent: 'center'}}><currentQuestion.icon size={64} strokeWidth={1.5} /></div>
              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1B2A4C', pointerEvents: 'none'}}>{currentQuestion.text}</h3>

              <div style={{position: 'absolute', bottom: '1.5rem', left: '0', right: '0', display: 'flex', justifyContent: 'space-around', opacity: '0.5', padding: '0 2rem', pointerEvents: 'none'}}>
                <span style={{color: '#ef4444', fontWeight: 'bold', fontSize: '0.875rem'}}>← Paso</span>
                <span style={{color: '#2AAE8A', fontWeight: 'bold', fontSize: '0.875rem'}}>Me Gusta →</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
