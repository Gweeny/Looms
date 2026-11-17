import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import {
  MAX_RADIUS_LEVEL,
  RADIUS_STEP_METERS,
  RADIUS_UPGRADE_COST,
  detectionRadius,
} from "@/constants/looms";
import { useAuth } from "@/contexte/authContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { buyRadiusUpgrade } from "@/services/shop";

export function ShopScreen() {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile(user?.uid);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onBuy() {
    if (!user || buying) return;
    try {
      setBuying(true);
      setMessage(null);
      const result = await buyRadiusUpgrade(user.uid);
      if (result === "max_level") setMessage("Niveau maximum atteint.");
      if (result === "not_enough_glints")
        setMessage("Tu n'as pas assez de Glints.");
      if (result === "ok") setMessage("Rayon agrandi !");
    } catch (e) {
      console.error("achat:", e);
      setMessage("Achat impossible. Vérifie ta connexion.");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.glints} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? "Profil introuvable."}</Text>
      </View>
    );
  }

  const maxed = profile.radiusLevel >= MAX_RADIUS_LEVEL;
  const canBuy = !maxed && profile.glints >= RADIUS_UPGRADE_COST && !buying;

  return (
    <View style={styles.container}>
      <View style={styles.balance}>
        <MaterialCommunityIcons
          name="star-four-points-outline"
          size={28}
          color={Colors.glints}
        />
        <Text style={styles.balanceText}>{profile.glints} Glints</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rayon de détection</Text>
        <Text style={styles.text}>
          Actuel : {detectionRadius(profile.radiusLevel)} m (niveau{" "}
          {profile.radiusLevel}/{MAX_RADIUS_LEVEL})
        </Text>
        <Text style={styles.hint}>
          {maxed
            ? "Tu as atteint le niveau maximum."
            : `+${RADIUS_STEP_METERS} m pour ${RADIUS_UPGRADE_COST} Glints`}
        </Text>
        <TouchableOpacity
          style={[styles.button, !canBuy && styles.buttonDisabled]}
          onPress={onBuy}
          disabled={!canBuy}
        >
          <Text style={styles.buttonText}>{buying ? "Achat…" : "Acheter"}</Text>
        </TouchableOpacity>
        {message ? <Text style={styles.hint}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    gap: 24,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  balance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  balanceText: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glints,
    padding: 20,
    gap: 10,
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 20,
  },
  text: {
    fontFamily: Fonts.regular,
    color: Colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  hint: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
});
