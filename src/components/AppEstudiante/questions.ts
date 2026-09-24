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
  type LucideIcon,
} from "lucide-react";

// 1. Ampliamos las preguntas a 10 para hacer el test más específico
export const QUESTIONS: { id: number; text: string; icon: LucideIcon; category: string }[] = [
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
