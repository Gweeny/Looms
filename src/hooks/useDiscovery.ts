import { useMemo } from "react";
import { DISCOVERY_RADIUS_METERS } from "@/constants/looms";
import { distanceMeters } from "@/utils/geo";
import type { Loom } from "@/types/models";

type Coords = { latitude: number; longitude: number };

export function useDiscovery(
  position: Coords | null,
  userId: string | undefined,
  looms: Loom[],
): Loom[] {
  return useMemo(() => {
    if (!position || !userId) return [];
    return looms
      .filter(
        (loom) =>
          loom.authorId !== userId &&
          loom.durationMinutes > 0 &&
          loom.latitude !== undefined &&
          loom.longitude !== undefined &&
          loom.latitude !== null &&
          loom.longitude !== null &&
          distanceMeters(position, loom) <= DISCOVERY_RADIUS_METERS,
      )
      .sort(
        (a, b) => distanceMeters(position, a) - distanceMeters(position, b),
      );
  }, [position, userId, looms]);
}
