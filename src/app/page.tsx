import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">OrientAI</h1>
          <p className="text-slate-500 mt-2">Maqueta del Modelo de Negocio</p>
        </div>

        <div className="space-y-4">
          <Link href="/estudiantes" className="block w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
            📱 Ver Vista de Estudiante
            <span className="block text-sm font-normal opacity-80 mt-1">Simulación de la App (Mobile)</span>
          </Link>

          <Link href="/universidades" className="block w-full py-4 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-all">
            💻 Ver Vista de Universidad
            <span className="block text-sm font-normal opacity-80 mt-1">Dashboard B2B (Desktop)</span>
          </Link>
        </div>

        <div className="text-sm text-slate-400 mt-8 pt-4 border-t border-slate-100">
          Selecciona una de las vistas para interactuar con la maqueta.
        </div>
      </div>
    </div>
  );
}
