import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { MAP_STYLE } from "@/constants/mapStyle";
import { PermissionGate } from "@/components/permissionGate";
import { DraggableFab } from "@/components/draggableFab";
import { useLocation } from "@/hooks/useLocation";
import type { RootStackParamList } from "@/types/navigation";

type Nav = StackNavigationProp<RootStackParamList>;

export function MapScreen() {
  const navigation = useNavigation<Nav>();
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
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            customMapStyle={MAP_STYLE}
            showsUserLocation
            showsBuildings
            showsCompass={false}
            showsMyLocationButton={false}
            toolbarEnabled={false}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            initialCamera={{
              center: {
                latitude: position.latitude,
                longitude: position.longitude,
              },
              pitch: 0,
              zoom: 17,
              heading: 0,
            }}
          />
        ) : (
          <Text style={styles.text}>Recherche de ta position…</Text>
        )}

        <DraggableFab
          icon="storefront-outline"
          slot={0}
          onPress={() => navigation.navigate("Shop")}
        />
        <DraggableFab
          icon="account-outline"
          slot={1}
          onPress={() => navigation.navigate("Profile")}
        />
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
