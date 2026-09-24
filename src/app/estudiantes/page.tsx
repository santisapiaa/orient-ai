import type { Metadata, Viewport } from "next";
import AppEstudiante from "@/components/AppEstudiante/AppEstudiante";

// El manifest vive en src/app/manifest.ts (Next.js sólo admite un
// manifest.ts por proyecto, en la raíz de `app`), pero el <link
// rel="manifest"> sólo se agrega acá para que la instalación como PWA
// quede acotada a esta sección y no aparezca en el resto del sitio.
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "OrientAI",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4C",
};

export default function StudentPage() {
  return <AppEstudiante />;
}
