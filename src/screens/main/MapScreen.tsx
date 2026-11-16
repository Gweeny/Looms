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
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@/contexte/authContext";
import { createLoom } from "@/services/looms";
import { CompassButton } from "@/components/compassButton";

const CAMERA_PITCH = 40;
const CAMERA_ZOOM = 18.5;

type Nav = StackNavigationProp<RootStackParamList>;

export function MapScreen() {
  const { user } = useAuth();
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const navigation = useNavigation<Nav>();
  const { permission, request, refresh, position, error } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [heading, setHeading] = useState(0);

  async function onCameraSettled() {
    const camera = await mapRef.current?.getCamera();
    if (camera) setHeading(camera.heading);
  }
  const lastUpdate = useRef(0);

  async function onCameraMoving() {
    const now = Date.now();
    if (now - lastUpdate.current < 100) return;
    lastUpdate.current = now;

    const camera = await mapRef.current?.getCamera();
    if (camera) setHeading(camera.heading);
  }

  function resetNorth() {
    mapRef.current?.animateCamera({ heading: 0 }, { duration: 400 });
  }
  async function onTestLoom() {
    if (!user || !position) return;
    try {
      await createLoom({
        authorId: user.uid,
        photoUrl: "https://picsum.photos/400",
        text: "Loom de test",
        latitude: position.latitude,
        longitude: position.longitude,
        durationMinutes: 10,
      });
      setTestStatus("Loom créé");
    } catch (e) {
      console.error(e);
      setTestStatus("Erreur, voir le terminal");
    }
  }
  useEffect(() => {
    if (!position) return;
    mapRef.current?.animateCamera(
      {
        center: { latitude: position.latitude, longitude: position.longitude },
        pitch: CAMERA_PITCH,
        zoom: CAMERA_ZOOM,
      },
      { duration: 1000 },
    );
  }, [position]);

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
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            customMapStyle={MAP_STYLE}
            showsUserLocation
            showsBuildings
            showsCompass={false}
            showsMyLocationButton={false}
            toolbarEnabled={false}
            scrollEnabled={false}
            onRegionChange={onCameraMoving}
            zoomEnabled={false}
            pitchEnabled={false}
            onRegionChangeComplete={onCameraSettled}
            initialCamera={{
              center: {
                latitude: position.latitude,
                longitude: position.longitude,
              },
              pitch: CAMERA_PITCH,
              zoom: CAMERA_ZOOM,
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
        <TouchableOpacity style={styles.container} onPress={onTestLoom}>
          <Text style={styles.text}>Créer un loom test</Text>
        </TouchableOpacity>
        {testStatus ? <Text style={styles.text}>{testStatus}</Text> : null}
      </View>
      <CompassButton heading={heading} onPress={resetNorth} />
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
