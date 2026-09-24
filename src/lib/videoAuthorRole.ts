export type VideoAuthorRole = "profesional" | "egresado" | "alumno_actual";

export function videoAuthorRoleLabel(role: VideoAuthorRole): string {
  if (role === "profesional") return "Profesional";
  if (role === "egresado") return "Ex-alumno/a";
  return "Alumno/a actual";
}
