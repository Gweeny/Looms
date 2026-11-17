import { useEffect, useState } from "react";
import { notifyLoomNearby, setupNotifications } from "@/services/notifications";
import { claimUnnotified } from "@/services/notifiedLooms";
import type { Loom } from "@/types/models";

export function useDiscoveryNotification(
  nearby: Loom[],
  userId: string | undefined,
  enabled: boolean,
) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setupNotifications()
      .then((granted) => {
        console.log("notif permission:", granted);
        setAllowed(granted);
      })
      .catch((e) => console.error("notifications:", e));
  }, [enabled]);

  useEffect(() => {
    if (!userId || !allowed || nearby.length === 0) return;
    claimUnnotified(
      userId,
      nearby.map((loom) => loom.id),
    )
      .then((fresh) => {
        console.log("notif:", { nearby: nearby.length, fresh: fresh.length });
        return fresh.length > 0 ? notifyLoomNearby(fresh.length) : undefined;
      })
      .catch((e) => console.error("notification:", e));
  }, [userId, allowed, nearby]);
}
