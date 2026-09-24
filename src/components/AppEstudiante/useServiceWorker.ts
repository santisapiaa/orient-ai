"use client";
import { useEffect } from "react";

// Registra el service worker que habilita la instalación como PWA de la
// sección de estudiante, acotado a /estudiantes. No cachea nada (ver
// public/sw.js): sólo expone un fetch handler, que es lo que los
// navegadores basados en Chromium piden para mostrar el prompt de
// "Instalar app".
export function useServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/estudiantes" }).catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);
}
