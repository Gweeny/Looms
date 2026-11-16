import type { MapStyleElement } from "react-native-maps";
import { Colors } from "@/constants/colors";

export const MAP_STYLE: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: Colors.background }] },
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: Colors.building }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: Colors.surface }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  { elementType: "labels.text.fill", stylers: [{ color: Colors.textMuted }] },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: Colors.background }],
  },
];
