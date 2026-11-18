import { useMemo } from "react";
import { useAuth } from "@/contexte/authContext";
import { useActiveLooms } from "@/hooks/useActiveLooms";

export function useMyActiveLooms() {
  const { user } = useAuth();
  const { looms, loading, error } = useActiveLooms();

  const mine = useMemo(
    () =>
      looms
        .filter((loom) => loom.authorId === user?.uid)
        .sort((a, b) => a.expiresAt.toMillis() - b.expiresAt.toMillis()),
    [looms, user?.uid],
  );

  return { looms: mine, loading, error };
}
