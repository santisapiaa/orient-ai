import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "OrientAI — Orientación Vocacional";
const description = "Test vocacional tipo like/dislike para estudiantes de secundaria, con matching real a carreras y universidades.";

// TODO: cambiar a "https://orientai.com.ar" una vez que el DNS del
// dominio propio esté propagado (hoy no resuelve). Mientras tanto, si
// esto apunta al dominio custom pero ese dominio no responde, la
// imagen de preview social (og:image) no carga en nada compartido
// desde la URL real de Vercel.
export const metadata: Metadata = {
  metadataBase: new URL("https://orient-ai-phi.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "OrientAI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OrientAI — Orientación Vocacional" }],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
