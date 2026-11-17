import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";

type Props = {
  amount: number | null;
};

export function GlintsReward({ amount }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (amount === null) return;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 1800,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(progress);
  }, [amount, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -180]) },
      { scale: interpolate(progress.value, [0, 0.2, 1], [0.6, 1.15, 1]) },
    ],
  }));

  if (amount === null) return null;

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="none"
    >
      <Text style={styles.text}>
        +{amount} Glint{amount > 1 ? "s" : ""}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 160,
    alignItems: "center",
  },
  text: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 34,
  },
});
