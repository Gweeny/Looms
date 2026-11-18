import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { thumbnailUrl } from "@/utils/image";
import { formatRemaining } from "@/utils/time";
import type { Loom } from "@/types/models";

type Props = {
  loom: Loom;
  now: number;
  onPress: () => void;
};

function viewsLabel(views: number): string {
  if (views === 0) return "Pas encore découvert";
  return views === 1 ? "Découvert 1 fois" : `Découvert ${views} fois`;
}

export function LoomRow({ loom, now, onPress }: Props) {
  const remaining = loom.expiresAt.toMillis() - now;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Image
        source={{ uri: thumbnailUrl(loom.photoUrl) }}
        style={styles.thumb}
      />
      <View style={styles.info}>
        <Text style={styles.text} numberOfLines={1}>
          {loom.text || "Sans message"}
        </Text>
        <Text style={styles.hint}>{viewsLabel(loom.views)}</Text>
      </View>
      <Text style={styles.time}>{formatRemaining(remaining)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glints,
    padding: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  info: { flex: 1, gap: 2 },
  text: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 15 },
  hint: { fontFamily: Fonts.regular, color: Colors.textMuted, fontSize: 13 },
  time: { fontFamily: Fonts.semiBold, color: Colors.glints, fontSize: 14 },
});
