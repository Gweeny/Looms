import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { PASSWORD_RULES } from "@/utils/password";

type Props = {
  password: string;
};

export function PasswordChecklist({ password }: Props) {
  return (
    <View style={styles.container}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        const color = ok
          ? Colors.glints
          : password.length > 0
            ? Colors.error
            : Colors.textMuted;
        return (
          <View key={rule.id} style={styles.row}>
            <MaterialCommunityIcons
              name={ok ? "check-circle-outline" : "close-circle-outline"}
              size={18}
              color={color}
            />
            <Text style={[styles.label, { color }]}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontFamily: Fonts.regular, fontSize: 13 },
});
