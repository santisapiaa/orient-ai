import Image from "next/image";
import Link from "next/link";
import { Smartphone, GraduationCap, Code2, Hand, Target, Mail, AtSign } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#1B2A4C]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F6F2EA]/90 backdrop-blur-sm border-b border-[#1B2A4C]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image
            src="/logo-horizontal-navy.png"
            alt="OrientAI — Orientación Vocacional"
            width={900}
            height={347}
            priority
            className="h-14 md:h-16 w-auto"
          />
          <nav className="hidden sm:flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/estudiantes"
              className="px-4 py-2 rounded-full border border-[#1B2A4C]/15 hover:bg-[#1B2A4C]/5 transition-colors"
            >
              Soy estudiante
            </Link>
            <Link
              href="/universidades"
              className="px-4 py-2 rounded-full border border-[#1B2A4C]/15 hover:bg-[#1B2A4C]/5 transition-colors"
            >
              Soy universidad
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1B2A4C] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#2AAE8A] mb-4">
              PARA 4TO Y 5TO AÑO
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-balance">
              ¿No sabés qué estudiar? Empezá deslizando.
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-md">
              OrientAI es un test vocacional tipo like/dislike: en minutos descubrís tu perfil
              y te mostramos carreras y universidades reales que matchean con vos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/estudiantes"
                className="inline-flex items-center justify-center gap-2 bg-[#2AAE8A] hover:bg-[#249478] text-white font-bold rounded-xl px-6 py-4 transition-colors"
              >
                <Smartphone size={20} /> Soy estudiante — hacer el test
              </Link>
              <Link
                href="/universidades"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-xl px-6 py-4 transition-colors"
              >
                <GraduationCap size={20} /> Soy universidad
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-64 rounded-[2.5rem] border-[10px] border-white/15 bg-white/5 p-4 shadow-2xl">
              <div className="rounded-2xl bg-white text-[#1B2A4C] p-5 text-center shadow-lg">
                <div className="mb-3 flex justify-center"><Code2 size={40} strokeWidth={1.5} /></div>
                <p className="font-bold text-sm">Diseñar interfaces y programar aplicaciones</p>
                <div className="flex justify-between mt-6 text-xs font-bold opacity-60">
                  <span>← Paso</span>
                  <span>Me Gusta →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">Así de simple</h2>
        <p className="text-center text-[#1B2A4C]/60 max-w-lg mx-auto mb-12">
          Nada de formularios largos ni tests de 100 preguntas. Es un juego de tres pasos.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Hand,
              title: "1. Deslizá tus gustos",
              text: "Like o dislike a situaciones cotidianas, como en cualquier app que ya usás.",
            },
            {
              icon: Target,
              title: "2. Descubrí tu perfil",
              text: "En minutos, un mix de las dos áreas que más te representan: Tecnología, Salud, Negocios y más.",
            },
            {
              icon: GraduationCap,
              title: "3. Matcheá con universidades",
              text: "Carreras y facultades reales, cerca tuyo, con datos de demanda laboral y salario.",
            },
          ].map((step) => (
            <div key={step.title} className="bg-white rounded-2xl border border-[#1B2A4C]/10 p-8 shadow-sm">
              <div className="mb-4 text-[#2AAE8A]"><step.icon size={32} strokeWidth={1.5} /></div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[#1B2A4C]/60 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para universidades */}
      <section className="bg-white border-y border-[#1B2A4C]/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#2AAE8A] mb-4">
              PARA UNIVERSIDADES
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Llegá a estudiantes que todavía están decidiendo.
            </h2>
            <p className="text-[#1B2A4C]/60 mb-8 leading-relaxed">
              Mostrá tus carreras a estudiantes de secundaria que matchean con tu oferta académica,
              sumá videos de alumnos y profesionales, y recibí contactos reales de quienes
              quieren saber más.
            </p>
            <Link
              href="/universidades"
              className="inline-flex items-center gap-2 bg-[#1B2A4C] hover:bg-[#101B33] text-white font-bold rounded-xl px-6 py-3.5 transition-colors"
            >
              Ver el panel de universidad →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Aparecé primero", detail: "en los resultados que ven los estudiantes" },
              { label: "Mostrá videos", detail: "de alumnos y profesionales reales" },
              { label: "Recibí leads", detail: "de estudiantes con interés genuino" },
              { label: "Datos reales", detail: "sobre quién te está buscando" },
            ].map((item) => (
              <div key={item.label} className="bg-[#F6F2EA] rounded-xl p-5">
                <p className="font-bold text-sm text-[#1B2A4C]">{item.label}</p>
                <p className="text-xs text-[#1B2A4C]/60 mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marca */}
      <section className="bg-white border-y border-[#1B2A4C]/10">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Image
            src="/logo-color-stacked.png"
            alt="OrientAI — Orientación Vocacional"
            width={700}
            height={539}
            className="h-40 md:h-48 w-auto mx-auto mb-6"
          />
          <p className="text-[#1B2A4C]/60 leading-relaxed">
            OrientAI existe para que ningún estudiante de secundaria tenga que elegir una carrera a ciegas,
            y para que las universidades encuentren, antes que nadie, a quienes ya las están buscando.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <p className="font-extrabold text-lg text-[#1B2A4C]">OrientAI</p>
            <p className="text-sm text-[#1B2A4C]/50 mt-1 max-w-xs">
              Orientación vocacional para estudiantes de secundaria, con matching real a universidades.
            </p>
          </div>

          <div className="sm:text-right">
            <div className="flex items-center gap-4 sm:justify-end text-sm text-[#1B2A4C]/60">
              <a
                href="mailto:contacto@orientai.com.ar"
                className="flex items-center gap-1.5 hover:text-[#1B2A4C] transition-colors"
              >
                <Mail size={16} /> contacto@orientai.com.ar
              </a>
              <span className="flex items-center gap-1.5">
                <AtSign size={16} /> OrientAI.oficial
              </span>
            </div>
            <p className="text-xs text-[#1B2A4C]/40 mt-3">
              © {new Date().getFullYear()} OrientAI. Hecho en Argentina.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
