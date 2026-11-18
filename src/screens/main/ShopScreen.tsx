import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { UPGRADES, type UpgradeId } from "@/constants/shop";
import { UpgradeCard } from "@/components/upgradeCard";
import { useAuth } from "@/contexte/authContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { buyUpgrade, type PurchaseResult } from "@/services/shop";

const MESSAGES: Record<PurchaseResult, string> = {
  ok: "Amélioration achetée !",
  not_enough_glints: "Tu n'as pas assez de Glints.",
  max_level: "Niveau maximum atteint.",
};

export function ShopScreen() {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile(user?.uid);
  const [buying, setBuying] = useState<UpgradeId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onBuy(id: UpgradeId) {
    if (!user || buying) return;
    try {
      setBuying(id);
      setMessage(null);
      setMessage(MESSAGES[await buyUpgrade(user.uid, id)]);
    } catch (e) {
      console.error("achat:", e);
      setMessage("Achat impossible. Vérifie ta connexion.");
    } finally {
      setBuying(null);
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

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.balance}>
        <MaterialCommunityIcons
          name="star-four-points-outline"
          size={28}
          color={Colors.glints}
        />
        <Text style={styles.balanceText}>{profile.glints} Glints</Text>
      </View>

      {UPGRADES.map((upgrade) => (
        <UpgradeCard
          key={upgrade.id}
          upgrade={upgrade}
          level={profile[upgrade.id]}
          glints={profile.glints}
          busy={buying === upgrade.id}
          onBuy={() => onBuy(upgrade.id)}
        />
      ))}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, gap: 20 },
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
  message: {
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
});
