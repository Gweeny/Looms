export const LOOM_DURATIONS = [
  { minutes: 10, glintsPerView: 10 },
  { minutes: 30, glintsPerView: 6 },
  { minutes: 60, glintsPerView: 4 },
  { minutes: 360, glintsPerView: 2 },
  { minutes: 1440, glintsPerView: 1 },
] as const;

export const DISCOVERY_RADIUS_METERS = 10;
export const MAX_ACTIVE_LOOMS = 5;
