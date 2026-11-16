import { type ReactNode, useEffect } from "react";
import {
  AppState,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";

type Props = {
  title: string;
  message: string;
  permission: { granted: boolean; canAskAgain: boolean } | null;
  request: () => Promise<unknown>;
  refresh: () => Promise<unknown>;
  children: ReactNode;
};

export function PermissionGate({
  title,
  message,
  permission,
  request,
  refresh,
  children,
}: Props) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  if (!permission) {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>Vérification...</Text>
      </View>
    );
  }

  if (permission.granted) return <>{children}</>;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{message}</Text>
      {permission.canAskAgain ? (
        <TouchableOpacity style={styles.button} onPress={() => request()}>
          <Text style={styles.buttonText}>Autoriser</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.warning}>
            Permission refusée : seuls les réglages peuvent la rétablir.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.buttonText}>Ouvrir les réglages</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.glints,
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: "center",
  },
  warning: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    fontSize: 16,
  },
});
