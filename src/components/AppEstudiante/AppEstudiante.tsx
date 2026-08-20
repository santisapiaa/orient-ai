"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./AppEstudiante.module.css";

// 1. Ampliamos las preguntas a 10 para hacer el test más específico
const QUESTIONS = [
  { id: 1, text: "Analizar datos financieros y mercado bursátil", icon: "📈", category: "Negocios" },
  { id: 2, text: "Diseñar interfaces y programar aplicaciones", icon: "💻", category: "Tecnología" },
  { id: 3, text: "Entender el cuerpo humano y curar enfermedades", icon: "🏥", category: "Salud" },
  { id: 4, text: "Debatir sobre leyes, política y sociedad", icon: "⚖️", category: "Ciencias Sociales" },
  { id: 5, text: "Crear espacios, dibujar y diseñar marcas", icon: "🎨", category: "Arte y Diseño" },
  { id: 6, text: "Liderar equipos de trabajo y emprender", icon: "👔", category: "Negocios" },
  { id: 7, text: "Desarrollar inteligencia artificial y robótica", icon: "🤖", category: "Tecnología" },
  { id: 8, text: "Investigar terapias y bienestar mental", icon: "🧠", category: "Salud" },
  { id: 9, text: "Escribir artículos y comunicar noticias", icon: "📰", category: "Ciencias Sociales" },
  { id: 10, text: "Dirigir cine, fotografía o componer música", icon: "🎬", category: "Arte y Diseño" },
];

export default function AppEstudiante() {
  const [activeTab, setActiveTab] = useState<"test" | "results" | "login" | "directory">("test");
  const [userProfile, setUserProfile] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<string>("Buenos Aires");

  const finishTest = (topCategories: string[]) => {
    setUserProfile(topCategories);
    setActiveTab("results");
  };

  const handleLogin = async (location: string, name: string, contact: string) => {
    setUserLocation(location);
    await supabase.from('leads').insert([
      { full_name: name, contact_info: contact, location: location, matched_category: userProfile.join(" + ") }
    ]);
    setActiveTab("directory");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mobileFrame}>
        <div className={styles.notch}></div>

        <div className={styles.header}>
          <h1 className={styles.headerTitle}>OrientAI</h1>
          <Link href="/" className={styles.headerLink}>Salir</Link>
        </div>

        <div className={styles.contentArea}>
          {activeTab === "test" && <TestView onComplete={finishTest} />}
          {activeTab === "results" && <ResultsView profile={userProfile} onContinue={() => setActiveTab("login")} />}
          {activeTab === "login" && <LoginView onLogin={handleLogin} />}
          {activeTab === "directory" && <DirectoryView profile={userProfile} location={userLocation} />}
        </div>

        <div className={styles.bottomNav}>
          <button onClick={() => setActiveTab("test")} className={`${styles.navButton} ${activeTab === "test" ? styles.navButtonActive : ""}`}>
            <div className={styles.navIcon}>🎮</div>
            <span className={styles.navText}>Test</span>
          </button>
          <button onClick={() => setActiveTab("results")} className={`${styles.navButton} ${activeTab === "results" ? styles.navButtonActive : ""}`}>
            <div className={styles.navIcon}>📊</div>
            <span className={styles.navText}>Mi Perfil</span>
          </button>
          <button onClick={() => setActiveTab("directory")} className={`${styles.navButton} ${activeTab === "directory" || activeTab === "login" ? styles.navButtonActive : ""}`}>
            <div className={styles.navIcon}>🏛️</div>
            <span className={styles.navText}>Opciones</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sub-views ---

function TestView({ onComplete }: { onComplete: (categories: string[]) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leaveX, setLeaveX] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ 
    "Negocios": 0, "Tecnología": 0, "Salud": 0, "Ciencias Sociales": 0, "Arte y Diseño": 0 
  });

  const currentQuestion = QUESTIONS[currentIndex];

  const handleDragEnd = (event: any, info: any) => {
    // Si se desliza a la derecha (Me Gusta) sumamos 1 punto
    if (info.offset.x > 100) {
      const category = currentQuestion.category;
      setScores(prev => ({ ...prev, [category]: prev[category] + 1 }));
      setLeaveX(1000);
      nextCard();
    } 
    // Si se desliza a la izquierda (Paso) no sumamos nada
    else if (info.offset.x < -100) {
      setLeaveX(-1000);
      nextCard();
    }
  };

  const nextCard = () => {
    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setLeaveX(0);
      } else {
        // 2. Nueva lógica: Calcular los 2 perfiles con mayor puntaje
        const finalScores = { ...scores };
        
        // Si la última carta fue un like, se lo sumamos a los puntajes finales
        if (leaveX > 0) {
          finalScores[currentQuestion.category] += 1;
        }

        const sortedCategories = Object.entries(finalScores)
          .map(([cat, score]) => ({ cat, score }))
          .sort((a, b) => b.score - a.score);
        
        // Agarramos las 2 categorías principales que tengan al menos 1 punto
        let topCats = sortedCategories.filter(c => c.score > 0).slice(0, 2).map(c => c.cat);
        
        // Fallback por si le dio "Paso" a absolutamente todo
        if (topCats.length === 0) topCats = ["Ciencias Sociales", "Negocios"];
        
        onComplete(topCats);
      }
    }, 200);
  };

  return (
    <div className={`${styles.viewContainer} ${styles.testView}`}>
      <div style={{textAlign: 'center', zIndex: 10}}>
        <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Match Vocacional</span>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0.5rem 0 0 0'}}>¿Qué te interesa más?</h2>
        <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem'}}>Desliza la tarjeta ({currentIndex + 1}/{QUESTIONS.length})</p>
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
              <div style={{fontSize: '4rem', marginBottom: '1.5rem', pointerEvents: 'none'}}>{currentQuestion.icon}</div>
              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', pointerEvents: 'none'}}>{currentQuestion.text}</h3>
              
              <div style={{position: 'absolute', bottom: '1.5rem', left: '0', right: '0', display: 'flex', justifyContent: 'space-around', opacity: '0.5', padding: '0 2rem', pointerEvents: 'none'}}>
                <span style={{color: '#ef4444', fontWeight: 'bold', fontSize: '0.875rem'}}>← Paso</span>
                <span style={{color: '#22c55e', fontWeight: 'bold', fontSize: '0.875rem'}}>Me Gusta →</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultsView({ profile, onContinue }: { profile: string[], onContinue: () => void }) {
  const profileText = profile.join(" y ");

  return (
    <div className={`${styles.viewContainer} ${styles.resultsView}`}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{marginBottom: '2rem'}}>
          <p style={{fontSize: '0.875rem', fontWeight: 'bold', opacity: '0.8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem 0'}}>OrientAI Wrapped</p>
          <h2 style={{fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.2, margin: 0}}>Tu perfil multidisciplinario</h2>
        </div>
        <motion.div className={styles.resultBox} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <div style={{fontSize: '3.75rem', marginBottom: '1rem'}}>🎯</div>
          <p style={{fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0'}}>Eres un mix perfecto de:</p>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#fde047', margin: 0}}>{profileText}</h3>
        </motion.div>
      </div>
      <div style={{paddingBottom: '1rem'}}>
        <button onClick={onContinue} className={styles.btnContinue} style={{backgroundColor: 'white', color: '#4f46e5', width: '100%'}}>
          Ver carreras compatibles →
        </button>
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: (location: string, name: string, contact: string) => void }) {
  const [location, setLocation] = useState("Buenos Aires");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className={`${styles.viewContainer} ${styles.loginView}`}>
      <div style={{marginBottom: '2rem', textAlign: 'center', marginTop: '1rem'}}>
        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📍</div>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.5rem 0'}}>Último paso</h2>
        <p style={{fontSize: '0.875rem', color: '#64748b', margin: 0}}>Crea tu cuenta para ver qué universidades te ofrecen este mix de carreras.</p>
      </div>

      <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onLogin(location, name, contact); }} style={{flex: 1}}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Nombre completo</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className={styles.inputField} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Correo electrónico o WhatsApp</label>
          <input type="text" required value={contact} onChange={e => setContact(e.target.value)} className={styles.inputField} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Tu provincia / ciudad</label>
          <select className={styles.inputField} value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="Buenos Aires">Buenos Aires / CABA</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Mendoza">Mendoza</option>
          </select>
        </div>
        <button type="submit" className={styles.btnSubmit} disabled={loading}>
          {loading ? "Cargando..." : "Crear cuenta y ver universidades"}
        </button>
      </form>
    </div>
  );
}

function DirectoryView({ profile, location }: { profile: string[], location: string }) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const searchLocation = location.includes("Buenos Aires") ? "Buenos Aires" : location;

      // 3. Nueva consulta: Buscamos carreras que estén DENTRO de la lista de categorías del usuario
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, city, is_premium, description, video_text, author_handle, careers!inner(id, name, category, duration, badge)')
        .ilike('city', '%' + searchLocation + '%')
        .in('careers.category', profile); 
      
      if (!error && data) {
        setUniversities(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile, location]);

  const handleSimulatePDF = (careerName: string) => {
    alert('(Simulación) Descargando Plan de Estudios oficial para: ' + careerName + ' en PDF...');
  };

  if (loading) {
    return <div className={styles.viewContainer} style={{justifyContent: 'center', alignItems: 'center'}}>Buscando matches en la base de datos...</div>;
  }

  if (universities.length === 0) {
    return <div className={styles.viewContainer} style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <span style={{fontSize: '3rem', marginBottom: '1rem'}}>😢</span>
      <h3 style={{fontWeight: 'bold', color: '#1e293b'}}>No hay resultados</h3>
      <p style={{fontSize: '0.875rem', color: '#64748b'}}>Aún no hemos cargado universidades en tu zona para estas categorías.</p>
    </div>;
  }

  return (
    <div className={styles.viewContainer}>
      <div style={{marginBottom: '1.5rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0'}}>Matches en {location}</h2>
        <p style={{fontSize: '0.875rem', color: '#64748b', margin: 0}}>Mix: {profile.join(" + ")}</p>
      </div>

      {universities.map(uni => (
        <div key={uni.id} className={styles.basicProfile} style={{marginBottom: '1rem', position: 'relative', border: '2px solid #3b82f6'}}>
          
          <div style={{marginBottom: '0.75rem'}}>
            <h3 style={{fontWeight: 'bold', color: '#334155', margin: '0 0 0.25rem 0', fontSize: '1rem'}}>{uni.name}</h3>
            {uni.description && <p style={{fontSize: '0.75rem', color: '#64748b', margin: 0}}>{uni.description}</p>}
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'}}>
            {uni.careers.map((career: any) => (
              <div key={career.id} style={{borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem'}}>
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#475569', margin: '0 0 0.25rem 0'}}>{career.name}</h4>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <button onClick={() => handleSimulatePDF(career.name)} style={{fontSize: '0.625rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>
                    Ver Plan de Estudios (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className={styles.btnWhatsapp} style={{marginTop: '0.5rem'}}>
            💬 Contactar Admisiones
          </button>
        </div>
      ))}
    </div>
  );
}
