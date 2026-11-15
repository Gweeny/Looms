import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";

export function useExitConfirmation() {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert(
          "Quitter Looms",
          "Voulez-vous vraiment quitter l'application ?",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Quitter",
              style: "destructive",
              onPress: () => BackHandler.exitApp(),
            },
          ],
        );
        return true;
      },
    );

    return () => subscription.remove();
  }, []);
}
