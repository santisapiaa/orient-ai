import type { MicroCase } from "./types";

type ScenarioBuilder = (careerName: string) => Omit<MicroCase, "career">;

const MICRO_CASE_SCENARIOS: Record<string, ScenarioBuilder> = {
  "Tecnología": (careerName) => ({
    text: `¡Alerta! La base de datos de tu app acaba de caer en pleno Black Friday. Como profesional en ${careerName}, ¿qué haces primero?`,
    optionA: "Revisar los logs del servidor para encontrar el error raíz.",
    optionB: "Reiniciar todo el sistema perdiendo los últimos 5 minutos de ventas.",
    correct: "A",
    explanation: "En la industria tecnológica real (DevOps/SRE), reiniciar a ciegas puede corromper datos graves. Siempre se aísla el problema leyendo los logs antes de actuar impulsivamente.",
  }),
  "Negocios": (careerName) => ({
    text: `Tu empresa acaba de perder el 20% de sus ventas. Como graduado en ${careerName}, ¿qué estrategia aplicas?`,
    optionA: "Recortar el presupuesto operativo y despedir gente para salvar márgenes.",
    optionB: "Analizar la retención de clientes e invertir en recuperar mercado.",
    correct: "B",
    explanation: "Los líderes modernos saben que 'no se puede achicar hacia el crecimiento'. Las startups exitosas priorizan retener a los clientes actuales antes que entrar en pánico.",
  }),
  "Salud": (careerName) => ({
    text: `Un paciente llega a emergencias con síntomas muy confusos que no encajan en tu diagnóstico inicial. Como profesional de ${careerName}, ¿cómo procedes?`,
    optionA: "Confiar en tu intuición clínica y medicar rápido por si acaso.",
    optionB: "Estabilizar al paciente y pedir una interconsulta médica.",
    correct: "B",
    explanation: "En la medicina moderna, el trabajo interdisciplinario salva vidas. Ningún médico actúa como 'héroe solitario' ante la duda si hay tiempo para estabilizar.",
  }),
  "Arte y Diseño": (careerName) => ({
    text: `El cliente odió tu primera propuesta gráfica y la entrega es mañana. Como experto en ${careerName}, ¿qué haces?`,
    optionA: "Defender tu diseño original explicando la teoría UX detrás de él.",
    optionB: "Amanecerte rediseñando todo desde cero sin preguntar.",
    correct: "A",
    explanation: "En las agencias reales, el 80% del trabajo de diseño es saber comunicar y fundamentar tus decisiones ante el cliente, no solo dibujar.",
  }),
};

const DEFAULT_SCENARIO: ScenarioBuilder = (careerName) => ({
  text: `Te enfrentas a un dilema ético grave en tu lugar de trabajo que involucra a tus superiores. Como profesional de ${careerName}, ¿qué decides?`,
  optionA: "Reportarlo a los canales de compliance de recursos humanos.",
  optionB: "Enfrentar directamente a tus jefes en una reunión pública.",
  correct: "A",
  explanation: "Las grandes corporaciones tienen sistemas de 'Compliance' anónimos y legales para proteger a los empleados de represalias directas.",
});

export function buildMicroCase(careerName: string, category: string): MicroCase {
  const buildScenario = MICRO_CASE_SCENARIOS[category] ?? DEFAULT_SCENARIO;
  return { career: careerName, ...buildScenario(careerName) };
}
