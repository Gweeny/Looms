import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "discovery";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Looms à portée",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function notifyLoomNearby(count: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Un loom est tout près",
      body:
        count > 1
          ? `${count} looms sont cachés autour de toi. Ouvre Looms pour les découvrir.`
          : "Ouvre Looms pour le découvrir.",
    },
    trigger: Platform.OS === "android" ? { channelId: CHANNEL_ID } : null,
  });
}
