import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  MAX_RADIUS_LEVEL,
  MAX_SLOTS_LEVEL,
  RADIUS_STEP_METERS,
  SLOT_UPGRADE_COST,
  ZOOM_UNLOCK_COST,
  detectionRadius,
  maxActiveLooms,
  radiusUpgradeCost,
} from "@/constants/looms";

export type UpgradeId = "radiusLevel" | "slotsLevel" | "zoomLevel";

export type Upgrade = {
  id: UpgradeId;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  costFor: (level: number) => number;
  maxLevel: number;
  current: (level: number) => string;
  gain: string;
};

export const UPGRADES: Upgrade[] = [
  {
    id: "radiusLevel",
    icon: "radar",
    title: "Rayon de détection",
    costFor: radiusUpgradeCost,
    maxLevel: MAX_RADIUS_LEVEL,
    current: (level) => `${detectionRadius(level)} m`,
    gain: `+${RADIUS_STEP_METERS} m`,
  },
  {
    id: "zoomLevel",
    icon: "magnify-plus-outline",
    title: "Zoom sur la carte",
    costFor: () => ZOOM_UNLOCK_COST,
    maxLevel: 1,
    current: (level) => (level >= 1 ? "Débloqué" : "Verrouillé"),
    gain: "Zoom au pincement",
  },
  {
    id: "slotsLevel",
    icon: "map-marker-multiple-outline",
    title: "Looms actifs simultanément",
    costFor: () => SLOT_UPGRADE_COST,
    maxLevel: MAX_SLOTS_LEVEL,
    current: (level) => `${maxActiveLooms(level)} looms`,
    gain: "+1 loom",
  },
];
