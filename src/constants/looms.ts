export const LOOM_DURATIONS = [
  { minutes: 10, label: "10 min", glintsPerView: 10 },
  { minutes: 30, label: "30 min", glintsPerView: 6 },
  { minutes: 60, label: "1 h", glintsPerView: 4 },
  { minutes: 360, label: "6 h", glintsPerView: 2 },
  { minutes: 1440, label: "24 h", glintsPerView: 1 },
] as const;

export const BASE_DETECTION_RADIUS_METERS = 25;
export const MIN_DEPOSIT_DISTANCE_METERS = BASE_DETECTION_RADIUS_METERS;
export const RADIUS_STEP_METERS = 10;
export const RADIUS_UPGRADE_COST = 100;
export const MAX_RADIUS_LEVEL = 3;

export function detectionRadius(level: number): number {
  return BASE_DETECTION_RADIUS_METERS + level * RADIUS_STEP_METERS;
}
export const MAX_ACTIVE_LOOMS = 5;
export const DISCOVERER_REWARD = 1;
