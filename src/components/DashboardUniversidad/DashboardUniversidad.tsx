"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./DashboardUniversidad.module.css";

export default function DashboardUniversidad() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>OrientAI <span style={{fontSize: '0.875rem', color: 'white', fontWeight: 'normal'}}>B2B</span></h1>
          <p className={styles.sidebarSubtitle}>Panel de Universidad</p>
        </div>

        <nav className={styles.sidebarNav}>
          <NavItem active icon="📊" text="Panel General" />
          <NavItem icon="👥" text="Leads Estudiantiles" isPremiumOnly={!isPremium} />
          <NavItem icon="🎥" text="Gestionar Videos" isPremiumOnly={!isPremium} />
          <NavItem icon="⚙️" text="Configurar Perfil" />
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" style={{color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem'}}>
            ← Volver al inicio
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1e293b'}}>Hola, Universidad Siglo XXI</h2>
            <p style={{color: '#64748b', fontSize: '0.875rem', margin: 0}}>Resumen de tu rendimiento de los últimos 30 días.</p>
          </div>
          
          {!isPremium ? (
            <button 
              onClick={() => setIsPremium(true)}
              className={styles.btnPremium}
            >
              <span>⭐</span> Actualizar a Premium
            </button>
          ) : (
            <div className={styles.premiumActive}>
              <span>✅</span> Cuenta Premium Activa
            </div>
          )}
        </header>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard 
            title="Apariciones en Resultados" 
            value="12,450" 
            trend="+15%" 
            subtitle="Veces que tu perfil básico fue visto" 
          />
          <StatCard 
            title="Clicks en Perfil" 
            value="843" 
            trend="+5%" 
            subtitle="Estudiantes interesados en Economía" 
          />
          <StatCard 
            title="Leads de WhatsApp" 
            value={isPremium ? "152" : "Bloqueado"} 
            trend={isPremium ? "+22%" : ""} 
            subtitle="Contactos directos generados" 
            isBlurred={!isPremium}
          />
        </div>

        {/* Main Content Area based on Plan */}
        {!isPremium ? (
          <div className={styles.paywallContainer}>
            <span style={{fontSize: '2.25rem', marginBottom: '1rem', display: 'block'}}>🔒</span>
            <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.5rem 0'}}>Desbloquea tus 843 Leads</h3>
            <p style={{color: '#475569', marginBottom: '2rem'}}>
              Actualmente estás perdiendo estudiantes que buscan tu carrera. Pásate a Premium para mostrar videos, poner tu botón de WhatsApp y acceder a los datos de contacto.
            </p>

            <button 
              onClick={() => setIsPremium(true)}
              style={{backgroundColor: '#0f172a', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer'}}
            >
              Ver Demostración Premium
            </button>
            <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem'}}>(Botón para simular en la presentación)</p>
          </div>
        ) : (
          <div className={styles.dataTableContainer}>
            <div className={styles.tableHeader}>
              <h3 style={{margin: 0, fontWeight: 'bold', color: '#1e293b'}}>Últimos Leads (Estudiantes de Economía)</h3>
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Interés Principal</th>
                  <th>Colegio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{fontWeight: 'bold', color: '#1e293b'}}>Martín L.</td>
                  <td><span style={{backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold'}}>Ciencias Económicas</span></td>
                  <td>Colegio Nacional</td>
                  <td>
                    <button style={{color: '#16a34a', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer'}}>💬 Contactar</button>
                  </td>
                </tr>
                <tr>
                  <td style={{fontWeight: 'bold', color: '#1e293b'}}>Sofía R.</td>
                  <td><span style={{backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold'}}>Contabilidad</span></td>
                  <td>Instituto San José</td>
                  <td>
                    <button style={{color: '#16a34a', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer'}}>💬 Contactar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Helper Components ---

function NavItem({ icon, text, active = false, isPremiumOnly = false }: { icon: string, text: string, active?: boolean, isPremiumOnly?: boolean }) {
  const itemClass = `${styles.navItem} ${active ? styles.navItemActive : ''} ${isPremiumOnly ? styles.navItemDisabled : ''}`;
  
  return (
    <a href="#" className={itemClass}>
      <span>{icon}</span>
      <span style={{fontWeight: '500', fontSize: '0.875rem'}}>{text}</span>
      {isPremiumOnly && <span className={styles.proBadge}>PRO</span>}
    </a>
  );
}

function StatCard({ title, value, trend, subtitle, isBlurred = false }: { title: string, value: string, trend: string, subtitle: string, isBlurred?: boolean }) {
  return (
    <div className={styles.statCard}>
      {isBlurred && (
        <div className={styles.blurredOverlay}>
          <span style={{fontSize: '1.5rem'}}>🔒</span>
          <span style={{fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Premium</span>
        </div>
      )}
      <h3 className={styles.statTitle}>{title}</h3>
      <div className={styles.statValueContainer}>
        <p className={styles.statValue}>{value}</p>
        {trend && <span className={styles.statTrend}>{trend}</span>}
      </div>
      <p className={styles.statSubtitle}>{subtitle}</p>
    </div>
  );
}
