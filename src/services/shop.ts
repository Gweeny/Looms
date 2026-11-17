import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MAX_RADIUS_LEVEL, RADIUS_UPGRADE_COST } from "@/constants/looms";

export type PurchaseResult = "ok" | "not_enough_glints" | "max_level";

export async function buyRadiusUpgrade(
  userId: string,
): Promise<PurchaseResult> {
  return runTransaction<PurchaseResult>(
    db,
    async (tx): Promise<PurchaseResult> => {
      const ref = doc(db, "users", userId);
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Profil introuvable");

      const data = snap.data();
      if ((data.radiusLevel ?? 0) >= MAX_RADIUS_LEVEL) return "max_level";
      if ((data.glints ?? 0) < RADIUS_UPGRADE_COST) return "not_enough_glints";

      tx.update(ref, {
        glints: increment(-RADIUS_UPGRADE_COST),
        radiusLevel: increment(1),
      });
      return "ok";
    },
  );
}
