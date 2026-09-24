import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  padding: "0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
  fontSize: "0.875rem",
  width: "100%",
  boxSizing: "border-box",
};

export const CAREER_CATEGORIES = ["Negocios", "Tecnología", "Salud", "Ciencias Sociales", "Arte y Diseño"];

// Paleta categorica validada (skill de dataviz): CVD Delta E >= 9 entre
// series adyacentes y contraste >= 3:1 salvo la serie 3, mitigado con
// leyenda de texto (nunca solo color) — ver validate_palette.js.
export const TREND_COLORS: Record<"impressions" | "clicks" | "leads", string> = {
  impressions: "#2a78d6",
  clicks: "#eb6834",
  leads: "#1baf7a",
};
