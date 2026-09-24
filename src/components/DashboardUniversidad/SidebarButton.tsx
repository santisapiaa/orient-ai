import type { LucideIcon } from "lucide-react";
import styles from "./DashboardUniversidad.module.css";

export default function SidebarButton({
  icon: Icon,
  text,
  active = false,
  disabled = false,
  isPremiumOnly = false,
  onClick,
}: {
  icon: LucideIcon;
  text: string;
  active?: boolean;
  disabled?: boolean;
  isPremiumOnly?: boolean;
  onClick: () => void;
}) {
  const itemClass = `${styles.navItem} ${active ? styles.navItemActive : ""} ${disabled ? styles.navItemDisabled : ""}`;

  return (
    <button
      onClick={onClick}
      className={itemClass}
      style={{ background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", width: "100%", textAlign: "left" }}
    >
      <Icon size={18} />
      <span style={{ fontWeight: "500", fontSize: "0.875rem" }}>{text}</span>
      {isPremiumOnly && <span className={styles.proBadge}>PRO</span>}
    </button>
  );
}
