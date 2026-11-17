import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Colors } from "@/constants/colors";

type Props = {
  latitude: number;
  longitude: number;
};

export function LoomMarker({ latitude, longitude }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.87 }}
    >
      <View style={styles.container}>
        <View style={styles.base} />
        <View style={styles.body} />
        <View style={styles.hole} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: { width: 48, height: 52 },
  base: {
    position: "absolute",
    left: 9,
    top: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.glints,
    transform: [{ scaleY: 0.35 }],
  },
  body: {
    position: "absolute",
    left: 8,
    top: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    backgroundColor: Colors.glints,
    transform: [{ rotate: "45deg" }],
  },
  hole: {
    position: "absolute",
    left: 18,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
});
