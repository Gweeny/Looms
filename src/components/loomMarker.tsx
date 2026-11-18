import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Colors } from "@/constants/colors";

type Props = {
  latitude: number;
  longitude: number;
  color?: string;
  onPress?: () => void;
};

export function LoomMarker({
  latitude,
  longitude,
  color = Colors.glints,
  onPress,
}: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, [color]);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.703 }}
      onPress={onPress}
    >
      <View style={styles.container}>
        <View style={[styles.base, { borderColor: color }]} />
        <View style={[styles.body, { backgroundColor: color }]} />
        <View style={styles.hole} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: { width: 96, height: 64 },
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
