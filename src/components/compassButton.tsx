import { StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

type Props = {
  heading: number;
  onPress: () => void;
};

export function CompassButton({ heading, onPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.button, { top: insets.top + 8 }]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name="navigation-outline"
        size={26}
        color={Colors.glints}
        style={{ transform: [{ rotate: `${-heading}deg` }] }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glints,
    alignItems: "center",
    justifyContent: "center",
  },
});
