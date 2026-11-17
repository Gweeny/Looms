import { useMemo } from "react";
import { distanceMeters } from "@/utils/geo";
import type { Loom } from "@/types/models";

type Coords = { latitude: number; longitude: number };

export function useDiscovery(
  position: Coords | null,
  userId: string | undefined,
  looms: Loom[],
  radiusMeters: number,
): Loom[] {
  return useMemo(() => {
    if (!position || !userId) return [];
    return looms
      .map((loom) => ({ loom, distance: distanceMeters(position, loom) }))
      .filter(
        ({ loom, distance }) =>
          loom.authorId !== userId &&
          !loom.discoveredBy.includes(userId) &&
          distance <= radiusMeters,
      )
      .sort((a, b) => a.distance - b.distance)
      .map(({ loom }) => loom);
  }, [position, userId, looms, radiusMeters]);
}
