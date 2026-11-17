import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

const SIZE = 72;

type Props = {
  onPress: () => void;
};

export function DropButton({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.8 }],
  }));

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + 32 }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.halo, haloStyle]} />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Déposer un loom"
      >
        <MaterialCommunityIcons name="plus" size={36} color={Colors.glints} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: SIZE,
  },
  halo: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.glints,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.glints,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.94 }] },
});
