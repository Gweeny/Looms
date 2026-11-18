import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UPGRADES, type UpgradeId } from "@/constants/shop";

export type PurchaseResult = "ok" | "not_enough_glints" | "max_level";

export async function buyUpgrade(
  userId: string,
  upgradeId: UpgradeId,
): Promise<PurchaseResult> {
  const upgrade = UPGRADES.find((item) => item.id === upgradeId);
  if (!upgrade) throw new Error("Amélioration inconnue");

  return runTransaction<PurchaseResult>(
    db,
    async (tx): Promise<PurchaseResult> => {
      const ref = doc(db, "users", userId);
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Profil introuvable");

      const data = snap.data();
      const level: number = data[upgradeId] ?? 0;
      if (level >= upgrade.maxLevel) return "max_level";

      const cost = upgrade.costFor(level);
      if ((data.glints ?? 0) < cost) return "not_enough_glints";

      tx.update(ref, {
        glints: increment(-cost),
        [upgradeId]: increment(1),
      });
      return "ok";
    },
  );
}
