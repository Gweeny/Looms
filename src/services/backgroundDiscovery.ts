import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { detectionRadius } from "@/constants/looms";
import { notifyLoomNearby, setupNotifications } from "@/services/notifications";
import { claimUnnotified } from "@/services/notifiedLooms";
import { distanceMeters } from "@/utils/geo";
import type { Loom } from "@/types/models";

export const DISCOVERY_TASK = "looms-background-discovery";

TaskManager.defineTask(DISCOVERY_TASK, async ({ data, error }) => {
  if (error) {
    console.error("tâche de fond:", error);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  const last = locations[locations.length - 1];
  if (!last) return;

  try {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return;

    const [loomsSnap, profileSnap] = await Promise.all([
      getDocs(collection(db, "looms")),
      getDoc(doc(db, "users", user.uid)),
    ]);

    const radius = detectionRadius(profileSnap.data()?.radiusLevel ?? 0);
    const now = Date.now();

    const nearbyIds = loomsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Loom)
      .filter(
        (loom) =>
          loom.expiresAt.toMillis() > now &&
          loom.authorId !== user.uid &&
          !loom.discoveredBy.includes(user.uid) &&
          distanceMeters(last.coords, loom) <= radius,
      )
      .map((loom) => loom.id);

    if (nearbyIds.length === 0) return;

    const fresh = await claimUnnotified(user.uid, nearbyIds);
    if (fresh.length > 0) await notifyLoomNearby(fresh.length);
  } catch (e) {
    console.error("tâche de fond:", e);
  }
});

export async function startBackgroundDiscovery(): Promise<void> {
  await setupNotifications();

  if (await Location.hasStartedLocationUpdatesAsync(DISCOVERY_TASK)) return;

  await Location.startLocationUpdatesAsync(DISCOVERY_TASK, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 10,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: "Looms",
      notificationBody: "Looms cherche des messages cachés près de toi.",
    },
  });
}
export async function stopBackgroundDiscovery(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(DISCOVERY_TASK)) {
    await Location.stopLocationUpdatesAsync(DISCOVERY_TASK);
  }
}
