"use client";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import { videoAuthorRoleLabel } from "@/lib/videoAuthorRole";
import styles from "./DashboardUniversidad.module.css";
import { inputStyle } from "./constants";
import type { VideoRow } from "./types";

export default function VideosPanel({ universityId }: { universityId: string }) {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState<VideoRow["author_role"]>("alumno_actual");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setLoading(true);
      const { data } = await supabase
        .from("university_videos")
        .select("id, video_url, author_name, author_role, caption")
        .eq("university_id", universityId)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setVideos(data ?? []);
        setLoading(false);
      }
    }

    loadVideos();
    return () => {
      cancelled = true;
    };
  }, [universityId, reloadKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: insertError } = await supabase.from("university_videos").insert([
      { university_id: universityId, video_url: videoUrl, author_name: authorName, author_role: authorRole, caption: caption || null },
    ]);

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setVideoUrl("");
    setAuthorName("");
    setCaption("");
    setReloadKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("university_videos").delete().eq("id", id);
    setReloadKey((k) => k + 1);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Gestionar Videos</h2>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Pegá un link de YouTube, Instagram o Drive de un profesional, ex-alumno o alumno actual recomendando una carrera. Se muestran en la app a los estudiantes que matcheen con tu universidad.
      </p>

      <form onSubmit={handleSubmit} className={styles.dataTableContainer} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input id="video-url" required type="url" placeholder="Link del video (YouTube, Instagram, Drive...)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={inputStyle} />
        <input id="video-author" required placeholder="Nombre de quien habla (ej. Sofía Gómez)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} style={inputStyle} />
        <select id="video-role" value={authorRole} onChange={(e) => setAuthorRole(e.target.value as VideoRow["author_role"])} style={inputStyle}>
          <option value="alumno_actual">Alumno/a actual</option>
          <option value="egresado">Ex-alumno/a</option>
          <option value="profesional">Profesional</option>
        </select>
        <input id="video-caption" placeholder="Bajada opcional (ej. '2do año de Ingeniería')" value={caption} onChange={(e) => setCaption(e.target.value)} style={inputStyle} />

        {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{ backgroundColor: "#2AAE8A", color: "white", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "+ Agregar video"}
        </button>
      </form>

      {loading ? (
        <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
          <Spinner size={16} color="#64748b" /> Cargando videos...
        </p>
      ) : videos.length === 0 ? (
        <p style={{ color: "#64748b" }}>Todavía no cargaste ningún video.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {videos.map((v) => (
            <div key={v.id} className={styles.statCard} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b", fontSize: "0.875rem" }}>
                  {v.author_name} · <span style={{ fontWeight: "normal", color: "#64748b" }}>{videoAuthorRoleLabel(v.author_role)}</span>
                </p>
                <a href={v.video_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2AAE8A", wordBreak: "break-all" }}>
                  {v.video_url}
                </a>
              </div>
              <button onClick={() => handleDelete(v.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
