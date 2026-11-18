import { useMemo } from "react";
import type { Loom } from "@/types/models";

export type MapLoomKind = "mine" | "discovered" | "inRange";
export type MapLoom = { loom: Loom; kind: MapLoomKind; pulsing: boolean };

export function useMapLooms(
  userId: string | undefined,
  looms: Loom[],
  nearby: Loom[],
): MapLoom[] {
  return useMemo(() => {
    if (!userId) return [];
    const inRangeIds = new Set(nearby.map((loom) => loom.id));
    const result: MapLoom[] = [];

    for (const loom of looms) {
      if (loom.authorId === userId) {
        result.push({
          loom,
          kind: "mine",
          pulsing: loom.discoveredBy.length === 0,
        });
      } else if (loom.discoveredBy.includes(userId)) {
        result.push({ loom, kind: "discovered", pulsing: false });
      } else if (inRangeIds.has(loom.id)) {
        result.push({ loom, kind: "inRange", pulsing: true });
      }
    }
    return result;
  }, [userId, looms, nearby]);
}
