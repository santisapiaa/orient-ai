"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";
import AuthenticatedDashboard from "./AuthenticatedDashboard";
import AuthView from "./AuthView";
import FullScreenMessage from "./FullScreenMessage";

export default function DashboardUniversidad() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <FullScreenMessage>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Spinner size={20} color="#64748b" /> Cargando...
        </span>
      </FullScreenMessage>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <AuthenticatedDashboard
      userId={session.user.id}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}
