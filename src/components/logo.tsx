import { Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";

type Props = {
  size?: number;
};

export function LoomsLogo({ size = 36 }: Props) {
  return <Text style={[styles.logo, { fontSize: size }]}>Looms</Text>;
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: Fonts.fredokaBold,
    color: Colors.glints,
    textAlign: "center",
    includeFontPadding: false,
  },
});
