import { useEffect, useState } from "react";
import * as Location from "expo-location";

export function useLocation() {
  const [permission, request, refresh] = Location.useForegroundPermissions();
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] =
    useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    if (!permission?.granted) return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5 },
      (location) => {
        setPosition(location.coords);
      },
    )
      .then((created) => {
        if (cancelled) created.remove();
        else subscription = created;
      })
      .catch((err) => {
        setError(err.message);
      });
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [permission?.granted]);

  useEffect(() => {
    if (!permission?.granted) return;

    Location.getCurrentPositionAsync()
      .then((location) => {
        setPosition(location.coords);
      })
      .catch((err) => setError(err.message));
  }, [permission?.granted]);

  return { permission, request, refresh, position, error };
}
