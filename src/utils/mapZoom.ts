import { BASE_DETECTION_RADIUS_METERS } from "@/constants/looms";

export const CAMERA_PITCH = 40;
export const CAMERA_ZOOM = 18.5;

const ZOOM_OUT_MARGIN = 1.5;
const ZOOM_IN_MARGIN = 0.5;
const ZOOM_OUT_FACTOR = 0.6;

export function zoomForRadius(radius: number): number {
  return (
    CAMERA_ZOOM -
    ZOOM_OUT_FACTOR * Math.log2(radius / BASE_DETECTION_RADIUS_METERS)
  );
}
export function zoomLimits(radius: number) {
  return {
    min: zoomForRadius(radius) - ZOOM_OUT_MARGIN,
    max: CAMERA_ZOOM + ZOOM_IN_MARGIN,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
