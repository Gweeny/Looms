import { arrayUnion, doc, increment, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DISCOVERER_REWARD, LOOM_DURATIONS } from "@/constants/looms";
import type { Loom } from "@/types/models";

export async function discoverLoom(
  loomId: string,
  userId: string,
): Promise<Loom | null> {
  return runTransaction<Loom | null>(db, async (tx): Promise<Loom | null> => {
    const loomRef = doc(db, "looms", loomId);
    const snap = await tx.get(loomRef);
    if (!snap.exists()) {
      return null;
    }

    const loom = { id: snap.id, ...snap.data() } as Loom;
    const expired = loom.expiresAt.toMillis() <= Date.now();
    if (
      expired ||
      loom.authorId === userId ||
      loom.discoveredBy.includes(userId)
    ) {
      return null;
    }

    const creatorReward =
      LOOM_DURATIONS.find((d) => d.minutes === loom.durationMinutes)
        ?.glintsPerView ?? 0;

    tx.update(loomRef, {
      views: increment(1),
      discoveredBy: arrayUnion(userId),
    });
    tx.update(doc(db, "users", loom.authorId), {
      glints: increment(creatorReward),
      totalViews: increment(1),
    });
    tx.update(doc(db, "users", userId), {
      glints: increment(DISCOVERER_REWARD),
      loomsDiscovered: increment(1),
    });

    return {
      ...loom,
      views: loom.views + 1,
      discoveredBy: [...loom.discoveredBy, userId],
    };
  });
}
