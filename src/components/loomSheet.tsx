import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import type { Loom } from "@/types/models";
import { GlintsReward } from "./glintRewards";
import { useAuth } from "@/contexte/authContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNow } from "@/hooks/useNow";

type Props = {
  loom: Loom | null;
  reward?: number | null;
  onClose: () => void;
};

export function LoomSheet({ loom, reward = null, onClose }: Props) {
  type ImageState = "loading" | "ready" | "error";
  const { user } = useAuth();
  const { profile, loading: authorLoading } = useUserProfile(loom?.authorId);
  const now = useNow(60_000);
  function formatRemaining(ms: number): string {
    if (ms <= 0) return "Expiré";

    const totalMinutes = Math.ceil(ms / 60_000);
    const days = Math.floor(totalMinutes / 1_440);
    const hours = Math.floor((totalMinutes % 1_440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `Expire dans ${days} j`;
    if (hours > 0) return `Expire dans ${hours} h`;
    return `Expire dans ${minutes} min`;
  }
  const [imageState, setImageState] = useState<ImageState>("loading");

  useEffect(() => {
    setImageState("loading");
  }, [loom?.id]);

  const remaining = loom ? loom.expiresAt.toMillis() - now : 0;

  const authorLabel = !loom
    ? ""
    : loom.authorId === user?.uid
      ? "Déposé par toi"
      : authorLoading
        ? "…"
        : profile
          ? `Déposé par ${profile.pseudo}`
          : "Auteur inconnu";
  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={loom !== null}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={[StyleSheet.absoluteFill, styles.dim]} />
        {loom ? (
          <View style={styles.outer}>
            <View style={styles.inner}>
              <Text style={styles.title}>Un loom caché</Text>

              <View style={styles.photoFrame}>
                <Image
                  source={{ uri: loom.photoUrl }}
                  style={styles.photo}
                  onLoad={() => setImageState("ready")}
                  onError={() => setImageState("error")}
                />
                {imageState === "loading" ? (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator color={Colors.glints} />
                  </View>
                ) : null}
                {imageState === "error" ? (
                  <View style={styles.photoOverlay}>
                    <Text style={styles.hint}>Photo indisponible</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.author}>{authorLabel}</Text>
              <Text style={styles.hint}>
                Vu {loom.views} fois · {formatRemaining(remaining)}
              </Text>
              {loom.text ? (
                <Text style={styles.message}>{loom.text}</Text>
              ) : null}
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <GlintsReward amount={reward} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dim: { backgroundColor: Colors.background, opacity: 0.8 },
  outer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.glints,
    padding: 6,
  },
  inner: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.glints,
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 22,
  },
  photoFrame: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },
  photo: { width: "100%", height: "100%" },
  photoOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontFamily: Fonts.regular,
    color: Colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  hint: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  author: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 15,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
});
