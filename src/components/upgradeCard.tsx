import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import type { Upgrade } from "@/constants/shop";

type Props = {
  upgrade: Upgrade;
  level: number;
  glints: number;
  busy: boolean;
  onBuy: () => void;
};

export function UpgradeCard({ upgrade, level, glints, busy, onBuy }: Props) {
  const maxed = level >= upgrade.maxLevel;
  const cost = upgrade.costFor(level);
  const affordable = glints >= cost;
  const canBuy = !maxed && affordable && !busy;

  const hint = maxed
    ? "Niveau maximum atteint"
    : affordable
      ? `${upgrade.gain} pour ${cost} Glints`
      : `Il te manque ${cost - glints} Glints`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={upgrade.icon}
          size={28}
          color={Colors.glints}
        />
        <Text style={styles.title}>{upgrade.title}</Text>
      </View>
      <Text style={styles.text}>
        Actuel : {upgrade.current(level)} (niveau {level}/{upgrade.maxLevel})
      </Text>
      <Text style={styles.hint}>{hint}</Text>
      <TouchableOpacity
        style={[styles.button, !canBuy && styles.buttonDisabled]}
        onPress={onBuy}
        disabled={!canBuy}
      >
        <Text style={styles.buttonText}>{busy ? "Achat…" : "Acheter"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glints,
    padding: 20,
    gap: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 20 },
  text: { fontFamily: Fonts.regular, color: Colors.text, fontSize: 16 },
  hint: { fontFamily: Fonts.regular, color: Colors.textMuted, fontSize: 14 },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 16 },
});
