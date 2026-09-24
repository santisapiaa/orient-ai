import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UnclaimedUniversity } from "./types";

// Encapsula el estado y la lógica para reclamar una universidad existente
// (sin dueño) o crear una nueva, compartida entre AuthView (todavía sin
// sesión) y ClaimUniversityView (ya logueado, sin universidad asociada).
export function useUniversityLinking() {
  const [unclaimed, setUnclaimed] = useState<UnclaimedUniversity[]>([]);
  const [loadingUnclaimed, setLoadingUnclaimed] = useState(true);
  const [selectedToClaim, setSelectedToClaim] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [newUniName, setNewUniName] = useState("");
  const [newUniCity, setNewUniCity] = useState("");

  const loadUnclaimed = useCallback(async () => {
    setLoadingUnclaimed(true);
    const { data } = await supabase
      .from("universities")
      .select("id, name")
      .is("owner_user_id", null)
      .order("name");
    setUnclaimed(data ?? []);
    setLoadingUnclaimed(false);
  }, []);

  const startCreatingNew = () => setCreatingNew(true);
  const stopCreatingNew = () => setCreatingNew(false);

  // Valida los datos cargados sin llamar a Supabase. Devuelve el mensaje de
  // error a mostrar, o null si está listo para enviarse.
  const validate = (): string | null => {
    if (creatingNew) {
      if (!newUniName.trim() || !newUniCity.trim()) {
        return "Completá el nombre y la ciudad de tu universidad.";
      }
      return null;
    }
    if (!selectedToClaim) {
      return "Elegí qué universidad vas a administrar.";
    }
    return null;
  };

  // Llama al RPC que corresponda (crear o reclamar). Asume que `validate()`
  // ya se ejecutó sin devolver error.
  const linkUniversity = () => {
    return creatingNew
      ? supabase.rpc("create_university", { new_name: newUniName.trim(), new_city: newUniCity.trim() })
      : supabase.rpc("claim_university", { target_id: selectedToClaim });
  };

  return {
    unclaimed,
    loadingUnclaimed,
    loadUnclaimed,
    selectedToClaim,
    setSelectedToClaim,
    creatingNew,
    startCreatingNew,
    stopCreatingNew,
    newUniName,
    setNewUniName,
    newUniCity,
    setNewUniCity,
    validate,
    linkUniversity,
  };
}
