"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  TrendingUp,
  Code2,
  HeartPulse,
  Scale,
  Palette,
  Users as UsersIcon,
  Bot,
  Brain,
  Newspaper,
  Clapperboard,
  ClipboardList,
  UserRound,
  Landmark,
  Target,
  SearchX,
  MessageCircle,
  X as XIcon,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import styles from "./AppEstudiante.module.css";

type Career = {
  id: string;
  name: string;
  category: string;
  duration: string;
  badge: string;
  market_demand: string | null;
  avg_salary: string | null;
  work_mode: string | null;
  study_plan_url: string | null;
};

type UniversityVideo = {
  id: string;
  video_url: string;
  author_name: string;
  author_role: "profesional" | "egresado" | "alumno_actual";
  caption: string | null;
};

type University = {
  id: string;
  name: string;
  city: string;
  is_premium: boolean;
  description: string | null;
  video_text: string | null;
  author_handle: string | null;
  careers: Career[];
  university_videos: UniversityVideo[];
};

type MicroCase = {
  career: string;
  text: string;
  optionA: string;
  optionB: string;
  correct: "A" | "B";
  explanation: string;
};

// 1. Ampliamos las preguntas a 10 para hacer el test más específico
const QUESTIONS: { id: number; text: string; icon: LucideIcon; category: string }[] = [
  { id: 1, text: "Analizar datos financieros y mercado bursátil", icon: TrendingUp, category: "Negocios" },
  { id: 2, text: "Diseñar interfaces y programar aplicaciones", icon: Code2, category: "Tecnología" },
  { id: 3, text: "Entender el cuerpo humano y curar enfermedades", icon: HeartPulse, category: "Salud" },
  { id: 4, text: "Debatir sobre leyes, política y sociedad", icon: Scale, category: "Ciencias Sociales" },
  { id: 5, text: "Crear espacios, dibujar y diseñar marcas", icon: Palette, category: "Arte y Diseño" },
  { id: 6, text: "Liderar equipos de trabajo y emprender", icon: UsersIcon, category: "Negocios" },
  { id: 7, text: "Desarrollar inteligencia artificial y robótica", icon: Bot, category: "Tecnología" },
  { id: 8, text: "Investigar terapias y bienestar mental", icon: Brain, category: "Salud" },
  { id: 9, text: "Escribir artículos y comunicar noticias", icon: Newspaper, category: "Ciencias Sociales" },
  { id: 10, text: "Dirigir cine, fotografía o componer música", icon: Clapperboard, category: "Arte y Diseño" },
];

const FLOW_STORAGE_KEY = "orientai_student_flow";

export default function AppEstudiante() {
  const [activeTab, setActiveTab] = useState<"test" | "results" | "location" | "directory">("test");
  const [userProfile, setUserProfile] = useState<string[]>([]);
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
        if (saved.userLocation) setUserLocation(saved.userLocation);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ activeTab, userProfile, userLocation }));
    } catch {}
  }, [hydrated, activeTab, userProfile, userLocation]);

  const finishTest = (topCategories: string[]) => {
    setUserProfile(topCategories);
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

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }
    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (url.pathname.startsWith("/embed/")) return rawUrl;
    }
  } catch {
    return null;
  }
  return null;
}

function videoRoleLabel(role: UniversityVideo["author_role"]) {
  if (role === "profesional") return "Profesional";
  if (role === "egresado") return "Ex-alumno/a";
  return "Alumno/a actual";
}

// --- Sub-views ---

const TEST_PROGRESS_KEY = "orientai_test_progress";

function TestView({ onComplete }: { onComplete: (categories: string[]) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leaveX, setLeaveX] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    "Negocios": 0, "Tecnología": 0, "Salud": 0, "Ciencias Sociales": 0, "Arte y Diseño": 0
  });
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
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TEST_PROGRESS_KEY, JSON.stringify({ currentIndex, scores }));
    } catch {}
  }, [hydrated, currentIndex, scores]);

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

    if (liked) setScores(updatedScores);

    nextCard(updatedScores);
  };

  const nextCard = (finalScores: Record<string, number>) => {
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

        onComplete(topCats);
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
          <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'center'}}><Target size={60} strokeWidth={1.5} /></div>
          <p style={{fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0'}}>Eres un mix perfecto de:</p>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#fde047', margin: 0}}>{profileText}</h3>
        </motion.div>
      </div>
      <div style={{paddingBottom: '1rem'}}>
        <button onClick={onContinue} className={styles.btnContinue} style={{backgroundColor: 'white', color: '#1B2A4C', width: '100%'}}>
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
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1B2A4C', margin: '0 0 0.25rem 0'}}>¿De qué provincia sos?</h2>
        <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.7)', margin: 0}}>Tocá el mapa para buscar universidades 100% anónimas.</p>
      </div>

      <div style={{flex: 1, width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {loading ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#1B2A4C', fontWeight: 'bold', fontSize: '1.25rem'}}>
            <Spinner size={28} color="#1B2A4C" />
            Buscando...
          </div>
        ) : (
          <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '-1rem'}}>
            <Argentina
              type="select-single"
              size={200}
              mapColor="#E9ECF3"
              strokeColor="#2AAE8A"
              strokeWidth={1}
              hoverColor="#2AAE8A"
              selectColor="#1B2A4C"
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
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<MicroCase | null>(null);
  const [caseResult, setCaseResult] = useState<'A' | 'B' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [contactingId, setContactingId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const contactAdmissions = async (uni: University) => {
    setContactingId(uni.id);
    const { error } = await supabase.from('leads').insert([
      {
        full_name: "Estudiante Anónimo",
        contact_info: "Sin registro",
        location,
        matched_category: profile.join(" + "),
        university_id: uni.id,
      },
    ]);
    setContactingId(null);

    if (error) {
      console.error('No se pudo registrar el lead de WhatsApp:', error.message);
      showToast('No pudimos enviar tu contacto. Probá de nuevo.');
      return;
    }
    showToast(`¡Listo! ${uni.name} va a contactarte por WhatsApp.`);
  };

  const downloadStudyPlan = (career: Career) => {
    if (!career.study_plan_url) {
      showToast(`${career.name} todavía no cargó su plan de estudios.`);
      return;
    }
    window.open(career.study_plan_url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    async function fetchData() {
      const searchLocation = location.includes("Buenos Aires") ? "Buenos Aires" : location;

      const { data, error } = await supabase
        .from('universities')
        .select('id, name, city, is_premium, description, video_text, author_handle, careers!inner(id, name, category, duration, badge, market_demand, avg_salary, work_mode, study_plan_url), university_videos(id, video_url, author_name, author_role, caption)')
        .ilike('city', '%' + searchLocation + '%')
        .in('careers.category', profile)
        // Las universidades Premium aparecen primero en los resultados.
        .order('is_premium', { ascending: false });

      if (!error && data) {
        setUniversities(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile, location]);

  const openMicroCase = (careerName: string, category: string) => {
    setCaseResult(null);
    let scenario: Omit<MicroCase, "career"> = { text: "", optionA: "", optionB: "", correct: "A", explanation: "" };
    
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
    return (
      <div className={styles.viewContainer} style={{justifyContent: 'center', alignItems: 'center', gap: '0.75rem', color: '#1B2A4C'}}>
        <Spinner size={28} color="#1B2A4C" />
        Buscando matches en la base de datos...
      </div>
    );
  }

  if (universities.length === 0) {
    return <div className={styles.viewContainer} style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <span style={{marginBottom: '1rem', color: '#1B2A4C', opacity: 0.5}}><SearchX size={48} strokeWidth={1.5} /></span>
      <h3 style={{fontWeight: 'bold', color: '#1B2A4C'}}>No hay resultados</h3>
      <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.7)'}}>Aún no hemos cargado universidades en tu zona para estas categorías.</p>
    </div>;
  }

  return (
    <div className={styles.viewContainer} style={{padding: '1rem'}}>
      <div style={{marginBottom: '1rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1B2A4C', margin: '0 0 0.25rem 0'}}>Matches en {location}</h2>
        <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.7)', margin: 0}}>Mix: {profile.join(" + ")}</p>
      </div>

      {universities.map(uni => (
        <div key={uni.id} className={styles.basicProfile} style={{marginBottom: '1rem', position: 'relative', border: '2px solid #2AAE8A', padding: '1rem'}}>
          
          <div style={{marginBottom: '0.75rem'}}>
            <h3 style={{fontWeight: 'bold', color: '#1B2A4C', margin: '0 0 0.25rem 0', fontSize: '1rem'}}>{uni.name}</h3>
            {uni.description && <p style={{fontSize: '0.75rem', color: 'rgba(18, 77, 65, 0.7)', margin: 0}}>{uni.description}</p>}
          </div>

          {uni.is_premium && uni.university_videos.length > 0 && (
            <div style={{marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {uni.university_videos.map((video) => {
                const embedUrl = getYouTubeEmbedUrl(video.video_url);
                return (
                  <div key={video.id} style={{backgroundColor: '#F4F5F9', borderRadius: '0.75rem', padding: '0.5rem', border: '1px solid #E2E5EE'}}>
                    {embedUrl ? (
                      <div style={{position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem'}}>
                        <iframe
                          src={embedUrl}
                          title={`Video de ${video.author_name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none'}}
                        />
                      </div>
                    ) : (
                      <a href={video.video_url} target="_blank" rel="noreferrer" style={{display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#2AAE8A', marginBottom: '0.5rem'}}>
                        ▶ Ver video (se abre en otra pestaña)
                      </a>
                    )}
                    <p style={{fontSize: '0.7rem', color: '#1B2A4C', margin: 0}}>
                      <b>{video.author_name}</b> · {videoRoleLabel(video.author_role)}
                      {video.caption && <span style={{opacity: 0.7}}> — {video.caption}</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
            {uni.careers.map((career) => {
              return (
              <div key={career.id} style={{borderTop: '1px solid #E2E5EE', paddingTop: '0.75rem'}}>
                <h4 style={{fontSize: '0.875rem', fontWeight: '800', color: '#1B2A4C', margin: '0 0 0.5rem 0'}}>{career.name}</h4>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#1B2A4C', backgroundColor: '#F4F5F9', padding: '0.5rem', borderRadius: '0.5rem'}}>
                  <div><span style={{opacity: 0.7}}>Demanda:</span> <b>{career.market_demand || 'Evaluando...'}</b></div>
                  <div><span style={{opacity: 0.7}}>Modalidad:</span> <b>{career.work_mode || 'A definir'}</b></div>
                  <div style={{gridColumn: '1 / -1'}}><span style={{opacity: 0.7}}>Salario Promedio Inicial:</span> <b>{career.avg_salary || 'A consultar'}</b></div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem'}}>
                  <button onClick={() => openMicroCase(career.name, career.category)} style={{display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontWeight: 'bold', color: 'white', backgroundColor: '#2AAE8A', padding: '0.25rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer'}}>
                    <Bot size={12} /> Micro-Caso AI
                  </button>
                  <button onClick={() => downloadStudyPlan(career)} style={{fontSize: '0.65rem', color: 'rgba(18, 77, 65, 0.7)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>
                    Plan de Estudios
                  </button>
                </div>
              </div>
            )})}
          </div>

          <button
            className={styles.btnWhatsapp}
            style={{marginTop: '0.5rem', opacity: contactingId === uni.id ? 0.7 : 1}}
            disabled={contactingId === uni.id}
            onClick={() => contactAdmissions(uni)}
          >
            <MessageCircle size={16} /> {contactingId === uni.id ? 'Enviando...' : 'Contactar Admisiones'}
          </button>
        </div>
      ))}

      {toast && (
        <div style={{position: 'fixed', bottom: '5.5rem', left: '1rem', right: '1rem', backgroundColor: '#1B2A4C', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', zIndex: 200, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'}}>
          {toast}
        </div>
      )}

      {/* MODAL MICRO-CASO */}
      {activeCase && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 77, 65, 0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
          <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} style={{backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '4px solid #2AAE8A', width: '100%', position: 'relative'}}>
            
            <button
              onClick={() => setActiveCase(null)}
              style={{position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', display: 'flex'}}
              aria-label="Cerrar"
            >
              <XIcon size={20} />
            </button>

            <div style={{marginBottom: '0.5rem', color: '#2AAE8A'}}><Bot size={32} strokeWidth={1.5} /></div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1B2A4C', margin: '0 0 1rem 0'}}>Simulador OrientAI</h3>
            
            {!caseResult ? (
              <>
                <p style={{fontSize: '0.875rem', color: '#1B2A4C', whiteSpace: 'pre-line', lineHeight: 1.5, marginBottom: '1.5rem'}}>
                  {activeCase.text}
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <button onClick={() => setCaseResult('A')} style={{textAlign: 'left', padding: '0.75rem', backgroundColor: '#F4F5F9', color: '#1B2A4C', border: '1px solid #E2E5EE', borderRadius: '0.75rem', fontSize: '0.875rem', cursor: 'pointer'}}>
                    <b>A)</b> {activeCase.optionA}
                  </button>
                  <button onClick={() => setCaseResult('B')} style={{textAlign: 'left', padding: '0.75rem', backgroundColor: '#F4F5F9', color: '#1B2A4C', border: '1px solid #E2E5EE', borderRadius: '0.75rem', fontSize: '0.875rem', cursor: 'pointer'}}>
                    <b>B)</b> {activeCase.optionB}
                  </button>
                </div>
              </>
            ) : (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: caseResult === activeCase.correct ? '#16a34a' : '#dc2626'}}>
                  {caseResult === activeCase.correct ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                </div>
                <h4 style={{textAlign: 'center', color: caseResult === activeCase.correct ? '#16a34a' : '#dc2626', marginBottom: '1rem'}}>
                  {caseResult === activeCase.correct ? '¡Decisión Correcta!' : 'Eso no salió muy bien...'}
                </h4>
                <p style={{fontSize: '0.875rem', color: 'rgba(18, 77, 65, 0.8)', lineHeight: 1.5, marginBottom: '1.5rem', backgroundColor: '#F4F5F9', padding: '1rem', borderRadius: '0.5rem'}}>
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
