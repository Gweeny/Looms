import { MIN_DEPOSIT_DISTANCE_METERS } from "@/constants/looms";
import { distanceMeters } from "@/utils/geo";
import type { Loom } from "@/types/models";

type Coords = { latitude: number; longitude: number };

export function getDepositBlockReason(
  position: Coords,
  userId: string,
  activeLooms: Loom[],
  maxLooms: number,
): string | null {
  const mine = activeLooms.filter((loom) => loom.authorId === userId);
  if (mine.length >= maxLooms) {
    return `Tu as déjà ${maxLooms} looms actifs`;
  }

  const tooClose = activeLooms.some(
    (loom) => distanceMeters(position, loom) < MIN_DEPOSIT_DISTANCE_METERS,
  );
  if (tooClose) {
    return "Trop proche d'un autre loom";
  }

  return null;
}
