import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { PermissionGate } from "@/components/permissionGate";
import { useLocation } from "@/hooks/useLocation";

export function MapScreen() {
  const { permission, request, refresh, position, error } = useLocation();

  return (
    <PermissionGate
      title="Position"
      message="Pour accéder à la carte, nous avons besoin de connaître ta position."
      permission={permission}
      request={request}
      refresh={refresh}
    >
      <View style={styles.container}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : position ? (
          <Text style={styles.text}>Permission accordée</Text>
        ) : (
          <Text style={styles.text}>Recherche de ta position…</Text>
        )}
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: {
    fontFamily: Fonts.regular,
    color: Colors.text,
    fontSize: 18,
    textAlign: "center",
  },
  error: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
  },
});
