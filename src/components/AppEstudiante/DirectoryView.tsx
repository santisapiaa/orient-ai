"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, MessageCircle, SearchX, X as XIcon, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import { videoAuthorRoleLabel } from "@/lib/videoAuthorRole";
import styles from "./AppEstudiante.module.css";
import { buildMicroCase } from "./microCaseScenarios";
import type { Career, MicroCase, University } from "./types";

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

export default function DirectoryView({ profile, location }: { profile: string[], location: string }) {
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

        // Registramos una "aparición" por cada universidad que efectivamente
        // se le mostró al estudiante en sus resultados (no bloqueante: si
        // falla, no le rompe la experiencia al estudiante).
        if (data.length > 0) {
          supabase
            .from('university_events')
            .insert(data.map((uni) => ({ university_id: uni.id, event_type: 'impression' })))
            .then(({ error: eventError }) => {
              if (eventError) console.error('No se pudo registrar la aparición:', eventError.message);
            });
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [profile, location]);

  const openMicroCase = (universityId: string, careerName: string, category: string) => {
    supabase
      .from('university_events')
      .insert([{ university_id: universityId, event_type: 'click' }])
      .then(({ error: eventError }) => {
        if (eventError) console.error('No se pudo registrar el click:', eventError.message);
      });

    setCaseResult(null);
    setActiveCase(buildMicroCase(careerName, category));
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
                      <b>{video.author_name}</b> · {videoAuthorRoleLabel(video.author_role)}
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
                  <button onClick={() => openMicroCase(uni.id, career.name, career.category)} style={{display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontWeight: 'bold', color: 'white', backgroundColor: '#2AAE8A', padding: '0.25rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer'}}>
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
