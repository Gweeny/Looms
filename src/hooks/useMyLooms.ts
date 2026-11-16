import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexte/authContext";
import type { Loom } from "@/types/models";

export function useMyLooms() {
  const { user } = useAuth();
  const [looms, setLooms] = useState<Loom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "looms"), where("authorId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        const active = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Loom)
          .filter((loom) => loom.expiresAt.toMillis() > now);
        setLooms(active);
        setLoading(false);
      },
      () => {
        setError("Failed to fetch looms.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  return { looms, loading, error };
}
