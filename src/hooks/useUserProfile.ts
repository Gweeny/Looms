import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser } from "@/types/models";

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(null);
    setLoading(true);
    if (!userId) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            id: snap.id,
            ...data,
            radiusLevel: data.radiusLevel ?? 0,
          } as AppUser);
        }
        setLoading(false);
      },
      () => {
        setError("Profil indisponible.");
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [userId]);

  return { profile, loading, error };
}
