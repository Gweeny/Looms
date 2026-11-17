import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { useAuth } from "@/contexte/authContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { stopBackgroundDiscovery } from "@/services/backgroundDiscovery";

type StatProps = {
  label: string;
  value: number;
};

function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile(user?.uid);
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    if (signingOut) return;
    try {
      setSigningOut(true);
      await stopBackgroundDiscovery();
    } catch (e) {
      console.error("arrêt tâche de fond:", e);
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error("déconnexion:", e);
      setSigningOut(false);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.pseudo.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.pseudo}>{profile.pseudo}</Text>
        <View style={styles.balance}>
          <MaterialCommunityIcons
            name="star-four-points-outline"
            size={22}
            color={Colors.glints}
          />
          <Text style={styles.balanceText}>{profile.glints} Glints</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label="Déposés" value={profile.loomsDeposed} />
        <Stat label="Découverts" value={profile.loomsDiscovered} />
        <Stat label="Vues reçues" value={profile.totalViews} />
      </View>

      <TouchableOpacity
        style={[styles.button, signingOut && styles.buttonDisabled]}
        onPress={onSignOut}
        disabled={signingOut}
      >
        <Text style={styles.buttonText}>
          {signingOut ? "Déconnexion…" : "Se déconnecter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    gap: 32,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: { alignItems: "center", gap: 12 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glints,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 40,
  },
  pseudo: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 26,
  },
  balance: { flexDirection: "row", alignItems: "center", gap: 8 },
  balanceText: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 20,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 20,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 28,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
  error: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
  },
});
