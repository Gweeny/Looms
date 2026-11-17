import { useCallback } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { FontAssets } from "./src/constants/typography";
import { Navigation } from "./src/navigation";
import { AuthProvider } from "@/contexte/authContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/services/backgroundDiscovery";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts(FontAssets);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
