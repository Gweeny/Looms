import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexte/authContext";
import type { Loom } from "@/types/models";

export function useActiveLooms() {
  const { user } = useAuth();
  const [allLooms, setAllLooms] = useState<Loom[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "looms"),
      (snapshot) => {
        setAllLooms(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Loom),
        );
        setNow(Date.now());
        setLoading(false);
      },
      () => {
        setError("Impossible de charger les looms.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const upcoming = allLooms
      .map((loom) => loom.expiresAt.toMillis())
      .filter((time) => time > Date.now());
    if (upcoming.length === 0) return;

    const delay = Math.max(0, Math.min(...upcoming) - Date.now()) + 500;
    const timer = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [allLooms, now]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  const looms = useMemo(
    () => allLooms.filter((loom) => loom.expiresAt.toMillis() > now),
    [allLooms, now],
  );

  return { looms, loading, error };
}
