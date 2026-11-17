import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { useIsOnline } from "@/hooks/useIsOnline";

export function OfflineBanner() {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <View
      style={[styles.wrapper, { top: insets.top + 60 }]}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={16}
          color={Colors.glints}
        />
        <Text style={styles.text}>Hors connexion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  text: { fontFamily: Fonts.regular, color: Colors.text, fontSize: 13 },
});
