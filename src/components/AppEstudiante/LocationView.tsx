"use client";
import { useState } from "react";
import Argentina from "@react-map/argentina";
import Spinner from "@/components/Spinner";
import styles from "./AppEstudiante.module.css";

export default function LocationView({ onSubmit }: { onSubmit: (location: string) => void }) {
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
