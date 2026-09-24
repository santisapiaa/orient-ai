import { Lock } from "lucide-react";
import styles from "./DashboardUniversidad.module.css";

export default function StatCard({ title, value, trend, subtitle, isBlurred = false }: { title: string; value: string; trend: string; subtitle: string; isBlurred?: boolean }) {
  return (
    <div className={styles.statCard}>
      {isBlurred && (
        <div className={styles.blurredOverlay}>
          <Lock size={24} />
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" }}>Premium</span>
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
