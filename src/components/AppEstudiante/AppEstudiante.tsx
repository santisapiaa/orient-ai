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
  const [activeTab, setActiveTab] = useState<"test" | "results" | "location" | "directory">("test");
  const [userProfile, setUserProfile] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<string>("Buenos Aires");

  const finishTest = (topCategories: string[]) => {
    setUserProfile(topCategories);
    setActiveTab("results");
  };

  const handleLocationSubmit = async (location: string) => {
    setUserLocation(location);
    // Registro anónimo para el dashboard de las universidades
    await supabase.from('leads').insert([
      { full_name: "Estudiante Anónimo", contact_info: "Sin registro", location: location, matched_category: userProfile.join(" + ") }
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
          {activeTab === "results" && <ResultsView profile={userProfile} onContinue={() => setActiveTab("location")} />}
          {activeTab === "location" && <LocationView onSubmit={handleLocationSubmit} />}
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
          <button onClick={() => setActiveTab("directory")} className={`${styles.navButton} ${activeTab === "directory" || activeTab === "location" ? styles.navButtonActive : ""}`}>
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
        <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#2AAE8A', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Match Vocacional</span>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#124D41', margin: '0.5rem 0 0 0'}}>¿Qué te interesa más?</h2>
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
              <div style={{fontSize: '4rem', marginBottom: '1.5rem', pointerEvents: 'none'}}>{currentQuestion.icon}</div>
              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#124D41', pointerEvents: 'none'}}>{currentQuestion.text}</h3>
              
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
        <button onClick={onContinue} className={styles.btnContinue} style={{backgroundColor: 'white', color: '#124D41', width: '100%'}}>
          Ver carreras compatibles →
        </button>
      </div>
    </div>
  );
}

import Argentina from "@react-map/argentina";

function LocationView({ onSubmit }: { onSubmit: (location: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleProvinceClick = async (provinceName: string | null) => {
    if (!provinceName) return;
    setLoading(true);
    let normalized = provinceName;
    if (normalized.includes("Buenos Aires")) normalized = "Buenos Aires";
    await onSubmit(normalized);
  };

  return (
    <div className={`${styles.viewContainer} ${styles.loginView}`} style={{padding: '0 1rem'}}>
      <div style={{marginBottom: '0.5rem', textAlign: 'center', marginTop: '1rem'}}>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#124D41', margin: '0 0 0.25rem 0'}}>¿De qué provincia sos?</h2>
        <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.7)', margin: 0}}>Tocá el mapa para buscar universidades 100% anónimas.</p>
      </div>

      <div style={{flex: 1, width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {loading ? (
          <div style={{color: '#124D41', fontWeight: 'bold', fontSize: '1.25rem'}}>
            Buscando...
          </div>
        ) : (
          <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '-1rem'}}>
            <Argentina
              type="select-single"
              size={200}
              mapColor="#E2FAF1"
              strokeColor="#2AAE8A"
              strokeWidth={1}
              hoverColor="#2AAE8A"
              selectColor="#124D41"
              hints={true}
              onSelect={handleProvinceClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DirectoryView({ profile, location }: { profile: string[], location: string }) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<any>(null);
  const [caseResult, setCaseResult] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    async function fetchData() {
      const searchLocation = location.includes("Buenos Aires") ? "Buenos Aires" : location;

      const { data, error } = await supabase
        .from('universities')
        .select('id, name, city, is_premium, description, video_text, author_handle, careers!inner(id, name, category, duration, badge, market_demand, avg_salary, work_mode)')
        .ilike('city', '%' + searchLocation + '%')
        .in('careers.category', profile); 
      
      if (!error && data) {
        setUniversities(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile, location]);

  const openMicroCase = (careerName: string, category: string) => {
    setCaseResult(null);
    let scenario = { text: "", optionA: "", optionB: "", correct: "", explanation: "" };
    
    if(category === "Tecnología") {
      scenario = {
        text: `¡Alerta! La base de datos de tu app acaba de caer en pleno Black Friday. Como profesional en ${careerName}, ¿qué haces primero?`,
        optionA: "Revisar los logs del servidor para encontrar el error raíz.",
        optionB: "Reiniciar todo el sistema perdiendo los últimos 5 minutos de ventas.",
        correct: "A",
        explanation: "En la industria tecnológica real (DevOps/SRE), reiniciar a ciegas puede corromper datos graves. Siempre se aísla el problema leyendo los logs antes de actuar impulsivamente."
      };
    } else if(category === "Negocios") {
      scenario = {
        text: `Tu empresa acaba de perder el 20% de sus ventas. Como graduado en ${careerName}, ¿qué estrategia aplicas?`,
        optionA: "Recortar el presupuesto operativo y despedir gente para salvar márgenes.",
        optionB: "Analizar la retención de clientes e invertir en recuperar mercado.",
        correct: "B",
        explanation: "Los líderes modernos saben que 'no se puede achicar hacia el crecimiento'. Las startups exitosas priorizan retener a los clientes actuales antes que entrar en pánico."
      };
    } else if(category === "Salud") {
      scenario = {
        text: `Un paciente llega a emergencias con síntomas muy confusos que no encajan en tu diagnóstico inicial. Como profesional de ${careerName}, ¿cómo procedes?`,
        optionA: "Confiar en tu intuición clínica y medicar rápido por si acaso.",
        optionB: "Estabilizar al paciente y pedir una interconsulta médica.",
        correct: "B",
        explanation: "En la medicina moderna, el trabajo interdisciplinario salva vidas. Ningún médico actúa como 'héroe solitario' ante la duda si hay tiempo para estabilizar."
      };
    } else if(category === "Arte y Diseño") {
      scenario = {
        text: `El cliente odió tu primera propuesta gráfica y la entrega es mañana. Como experto en ${careerName}, ¿qué haces?`,
        optionA: "Defender tu diseño original explicando la teoría UX detrás de él.",
        optionB: "Amanecerte rediseñando todo desde cero sin preguntar.",
        correct: "A",
        explanation: "En las agencias reales, el 80% del trabajo de diseño es saber comunicar y fundamentar tus decisiones ante el cliente, no solo dibujar."
      };
    } else {
      scenario = {
        text: `Te enfrentas a un dilema ético grave en tu lugar de trabajo que involucra a tus superiores. Como profesional de ${careerName}, ¿qué decides?`,
        optionA: "Reportarlo a los canales de compliance de recursos humanos.",
        optionB: "Enfrentar directamente a tus jefes en una reunión pública.",
        correct: "A",
        explanation: "Las grandes corporaciones tienen sistemas de 'Compliance' anónimos y legales para proteger a los empleados de represalias directas."
      };
    }
    
    setActiveCase({ career: careerName, ...scenario });
  };

  if (loading) {
    return <div className={styles.viewContainer} style={{justifyContent: 'center', alignItems: 'center'}}>Buscando matches en la base de datos...</div>;
  }

  if (universities.length === 0) {
    return <div className={styles.viewContainer} style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <span style={{fontSize: '3rem', marginBottom: '1rem'}}>😢</span>
      <h3 style={{fontWeight: 'bold', color: '#124D41'}}>No hay resultados</h3>
      <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.7)'}}>Aún no hemos cargado universidades en tu zona para estas categorías.</p>
    </div>;
  }

  return (
    <div className={styles.viewContainer} style={{padding: '1rem'}}>
      <div style={{marginBottom: '1rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#124D41', margin: '0 0 0.25rem 0'}}>Matches en {location}</h2>
        <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.7)', margin: 0}}>Mix: {profile.join(" + ")}</p>
      </div>

      {universities.map(uni => (
        <div key={uni.id} className={styles.basicProfile} style={{marginBottom: '1rem', position: 'relative', border: '2px solid #2AAE8A', padding: '1rem'}}>
          
          <div style={{marginBottom: '0.75rem'}}>
            <h3 style={{fontWeight: 'bold', color: '#124D41', margin: '0 0 0.25rem 0', fontSize: '1rem'}}>{uni.name}</h3>
            {uni.description && <p style={{fontSize: '0.75rem', color: 'rgba(18, 77, 65, 0.7)', margin: 0}}>{uni.description}</p>}
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
            {uni.careers.map((career: any) => {
              return (
              <div key={career.id} style={{borderTop: '1px solid #CFF7EA', paddingTop: '0.75rem'}}>
                <h4 style={{fontSize: '0.875rem', fontWeight: '800', color: '#124D41', margin: '0 0 0.5rem 0'}}>{career.name}</h4>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#124D41', backgroundColor: '#F2FFFB', padding: '0.5rem', borderRadius: '0.5rem'}}>
                  <div><span style={{opacity: 0.7}}>Demanda:</span> <b>{career.market_demand || 'Evaluando...'}</b></div>
                  <div><span style={{opacity: 0.7}}>Modalidad:</span> <b>{career.work_mode || 'A definir'}</b></div>
                  <div style={{gridColumn: '1 / -1'}}><span style={{opacity: 0.7}}>Salario Promedio Inicial:</span> <b>{career.avg_salary || 'A consultar'}</b></div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem'}}>
                  <button onClick={() => openMicroCase(career.name, career.category)} style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'white', backgroundColor: '#2AAE8A', padding: '0.25rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer'}}>
                    🤖 Micro-Caso AI
                  </button>
                  <button onClick={() => alert('Descargando PDF...')} style={{fontSize: '0.65rem', color: 'rgba(18, 77, 65, 0.7)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>
                    Plan de Estudios
                  </button>
                </div>
              </div>
            )})}
          </div>

          <button className={styles.btnWhatsapp} style={{marginTop: '0.5rem'}}>
            💬 Contactar Admisiones
          </button>
        </div>
      ))}

      {/* MODAL MICRO-CASO */}
      {activeCase && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 77, 65, 0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
          <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} style={{backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '4px solid #2AAE8A', width: '100%', position: 'relative'}}>
            
            <button 
              onClick={() => setActiveCase(null)} 
              style={{position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem'}}
              aria-label="Cerrar"
            >
              ✖
            </button>

            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🤖</div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#124D41', margin: '0 0 1rem 0'}}>Simulador OrientAI</h3>
            
            {!caseResult ? (
              <>
                <p style={{fontSize: '0.875rem', color: '#124D41', whiteSpace: 'pre-line', lineHeight: 1.5, marginBottom: '1.5rem'}}>
                  {activeCase.text}
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <button onClick={() => setCaseResult('A')} style={{textAlign: 'left', padding: '0.75rem', backgroundColor: '#F2FFFB', color: '#124D41', border: '1px solid #CFF7EA', borderRadius: '0.75rem', fontSize: '0.875rem', cursor: 'pointer'}}>
                    <b>A)</b> {activeCase.optionA}
                  </button>
                  <button onClick={() => setCaseResult('B')} style={{textAlign: 'left', padding: '0.75rem', backgroundColor: '#F2FFFB', color: '#124D41', border: '1px solid #CFF7EA', borderRadius: '0.75rem', fontSize: '0.875rem', cursor: 'pointer'}}>
                    <b>B)</b> {activeCase.optionB}
                  </button>
                </div>
              </>
            ) : (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
                <div style={{fontSize: '3rem', textAlign: 'center', marginBottom: '1rem'}}>
                  {caseResult === activeCase.correct ? '✅' : '❌'}
                </div>
                <h4 style={{textAlign: 'center', color: caseResult === activeCase.correct ? '#16a34a' : '#dc2626', marginBottom: '1rem'}}>
                  {caseResult === activeCase.correct ? '¡Decisión Correcta!' : 'Eso no salió muy bien...'}
                </h4>
                <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.8)', lineHeight: 1.5, marginBottom: '1.5rem', backgroundColor: '#F2FFFB', padding: '1rem', borderRadius: '0.5rem'}}>
                  <b>En la realidad de las empresas:</b><br/><br/>
                  {activeCase.explanation}
                </p>
                <button onClick={() => setActiveCase(null)} style={{width: '100%', padding: '0.75rem', backgroundColor: '#2AAE8A', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer'}}>
                  Entendido
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
