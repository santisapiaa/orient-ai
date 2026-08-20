"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AppEstudiante.module.css";

// 1. Base de datos simulada de preguntas y categorías
const QUESTIONS = [
  { id: 1, text: "Analizar datos y tendencias económicas", icon: "📈", category: "Negocios" },
  { id: 2, text: "Diseñar interfaces y programar aplicaciones", icon: "💻", category: "Tecnología" },
  { id: 3, text: "Entender el cuerpo humano y curar personas", icon: "🏥", category: "Salud" },
  { id: 4, text: "Gestionar empresas y liderar equipos", icon: "👔", category: "Negocios" },
  { id: 5, text: "Desarrollar inteligencia artificial", icon: "🤖", category: "Tecnología" },
];

// 2. Base de datos simulada ampliada (Múltiples carreras)
const UNIVERSITIES_DB = {
  Negocios: {
    title: "Carreras de Economía y Negocios",
    premium: {
      name: "Universidad Siglo XXI (Premium)",
      careers: [
        { id: "p1", name: "Licenciatura en Economía", duration: "4 años", badge: "Grado" },
        { id: "p2", name: "Tecnicatura en Finanzas", duration: "2 años", badge: "Pregrado" }
      ],
      description: "Aprende economía con casos reales de empresas líderes. Prácticas profesionales desde el primer año.",
      videoText: '"Un día estudiando Economía"',
      author: "@lucas_alumni"
    },
    basic: {
      name: "Universidad Nacional",
      careers: [
        { id: "b1", name: "Contador Público Nacional", duration: "5 años", badge: "Grado" },
        { id: "b2", name: "Lic. en Administración", duration: "5 años", badge: "Grado" }
      ],
      description: "Facultad de Ciencias Económicas. Plan de estudios tradicional enfocado en contabilidad y finanzas corporativas."
    }
  },
  Tecnología: {
    title: "Carreras de Sistemas e Informática",
    premium: {
      name: "Universidad Tecnológica (Premium)",
      careers: [
        { id: "p1", name: "Ingeniería en Software / IA", duration: "5 años", badge: "Grado" },
        { id: "p2", name: "Analista Programador", duration: "3 años", badge: "Pregrado" }
      ],
      description: "Laboratorios de última generación. Convenios directos con Google, Globant y Mercado Libre.",
      videoText: '"Así es el lab de robótica"',
      author: "@sofia_dev"
    },
    basic: {
      name: "Universidad Nacional",
      careers: [
        { id: "b1", name: "Lic. en Ciencias de la Computación", duration: "5 años", badge: "Grado" }
      ],
      description: "Sólida formación matemática y algorítmica para la investigación y desarrollo de software."
    }
  },
  Salud: {
    title: "Carreras de Ciencias Médicas",
    premium: {
      name: "Universidad Privada de Medicina",
      careers: [
        { id: "p1", name: "Medicina General", duration: "6 años", badge: "Grado" },
        { id: "p2", name: "Licenciatura en Enfermería", duration: "4 años", badge: "Grado" }
      ],
      description: "Prácticas en el hospital universitario desde tercer año. Simuladores médicos de realidad virtual.",
      videoText: '"Práctica de sutura en simulación"',
      author: "@medicina_oficial"
    },
    basic: {
      name: "Universidad Nacional",
      careers: [
        { id: "b1", name: "Medicina", duration: "6 años", badge: "Grado" }
      ],
      description: "Formación médica tradicional con fuerte énfasis en salud pública e investigación científica."
    }
  }
};

export default function AppEstudiante() {
  const [activeTab, setActiveTab] = useState<"test" | "results" | "login" | "directory">("test");
  const [userProfile, setUserProfile] = useState<"Negocios" | "Tecnología" | "Salud">("Negocios");
  const [userLocation, setUserLocation] = useState<string>("Tu ciudad");

  const finishTest = (topCategory: "Negocios" | "Tecnología" | "Salud") => {
    setUserProfile(topCategory);
    setActiveTab("results");
  };

  const handleLogin = (location: string) => {
    setUserLocation(location);
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
            <span className={styles.navText}>Universidades</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sub-views ---

function TestView({ onComplete }: { onComplete: (category: any) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leaveX, setLeaveX] = useState(0);
  const [scores, setScores] = useState({ Negocios: 0, Tecnología: 0, Salud: 0 });

  const currentQuestion = QUESTIONS[currentIndex];

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      // LIKE
      const category = currentQuestion.category as keyof typeof scores;
      setScores(prev => ({ ...prev, [category]: prev[category] + 1 }));
      setLeaveX(1000);
      nextCard();
    } else if (info.offset.x < -100) {
      // DISLIKE
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
        // Calcular la categoría ganadora
        let topCategory = "Negocios";
        let maxScore = -1;
        Object.entries(scores).forEach(([cat, score]) => {
          let finalScore = score;
          if (leaveX > 0 && currentQuestion.category === cat) {
             finalScore += 1; 
          }
          if (finalScore > maxScore) {
            maxScore = finalScore;
            topCategory = cat;
          }
        });
        
        if (maxScore === 0) topCategory = "Tecnología"; 
        onComplete(topCategory);
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

      <div style={{position: 'relative', width: '100%', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem'}}>
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
      
      <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center'}}>Arrastra hacia los lados</p>
    </div>
  );
}

function ResultsView({ profile, onContinue }: { profile: string, onContinue: () => void }) {
  let title = "";
  let subtitle = "";
  
  if (profile === "Negocios") {
    title = "Tu cerebro es 80% liderazgo y finanzas";
    subtitle = "Ciencias Económicas y Administración";
  } else if (profile === "Tecnología") {
    title = "Tu cerebro es 90% lógica y código";
    subtitle = "Ingeniería en Sistemas y Software";
  } else if (profile === "Salud") {
    title = "Tu perfil es 100% empatía y ciencia";
    subtitle = "Ciencias Médicas y de la Salud";
  }

  return (
    <div className={`${styles.viewContainer} ${styles.resultsView}`}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{marginBottom: '2rem'}}>
          <p style={{fontSize: '0.875rem', fontWeight: 'bold', opacity: '0.8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem 0'}}>Análisis Completado</p>
          <h2 style={{fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.1, margin: 0}}>{title}</h2>
        </div>

        <motion.div 
          className={styles.resultBox}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <div style={{fontSize: '3.75rem', marginBottom: '1rem'}}>🎯</div>
          <p style={{fontSize: '1.125rem', fontWeight: '500', margin: '0 0 0.5rem 0'}}>Eres un match perfecto para:</p>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#fde047', margin: 0}}>{subtitle}</h3>
        </motion.div>
      </div>

      <div style={{paddingBottom: '1rem'}}>
        <button onClick={onContinue} className={styles.btnContinue} style={{backgroundColor: 'white', color: '#4f46e5', width: '100%'}}>
          Descubrir Universidades Cerca Mío →
        </button>
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: (location: string) => void }) {
  const [location, setLocation] = useState("Mendoza");

  return (
    <div className={`${styles.viewContainer} ${styles.loginView}`}>
      <div style={{marginBottom: '2rem', textAlign: 'center', marginTop: '1rem'}}>
        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📍</div>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.5rem 0'}}>Último paso</h2>
        <p style={{fontSize: '0.875rem', color: '#64748b', margin: 0}}>Crea tu cuenta gratuita para ver qué universidades te ofrecen esta carrera en tu ciudad.</p>
      </div>

      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          onLogin(location); 
        }} 
        style={{flex: 1}}
      >
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Nombre completo</label>
          <input type="text" placeholder="Ej: Juan Pérez" className={styles.inputField} required />
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Correo electrónico o WhatsApp</label>
          <input type="text" placeholder="Ej: +54 9..." className={styles.inputField} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Tu provincia / ciudad</label>
          <select 
            className={styles.inputField} 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Mendoza">Mendoza</option>
            <option value="Rosario">Rosario</option>
            <option value="Otra">Otra</option>
          </select>
        </div>

        <button type="submit" className={styles.btnSubmit}>
          Crear cuenta y ver universidades
        </button>
      </form>
      
      <p style={{fontSize: '0.625rem', textAlign: 'center', color: '#94a3b8', marginTop: '1.5rem'}}>
        Al continuar aceptas los términos y condiciones de OrientAI.
      </p>
    </div>
  );
}

function DirectoryView({ profile, location }: { profile: "Negocios" | "Tecnología" | "Salud", location: string }) {
  const data = UNIVERSITIES_DB[profile];

  const handleSimulatePDF = (careerName: string) => {
    alert(`(Simulación) Descargando Plan de Estudios oficial para: ${careerName} en PDF...`);
  };

  return (
    <div className={styles.viewContainer}>
      <div style={{marginBottom: '1.5rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0'}}>Matches en {location}</h2>
        <p style={{fontSize: '0.875rem', color: '#64748b', margin: 0}}>{data.title}</p>
      </div>

      {/* PREMIUM PROFILE */}
      <div className={styles.premiumProfile}>
        <div style={{position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#3b82f6', color: 'white', fontSize: '0.625rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '9999px', zIndex: 10, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          Recomendado
        </div>
        
        <div className={styles.videoPlaceholder}>
           <div style={{position: 'absolute', inset: 0, backgroundColor: '#1e3a8a', opacity: 0.5}}></div>
           <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'}}>
              <span style={{color: 'white', fontWeight: 'bold', fontSize: '0.875rem'}}>{data.premium.videoText}</span>
              <span style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem'}}>{data.premium.author}</span>
           </div>
           <div style={{width: '3rem', height: '3rem', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
             <div style={{width: 0, height: 0, borderTop: '6px solid transparent', borderLeft: '10px solid white', borderBottom: '6px solid transparent', marginLeft: '4px'}}></div>
           </div>
        </div>

        <div style={{padding: '1.25rem 1rem'}}>
          <div style={{marginBottom: '1rem'}}>
            <h3 style={{fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b', margin: '0 0 0.25rem 0'}}>{data.premium.name}</h3>
            <p style={{fontSize: '0.875rem', color: '#475569', margin: 0}}>{data.premium.description}</p>
          </div>
          
          {/* Lista de Carreras */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem'}}>
            {data.premium.careers.map((career) => (
              <div key={career.id} style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                  <div>
                    <h4 style={{fontSize: '0.875rem', fontWeight: 'bold', color: '#334155', margin: '0 0 0.25rem 0'}}>{career.name}</h4>
                    <span style={{fontSize: '0.625rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold'}}>{career.badge} • {career.duration}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleSimulatePDF(career.name)}
                  style={{fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem'}}
                >
                  📄 Ver Plan de Estudios
                </button>
              </div>
            ))}
          </div>

          <button className={styles.btnWhatsapp}>
            💬 Chatear con Admisiones
          </button>
        </div>
      </div>

      {/* BASIC PROFILE */}
      <div className={styles.basicProfile}>
        <div style={{marginBottom: '0.75rem'}}>
          <h3 style={{fontWeight: 'bold', color: '#334155', margin: '0 0 0.25rem 0', fontSize: '1rem'}}>{data.basic.name}</h3>
          <p style={{fontSize: '0.75rem', color: '#64748b', margin: 0}}>{data.basic.description}</p>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'}}>
          {data.basic.careers.map((career) => (
            <div key={career.id} style={{borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem'}}>
              <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#475569', margin: '0 0 0.25rem 0'}}>{career.name}</h4>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.625rem', color: '#94a3b8'}}>{career.badge} • {career.duration}</span>
                <button 
                  onClick={() => handleSimulatePDF(career.name)}
                  style={{fontSize: '0.625rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
                >
                  Plan PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
