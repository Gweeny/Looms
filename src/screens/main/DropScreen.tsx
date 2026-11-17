import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { PermissionGate } from "@/components/permissionGate";
import { useAuth } from "@/contexte/authContext";
import { useLocation } from "@/hooks/useLocation";
import { useActiveLooms } from "@/hooks/useActiveLooms";
import { LOOM_DURATIONS } from "@/constants/looms";
import { getDepositBlockReason } from "@/utils/depositRules";
import { uploadPhoto } from "@/services/cloudinary";
import { createLoom } from "@/services/looms";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import type { RootStackParamList } from "@/types/navigation";
import { distanceMeters } from "@/utils/geo";

type Nav = StackNavigationProp<RootStackParamList>;

const MAX_TEXT_LENGTH = 140;

export function DropScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { position } = useLocation();
  const { looms, loading: loomsLoading, error: loomsError } = useActiveLooms();
  const [submitted, setSubmitted] = useState(false);
  const [permission, request, refresh] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(
    LOOM_DURATIONS[0].minutes,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDepositing = submitting || submitted;

  const blockReason = isDepositing
    ? null
    : loomsError
      ? "Impossible de vérifier les looms autour de toi. Réessaie plus tard."
      : user && position
        ? getDepositBlockReason(position, user.uid, looms)
        : null;

  async function takePhoto() {
    try {
      setError(null);
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
      if (photo?.base64) {
        setPhotoUri(photo.uri);
        setPhotoBase64(photo.base64);
      }
    } catch {
      setError("La photo n'a pas pu être prise. Réessaie.");
    }
  }

  async function submit() {
    if (!user || !position || !photoBase64) return;
    try {
      setSubmitting(true);
      setError(null);
      // La modération du texte sera ajoutée ici, avant l'envoi.
      const photoUrl = await uploadPhoto(photoBase64);

      await createLoom({
        authorId: user.uid,
        photoUrl,
        text: text.trim(),
        latitude: position.latitude,
        longitude: position.longitude,
        durationMinutes,
      });
      setSubmitted(true);
      navigation.popToTop();
    } catch (e) {
      console.error("dépôt:", e);
      setError(
        "Impossible de déposer le loom. Vérifie ta connexion et réessaie.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!position || loomsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.glints} />
        <Text style={styles.hint}>Recherche de ta position…</Text>
      </View>
    );
  }

  if (blockReason) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Dépôt impossible</Text>
        <Text style={styles.hint}>{blockReason}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Map")}
        >
          <Text style={styles.buttonText}>Retour à la carte</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!photoUri) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraFrame}>
          <PermissionGate
            title="Caméra"
            message="Looms utilise la caméra pour prendre la photo de ton loom sur place."
            permission={permission}
            request={request}
            refresh={refresh}
          >
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />
          </PermissionGate>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {permission?.granted ? (
          <TouchableOpacity style={styles.shutter} onPress={takePhoto}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
    >
      <Image source={{ uri: photoUri }} style={styles.preview} />
      <TouchableOpacity
        onPress={() => {
          setPhotoUri(null);
          setPhotoBase64(null);
        }}
        disabled={submitting}
      >
        <Text style={styles.link}>Reprendre la photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Laisse un message (facultatif)"
        placeholderTextColor={Colors.textMuted}
        value={text}
        onChangeText={setText}
        maxLength={MAX_TEXT_LENGTH}
        multiline
      />
      <Text style={styles.counter}>
        {text.length}/{MAX_TEXT_LENGTH}
      </Text>

      <Text style={styles.label}>Durée de vie</Text>
      <View style={styles.durations}>
        {LOOM_DURATIONS.map((option) => {
          const selected = durationMinutes === option.minutes;
          return (
            <TouchableOpacity
              key={option.minutes}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setDurationMinutes(option.minutes)}
              disabled={submitting}
            >
              <Text
                style={[styles.chipLabel, selected && styles.chipLabelSelected]}
              >
                {option.label}
              </Text>
              <Text style={styles.chipGain}>
                {option.glintsPerView} G / vue
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={submit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Envoi…" : "Déposer le loom"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 24,
    textAlign: "center",
  },
  hint: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: "center",
  },
  cameraFrame: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glints,
    overflow: "hidden",
  },
  shutter: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: Colors.glints,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.glints,
  },
  form: { padding: 16, gap: 12 },
  preview: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glints,
  },
  link: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  input: {
    minHeight: 80,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlignVertical: "top",
  },
  counter: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "right",
  },
  label: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
  durations: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  chipSelected: { backgroundColor: Colors.accent, borderColor: Colors.glints },
  chipLabel: { fontFamily: Fonts.regular, color: Colors.text, fontSize: 15 },
  chipLabelSelected: { fontFamily: Fonts.semiBold },
  chipGain: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 16,
    paddingHorizontal: 28,
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
    textAlign: "center",
  },
});
