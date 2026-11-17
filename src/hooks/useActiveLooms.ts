import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexte/authContext";
import type { Loom } from "@/types/models";

export function useActiveLooms() {
  const { user } = useAuth();
  const [looms, setLooms] = useState<Loom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "looms"),
      (snapshot) => {
        const now = Date.now();
        const active = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Loom)
          .filter((loom) => loom.expiresAt.toMillis() > now);
        setLooms(active);
        setLoading(false);
      },
      (error) => {
        setError("Failed to fetch active looms " + error.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  return { looms, loading, error };
}
