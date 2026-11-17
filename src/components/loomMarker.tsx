import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

type Props = {
  latitude: number;
  longitude: number;
  color?: string;
  pulsing?: boolean;
  onPress?: () => void;
};

export function LoomMarker({
  latitude,
  longitude,
  color = Colors.glints,
  pulsing = false,
  onPress,
}: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const progress = useSharedValue(0);

  useEffect(() => {
    setTracksViewChanges(true);
    if (pulsing) return;
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, [pulsing, color]);

  useEffect(() => {
    if (!pulsing) return;
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [pulsing, progress]);

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - progress.value),
    transform: [
      { scaleX: 1 + progress.value * 1.2 },
      { scaleY: 0.35 * (1 + progress.value * 1.2) },
    ],
  }));

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.703 }}
      onPress={onPress}
    >
      <View style={styles.container}>
        {pulsing ? (
          <Animated.View
            style={[styles.ripple, { borderColor: color }, rippleStyle]}
          />
        ) : null}
        <View style={[styles.base, { borderColor: color }]} />
        <View style={[styles.body, { backgroundColor: color }]} />
        <View style={styles.hole} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: { width: 96, height: 64 },
  ripple: {
    position: "absolute",
    left: 33,
    top: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  base: {
    position: "absolute",
    left: 33,
    top: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    transform: [{ scaleY: 0.35 }],
  },
  body: {
    position: "absolute",
    left: 32,
    top: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    transform: [{ rotate: "45deg" }],
  },
  hole: {
    position: "absolute",
    left: 42,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
});
