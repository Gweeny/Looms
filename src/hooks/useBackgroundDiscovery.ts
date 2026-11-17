import { useEffect } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { startBackgroundDiscovery } from "@/services/backgroundDiscovery";

export function useBackgroundDiscovery(foregroundGranted: boolean) {
  useEffect(() => {
    if (!foregroundGranted) return;
    let cancelled = false;

    async function run() {
      const background = await Location.getBackgroundPermissionsAsync();

      if (background.granted) {
        await startBackgroundDiscovery();
        return;
      }
      if (!background.canAskAgain || cancelled) return;

      Alert.alert(
        "Détection en arrière-plan",
        "Pour te prévenir quand un loom est près de toi, même app fermée, Looms doit accéder à ta position tout le temps. Choisis « Toujours autoriser » dans l'écran suivant.",
        [
          { text: "Plus tard", style: "cancel" },
          {
            text: "Continuer",
            onPress: async () => {
              const asked = await Location.requestBackgroundPermissionsAsync();
              if (asked.granted) await startBackgroundDiscovery();
            },
          },
        ],
      );
    }

    run().catch((e) => console.error("détection en arrière-plan:", e));
    return () => {
      cancelled = true;
    };
  }, [foregroundGranted]);
}
