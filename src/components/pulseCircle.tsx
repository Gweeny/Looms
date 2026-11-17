import { useEffect, useState } from "react";
import { Circle } from "react-native-maps";
import { Colors } from "@/constants/colors";

const MIN_RADIUS = 2;
const MAX_RADIUS = 14;
const PERIOD_MS = 1600;
const FRAME_MS = 50;

type Props = {
  latitude: number;
  longitude: number;
};

function toHex(alpha: number) {
  return Math.round(255 * alpha)
    .toString(16)
    .padStart(2, "0");
}

export function PulseCircle({ latitude, longitude }: Props) {
  const [t, setT] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setT(((Date.now() - start) % PERIOD_MS) / PERIOD_MS);
    }, FRAME_MS);
    return () => clearInterval(timer);
  }, []);

  const eased = 1 - (1 - t) ** 2;
  const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * eased;
  const fade = 1 - t;

  return (
    <Circle
      center={{ latitude, longitude }}
      radius={radius}
      strokeWidth={2}
      strokeColor={`${Colors.glints}${toHex(0.8 * fade)}`}
      fillColor={`${Colors.glints}${toHex(0.25 * fade)}`}
    />
  );
}
