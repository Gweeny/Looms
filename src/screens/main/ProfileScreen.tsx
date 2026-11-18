import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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
import { maxActiveLooms } from "@/constants/looms";
import { LoomRow } from "@/components/loomRow";
import { LoomSheet } from "@/components/loomSheet";
import { useAuth } from "@/contexte/authContext";
import { useMyActiveLooms } from "@/hooks/useMyActiveLooms";
import { useNow } from "@/hooks/useNow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { stopBackgroundDiscovery } from "@/services/backgroundDiscovery";
import type { Loom } from "@/types/models";

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
  const {
    looms,
    loading: loomsLoading,
    error: loomsError,
  } = useMyActiveLooms();
  const now = useNow(30000);
  const [selected, setSelected] = useState<Loom | null>(null);
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
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Mes looms actifs ({looms.length}/
            {maxActiveLooms(profile.slotsLevel)})
          </Text>
          {loomsLoading ? (
            <ActivityIndicator color={Colors.glints} />
          ) : loomsError ? (
            <Text style={styles.error}>{loomsError}</Text>
          ) : looms.length === 0 ? (
            <Text style={styles.hint}>
              Aucun loom actif. Dépose-en un depuis la carte !
            </Text>
          ) : (
            looms.map((loom) => (
              <LoomRow
                key={loom.id}
                loom={loom}
                now={now}
                onPress={() => setSelected(loom)}
              />
            ))
          )}
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
      </ScrollView>

      <LoomSheet loom={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, gap: 28 },
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
  pseudo: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 26 },
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
  statValue: { fontFamily: Fonts.semiBold, color: Colors.glints, fontSize: 28 },
  statLabel: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 13,
  },
  section: { gap: 12 },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 18,
  },
  hint: { fontFamily: Fonts.regular, color: Colors.textMuted, fontSize: 15 },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 16 },
  error: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
  },
});
