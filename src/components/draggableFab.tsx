import type { ComponentProps } from "react";
import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SIZE = 56;
const MARGIN = 16;
const GAP = 12;
const MIN_Y = 100;
const BOTTOM_SPACE = 72;

type Props = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  slot: number;
  onPress: () => void;
};

export function DraggableFab({ icon, slot, onPress }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxY = height - SIZE - BOTTOM_SPACE - insets.bottom;

  const x = useSharedValue(width - SIZE - MARGIN);
  const y = useSharedValue(maxY - slot * (SIZE + GAP));

  const pan = Gesture.Pan()
    .minDistance(8)
    .onChange((event) => {
      x.value += event.changeX;
      y.value += event.changeY;
    })
    .onEnd(() => {
      const toRight = x.value + SIZE / 2 > width / 2;
      x.value = withSpring(toRight ? width - SIZE - MARGIN : MARGIN);
      y.value = withSpring(Math.min(Math.max(y.value, MIN_Y), maxY));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.fab, animatedStyle]}>
        <Pressable style={styles.inner} onPress={onPress}>
          <MaterialCommunityIcons name={icon} size={26} color={Colors.glints} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glints,
  },
  inner: { flex: 1, alignItems: "center", justifyContent: "center" },
});
